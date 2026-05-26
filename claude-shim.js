/* ------------------------------------------------------------------
   Claude shim.
   - If window.claude.complete already exists (i.e. we're running inside
     the artifact preview), do nothing.
   - Otherwise (production: GitHub Pages, Cloudflare Pages, etc.),
     install a stub that POSTs to /api/complete — a Cloudflare Pages
     Function (functions/api/complete.js) that proxies to Anthropic.
   Same call signature as the host's:
     await window.claude.complete("prompt string")
     await window.claude.complete({ messages: [...] })
   Returns the raw assistant text.
   ------------------------------------------------------------------ */
(function () {
  if (window.claude && typeof window.claude.complete === 'function') return;

  async function complete(arg) {
    const payload = typeof arg === 'string'
      ? { prompt: arg }
      : (arg && typeof arg === 'object' ? arg : { prompt: String(arg) });

    let res;
    try {
      res = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      throw new Error('claude.complete network error: ' + e.message);
    }

    if (!res.ok) {
      let detail = '';
      try { detail = (await res.text()).slice(0, 200); } catch (_) {}
      throw new Error('claude.complete HTTP ' + res.status + (detail ? ' — ' + detail : ''));
    }

    const data = await res.json().catch(() => ({}));
    // The Function returns { text: "..." } on success.
    if (typeof data.text === 'string') return data.text;
    if (data.error) throw new Error('claude.complete: ' + data.error);
    return '';
  }

  window.claude = Object.assign(window.claude || {}, { complete });
})();
