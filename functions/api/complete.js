/**
 * Cloudflare Pages Function — Anthropic proxy (hardened for production).
 *
 * POST /api/complete
 *   body: { prompt: string } OR { messages: [{role, content}, ...] }
 *   optional client fields: { model, max_tokens, system }
 *
 * Returns: { text: string, model, usage } | { error: string }
 *
 * Required env var (set in Cloudflare Pages → Settings → Environment variables):
 *   ANTHROPIC_API_KEY = sk-ant-…              (type: Secret)
 *
 * Optional env vars:
 *   ALLOWED_ORIGINS  = https://chatnamer.com,https://www.chatnamer.com
 *                       (comma-separated; if unset, the function falls back to a
 *                        same-origin check against the request's Host header.
 *                        Always leave the *.pages.dev preview URL out unless you
 *                        intentionally want previews to call the API.)
 *   IP_WINDOW_SEC    = 600     (window for per-IP rate limit, default 600)
 *   IP_WINDOW_MAX    = 20      (requests per window per IP, default 20)
 *
 * Optional KV-based daily budget cap (uncomment the BUDGET section below
 * and bind a KV namespace named `BUDGET_KV` in the Pages project):
 *   DAILY_REQUEST_CAP = 500   (hard daily cap, default 500)
 */

// ── Hard server-side caps (clients cannot override) ─────────────────
const ALLOWED_MODELS  = ['claude-opus-4-7'];   // cheapest model only
const DEFAULT_MODEL   = 'claude-opus-4-7';
const MAX_TOKENS_OUT  = 700;                    // hard ceiling on output
const DEFAULT_MAX_TOK = 700;
const MAX_BODY_BYTES  = 8 * 1024;               // reject oversize requests
const MAX_PROMPT_CHARS = 6000;                  // per prompt/message
const MAX_MESSAGES    = 8;                      // per request

// ── Naive in-memory IP rate limit (per-isolate; best-effort floor) ──
// For stronger protection, add a Cloudflare WAF rate-limiting rule on
// /api/complete (Security → WAF → Rate-limiting rules).
const ipBuckets = new Map(); // ip → { count, resetAt }

function ipLimit(ip, windowSec, maxN) {
  const now = Date.now();
  const cur = ipBuckets.get(ip);
  if (!cur || now > cur.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true };
  }
  if (cur.count >= maxN) {
    return { ok: false, retryInSec: Math.ceil((cur.resetAt - now) / 1000) };
  }
  cur.count += 1;
  return { ok: true };
}

// ── Main handler ────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const { request, env } = context;

  // 1) API key present?
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: 'Server misconfigured: ANTHROPIC_API_KEY not set.' }, 500);
  }

  // 2) Origin check — allow same-origin OR explicit allow-list.
  const origin = request.headers.get('origin') || '';
  const host = request.headers.get('host') || '';
  const allowedOrigins = (env.ALLOWED_ORIGINS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  let originOk = false;
  if (allowedOrigins.length) {
    originOk = allowedOrigins.includes(origin);
  } else {
    // Same-origin fallback: empty Origin (same-origin POST) or host match.
    originOk = !origin || (() => {
      try { return new URL(origin).host === host; } catch (_) { return false; }
    })();
  }
  if (!originOk) return json({ error: 'Origin not allowed.' }, 403);

  // 3) Body size guard (read as text first so we can measure).
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'Request body too large.' }, 413);
  }

  let body;
  try { body = JSON.parse(raw); } catch (_) {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  // 4) Per-IP rate limit.
  const ip = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || 'unknown';
  const win = Number(env.IP_WINDOW_SEC) || 600;
  const max = Number(env.IP_WINDOW_MAX) || 20;
  const lim = ipLimit(ip, win, max);
  if (!lim.ok) {
    return json({
      error: `Rate limit: too many requests. Try again in ${lim.retryInSec}s.`,
    }, 429);
  }

  // 5) Validate + normalize payload.
  const {
    prompt,
    messages,
    model: modelIn = DEFAULT_MODEL,
    max_tokens: maxTokIn = DEFAULT_MAX_TOK,
    system,
  } = body || {};

  const model = ALLOWED_MODELS.includes(modelIn) ? modelIn : DEFAULT_MODEL;
  const max_tokens = Math.min(
    Math.max(64, Number(maxTokIn) || DEFAULT_MAX_TOK),
    MAX_TOKENS_OUT,
  );

  // Build messages array; enforce per-message and count limits.
  let msgs = null;
  if (Array.isArray(messages) && messages.length) {
    if (messages.length > MAX_MESSAGES) {
      return json({ error: `Too many messages (max ${MAX_MESSAGES}).` }, 400);
    }
    msgs = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string'
        ? m.content.slice(0, MAX_PROMPT_CHARS)
        : '',
    })).filter((m) => m.content.length);
  } else if (typeof prompt === 'string' && prompt.length) {
    msgs = [{ role: 'user', content: prompt.slice(0, MAX_PROMPT_CHARS) }];
  }
  if (!msgs || !msgs.length) {
    return json({ error: 'Provide either "prompt" (string) or "messages" (array).' }, 400);
  }

  const payload = { model, max_tokens, messages: msgs };
  if (typeof system === 'string' && system.length) {
    payload.system = system.slice(0, MAX_PROMPT_CHARS);
  }

  // 6) (Optional) Daily budget cap — uncomment + bind a KV namespace
  //    named BUDGET_KV in the Pages project to enable.
  /*
  if (env.BUDGET_KV) {
    const cap = Number(env.DAILY_REQUEST_CAP) || 500;
    const dayKey = 'count:' + new Date().toISOString().slice(0, 10);
    const cur = Number((await env.BUDGET_KV.get(dayKey)) || 0);
    if (cur >= cap) {
      return json({ error: 'Daily request cap reached. Try again tomorrow.' }, 429);
    }
    // Best-effort increment (eventually consistent).
    context.waitUntil(env.BUDGET_KV.put(dayKey, String(cur + 1), { expirationTtl: 86400 * 2 }));
  }
  */

  // 7) Call Anthropic.
  let apiRes;
  try {
    apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return json({ error: 'Upstream fetch failed.' }, 502);
  }

  if (!apiRes.ok) {
  let status = apiRes.status;
  let detail = '';

  try {
    detail = await apiRes.text();
  } catch (e) {}

  return json({
    error: 'Upstream error (' + status + ')',
    detail
  }, status);
}

  let data;
  try { data = await apiRes.json(); } catch (_) {
    return json({ error: 'Bad upstream response.' }, 502);
  }

  const text = Array.isArray(data.content)
    ? data.content.filter((b) => b && b.type === 'text').map((b) => b.text).join('')
    : '';

  return json({ text, model: data.model, usage: data.usage });
}

// Reject non-POST methods.
export async function onRequest(context) {
  if (context.request.method === 'POST') return onRequestPost(context);
  return new Response('Method not allowed', { status: 405 });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
