# Chatnamer · Deployment guide

An editorial AI naming engine built on the Tanj design system.
Production deploy targets **GitHub** (source) + **Cloudflare Pages** (host +
Pages Function proxying to Anthropic). No build step.

---

## Architecture

```
chatnamer.com                                ← Cloudflare Pages, custom domain
├─ index.html                ← production entry  ⬅ what users see
├─ Chatnamer v3 — Tanj.co reskin.html         ← design-canvas review build
├─ Chatnamer v2.html / DirectionA/B/C/D.jsx   ← earlier design explorations
│
├─ claude-shim.js            ← installs window.claude.complete in production
├─ functions/api/complete.js ← Cloudflare Pages Function (Anthropic proxy)
│
├─ app/                      ← React components, compiled in-browser by Babel
│   ├─ data.jsx              ← the 8 questions + chips
│   ├─ engine.jsx            ← useChatnamer hook + AI prompts
│   ├─ atoms.jsx             ← v2 shared atoms (still used for NameDetail etc.)
│   ├─ NameDetail.jsx        ← deep-dive overlay, refine block, export modal
│   └─ v3/
│       ├─ tokens.css        ← Saira Condensed + DM Sans + JetBrains Mono
│       ├─ atoms.jsx         ← reskinned atoms (KickerV3, StairV3, etc.)
│       ├─ feedback.jsx      ← thumbs-up/down → Tanj CTA modal
│       └─ DirectionE.jsx    ← the production screen
│
├─ assets/                   ← logo (orange / white / gray)
├─ colors_and_type.css       ← Tanj base tokens
│
├─ _headers                  ← Cloudflare Pages caching + security headers
├─ wrangler.toml.example     ← local-dev config (rename to wrangler.toml)
└─ .dev.vars.example         ← local-dev secrets template
```

Everything is plain HTML + Babel-in-browser. The Pages Function is the only
server-side code.

---

## Quick deploy — checklist

1. ✅ Push to GitHub
2. ✅ Create a Cloudflare Pages project, connect the repo
3. ✅ Add `ANTHROPIC_API_KEY` (and optionally `ALLOWED_ORIGINS`) in Pages settings
4. ✅ Trigger a redeploy
5. ✅ (Optional) Point a custom domain
6. ✅ (Recommended) Add a Cloudflare WAF rate-limiting rule on `/api/complete`

Detailed walkthrough below.

---

## 1 · Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Chatnamer v3 — initial commit"
git branch -M main
git remote add origin git@github.com:<your-user>/<your-repo>.git
git push -u origin main
```

If you're starting from a downloaded zip, the same commands work after you
`cd` into the folder.

**Confirm `.gitignore` is doing its job before pushing** — it should already
exclude `.dev.vars`, `.env`, `node_modules/`, `.wrangler/`. Run `git status`
and check no file with `KEY`, `SECRET`, or `.env` in the name is staged.

---

## 2 · Create the Cloudflare Pages project

You'll need a Cloudflare account (free tier is fine).

1. Log in → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick your GitHub repo and click **Begin setup**.
3. On the build configuration screen:
   - **Project name:** `chatnamer` (this becomes `chatnamer.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** *None*
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (or leave blank)
   - **Root directory:** *(leave blank)*
4. Click **Save and Deploy**.

The first deploy will succeed but the AI calls will fail until you set the
API key in step 3.

---

## 3 · Set the Anthropic API key

In your Pages project → **Settings → Environment variables**.

Add these under **Production**:

| Variable name        | Value                                          | Type   |
|----------------------|-------------------------------------------------|--------|
| `ANTHROPIC_API_KEY`  | `sk-ant-...` from console.anthropic.com         | Secret |
| `ALLOWED_ORIGINS`    | `https://chatnamer.com,https://www.chatnamer.com` (your live domain(s)) | Plaintext |
| `IP_WINDOW_MAX`      | `20` *(optional — requests per window per IP)*  | Plaintext |
| `IP_WINDOW_SEC`      | `600` *(optional — window in seconds, default 10 min)* | Plaintext |

**About `ALLOWED_ORIGINS`** — if unset, the function falls back to a same-host
check, which works for the default `*.pages.dev` URL but blocks calls from
any other origin. Once you wire up your custom domain, set this so the
preview URLs can't be abused.

You can also add the same vars under **Preview** if you want the
auto-deployed preview branches to work. For Production-only deploys leave
Preview empty (preview branches will hit the API and 500 — that's fine).

**Redeploy** so the function picks up the new env vars:
Deployments → ⋯ next to the latest → **Retry deployment**.

---

## 4 · (Optional) Custom domain

In the Pages project → **Custom domains** → **Set up a custom domain**.

- If your domain is on Cloudflare → it's a one-click DNS update.
- If your domain is elsewhere → Cloudflare gives you a CNAME to add at
  your registrar.

DNS propagation usually takes 1–10 minutes. SSL is automatic.

**After the custom domain resolves, update `ALLOWED_ORIGINS`** with both
the apex and `www`, then redeploy.

---

## 5 · (Strongly recommended) Cloudflare WAF rate-limit

The Pages Function has a soft in-memory per-IP rate limit, but Cloudflare's
edge WAF rule is the real protection layer.

Cloudflare dashboard → your domain → **Security → WAF → Rate-limiting rules**
→ **Create rule**:

| Field          | Value                                           |
|----------------|-------------------------------------------------|
| Rule name      | `chatnamer-api`                                 |
| If expression  | `(http.request.uri.path eq "/api/complete")`    |
| Characteristics| `IP address`                                    |
| Requests       | `15` *(adjust to taste)*                        |
| Period         | `1 minute`                                      |
| Action         | `Block` (or `Challenge`)                        |
| Duration       | `10 minutes`                                    |

The free plan gives you one rule — exactly what we need.

---

## 6 · (Optional) Cloudflare Turnstile

If the rate-limiter alone isn't enough (you start seeing scripted abuse),
add Turnstile as a free, invisible captcha:

1. Cloudflare → **Turnstile** → **Add Site** → pick the **Invisible** widget.
2. Note the `Site Key` and `Secret Key`.
3. Add the Turnstile widget on `index.html` and forward the token to the
   function (small client change).
4. In `functions/api/complete.js`, validate the token via
   `https://challenges.cloudflare.com/turnstile/v0/siteverify` before
   calling Anthropic.

This isn't wired up by default — yell if you want it added.

---

## 7 · (Optional) Daily budget cap (KV)

There's a budget-cap block in `functions/api/complete.js` (commented out).
Enable it for a hard daily ceiling backed by Cloudflare KV:

```bash
# install wrangler once if you haven't
npm install -g wrangler

# create a KV namespace
wrangler kv:namespace create BUDGET_KV
# → it prints { binding = "BUDGET_KV", id = "<some-id>" }
```

Then in the Pages dashboard:

1. Settings → **Functions** → **KV namespace bindings** → **Add binding**.
2. **Variable name:** `BUDGET_KV`. **KV namespace:** the one you just made.
3. Add env var `DAILY_REQUEST_CAP=500` (or whatever you want).
4. Open `functions/api/complete.js` and **uncomment** the `BUDGET_KV` block
   (search for `Optional Daily budget`).
5. Commit + push → Pages redeploys.

When the daily cap is hit, the function returns HTTP 429 with
`{ error: "Daily request cap reached..." }` until UTC midnight.

---

## Cost & safety summary

Here's what's already in place to keep your Anthropic bill predictable:

| Layer            | What it does                                                       |
|------------------|--------------------------------------------------------------------|
| Model whitelist  | Only `claude-haiku-4-5` is allowed server-side — no Sonnet/Opus    |
| Output cap       | Hard ceiling of **700 tokens** per response regardless of client   |
| Body cap         | Rejects requests > **8 KB**                                        |
| Message cap      | Rejects payloads with > 8 messages or per-message > 6 KB of text   |
| Origin allow-list| Calls from other origins blocked (`ALLOWED_ORIGINS`)               |
| Per-IP rate      | ~20 req / 10 min in-memory (soft floor; Worker restarts reset it)  |
| WAF rate-limit   | Edge enforcement — recommended in step 5                           |
| Daily cap        | Optional KV-backed hard ceiling — step 7                           |

A typical Chatnamer round uses ~1 input call to `aiGenerateNames` and
~1–3 calls to `aiGenerateChips`. With Haiku 4.5 pricing (~$1/MTok in,
$5/MTok out), a heavy user session costs roughly **$0.02–0.05**. The above
limits make worst-case daily spend bounded.

---

## Local dev (optional)

If you want to run the Pages Function locally:

```bash
npm install -g wrangler

cp wrangler.toml.example wrangler.toml
cp .dev.vars.example .dev.vars
# → edit .dev.vars and paste your real ANTHROPIC_API_KEY

wrangler pages dev .
```

Open `http://localhost:8788`. Wrangler will load `.dev.vars` automatically.
Neither file is committed (both are in `.gitignore`).

The original artifact preview (the design canvas .html files) also works —
in that environment `window.claude.complete` is provided by the host, so
the shim no-ops and the Pages Function isn't needed.

---

## Verifying the deploy

Once Pages reports the deploy is live, hit your domain and:

1. The page loads to "CHATNAMER" + "EIGHT QUESTIONS. ONE SHARP BRIEF."
2. Answer the first question and click **Next question →** — should not error.
3. Last question → **Generate names →** — names should fill the right rail.
   - If you get mock-looking names ("Halcyon", "Mercer", "Tessera"…) the
     function is failing silently. Check **Pages → Functions → Logs** for the
     real error.
4. After ~2 minutes the **"How's it going?"** modal fires. Hitting either
   thumb takes you to `tanj.co/contact`.

### Debugging API failures

`Pages → your project → Deployments → ⋯ → View details → Functions logs`
shows live invocation logs. Common issues:

| Symptom                                | Likely cause                                                    |
|----------------------------------------|------------------------------------------------------------------|
| Names are always the same fallbacks    | Function 4xx/5xx — check logs                                    |
| `Origin not allowed`                   | `ALLOWED_ORIGINS` doesn't match your domain — update + redeploy  |
| `Server misconfigured`                 | `ANTHROPIC_API_KEY` not set in Production env                    |
| `Upstream rate limited`                | Anthropic itself is rate-limiting — usually transient            |
| `Rate limit: too many requests`        | Per-IP limit hit (default 20/10min) — bump `IP_WINDOW_MAX`       |
| 401 from Anthropic                     | API key is wrong / revoked                                       |

---

## What to edit when

| Want to change…              | Edit…                                          |
|------------------------------|------------------------------------------------|
| Questions / chips            | `app/data.jsx`                                 |
| Name generation prompt       | `app/engine.jsx` → `aiGenerateNames`           |
| Deep-dive prompt             | `app/engine.jsx` → `loadDepth`                 |
| Production layout / copy     | `app/v3/DirectionE.jsx`                        |
| Feedback CTA copy / timer    | `app/v3/feedback.jsx` (copy) + `index.html` (timer) |
| Type / colors                | `app/v3/tokens.css` + `colors_and_type.css`    |
| API caps / rate limits       | `functions/api/complete.js` (constants at top) |
| Caching / security headers   | `_headers`                                     |

---

## Files NOT to commit

Already covered by `.gitignore`:

- `.dev.vars` — local secrets
- `.env` / `.env.*`
- `wrangler.toml` — if you create one, it may contain KV namespace IDs
- `node_modules/`, `.wrangler/`

Sanity check: run `git status` before every push. If you see a key file
listed, stop and fix the gitignore.

---

## Support

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Anthropic API docs: https://docs.anthropic.com/en/api/
- Tanj contact: https://tanj.co/contact
