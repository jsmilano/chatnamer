/* ------------------------------------------------------------------
   NameDetail overlay & RefineBlock
   Full-bleed editorial detail panel for a single name + the
   round-02 refinement input block.
   ------------------------------------------------------------------ */

// ── NameDetail overlay ────────────────────────────────────────────
function NameDetail({ cn, accent = 'var(--orange)' }) {
  const n = cn.detailName;
  const depth = n ? cn.depthCache[n.id] : null;
  const loading = cn.depthLoading && !depth;

  React.useEffect(() => {
    if (n) cn.loadDepth(n);
  }, [n && n.id]);

  if (!n) return null;

  const fg = 'var(--off-white)';
  const muted = 'rgba(245,242,238,0.55)';
  const ink = 'rgba(245,242,238,0.78)';
  const rule = 'rgba(245,242,238,0.10)';

  const placeholder = (s) =>
    <span style={{ color: muted, fontStyle: 'italic' }}>{s}</span>;

  return (
    <div data-name-detail style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'var(--black)', color: fg,
      animation: 'fadeUp 0.32s cubic-bezier(0.16,1,0.3,1) both',
      display: 'flex', flexDirection: 'column',
    }}>
      <TBarField opacity={0.045}/>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 28px',
        height: 52, borderBottom: '1px solid ' + rule,
        position: 'relative', zIndex: 1,
      }}>
        <button onClick={cn.closeDetail}
          style={{ appearance: 'none', background: 'transparent', border: 'none',
                   cursor: 'pointer', padding: 0,
                   fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                   letterSpacing: '0.14em', textTransform: 'uppercase',
                   color: muted, transition: 'color .2s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = muted; }}>
          ← Back to list
        </button>
        <span style={{ width: 1, height: 18, background: rule, margin: '0 18px' }}/>
        <Kicker color={accent}>
          Deep dive · {n.kind}{n.round ? ' · Round ' + String(n.round).padStart(2,'0') : ''}
        </Kicker>
        <span style={{ flex: 1 }}/>
        <button onClick={() => cn.toggleSave(n.id)}
          style={{ appearance: 'none', background: 'transparent', border: '1px solid ' + (cn.saved.has(n.id) ? accent : rule),
                   cursor: 'pointer', padding: '8px 14px',
                   fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                   letterSpacing: '0.14em', textTransform: 'uppercase',
                   color: cn.saved.has(n.id) ? accent : fg,
                   display: 'inline-flex', alignItems: 'center', gap: 8,
                   transition: 'border-color .2s ease, color .2s ease' }}>
          <StarIcon filled={cn.saved.has(n.id)} dark accent={accent} size={11}/>
          {cn.saved.has(n.id) ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1,
                    padding: '48px 72px 56px',
                    display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48 }}>
        {/* LEFT — editorial */}
        <div>
          <Kicker color={muted}>The name</Kicker>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                       fontSize: 120, lineHeight: 0.9, letterSpacing: -0.5,
                       color: fg, marginTop: 14 }}>
            {n.name}
          </h1>
          {n.etymology && (
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                          fontSize: 18, color: muted, marginTop: 14, maxWidth: 480 }}>
              {n.etymology}
            </div>
          )}

          <div style={{ marginTop: 48 }}>
            <Kicker color={accent}>Why it works</Kicker>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.65,
                        color: ink, marginTop: 12, maxWidth: 540 }}>
              {loading ? placeholder('Reading the brief, judging the mark…') :
                (depth?.why || n.rationale || '—')}
            </p>
          </div>

          <div style={{ marginTop: 36 }}>
            <Kicker color={muted}>What it suggests</Kicker>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {loading && placeholder('…')}
              {!loading && (depth?.suggests || []).map((s, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.04em', color: fg,
                  border: '1px solid ' + rule, padding: '8px 14px',
                }}>{s}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 36 }}>
            <Kicker color={muted}>Use it in a sentence</Kicker>
            <blockquote style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                                  fontWeight: 400, fontSize: 28, lineHeight: 1.3,
                                  color: fg, marginTop: 14, paddingLeft: 18,
                                  borderLeft: '3px solid ' + accent, maxWidth: 540 }}>
              {loading ? placeholder('Drafting…') : ('"' + (depth?.sentence || '') + '"')}
            </blockquote>
          </div>

          <div style={{ marginTop: 36 }}>
            <Kicker color={muted}>The trade-off</Kicker>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65,
                        color: ink, marginTop: 10, maxWidth: 520 }}>
              {loading ? placeholder('…') : (depth?.risk || 'No major flag.')}
            </p>
          </div>
        </div>

        {/* RIGHT — clearance */}
        <div>
          <div style={{ border: '1px solid ' + rule, padding: '24px 24px 20px' }}>
            <Kicker color={accent}>Clearance</Kicker>
            <div style={{ marginTop: 14 }}>
              {(depth?.domains || [
                { tld: '.com', status: n.domain?.com === 'open' ? 'open' : 'taken' },
                ...(n.domain?.alt ? [{ tld: n.domain.alt.split(' ')[0], status: 'open' }] : []),
              ]).map((d, i) => {
                const open = d.status === 'open';
                const premium = d.status === 'premium';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'baseline',
                    padding: '10px 0',
                    borderBottom: '1px solid ' + rule,
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18,
                                   color: fg, flex: 1 }}>
                      {n.name.toLowerCase()}<span style={{ color: muted }}>{d.tld}</span>
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: open ? accent : premium ? muted : 'rgba(245,242,238,0.30)',
                    }}>
                      {open ? '● open' : premium ? '◐ premium' : '○ taken'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18,
                          display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <Kicker color={muted}>Trademark</Kicker>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
                             letterSpacing: '0.12em', textTransform: 'uppercase',
                             color: n.trademark === 'clear' ? accent :
                                    n.trademark === 'risky' ? 'rgba(245,242,238,0.7)' : muted }}>
                {(n.trademark || 'CLEAR').toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <Kicker color={muted}>Sounds like</Kicker>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {loading && placeholder('…')}
              {!loading && (depth?.sounds || []).map((s, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 16, color: ink,
                  padding: '4px 0', marginRight: 6,
                }}>{s}{i < (depth?.sounds || []).length - 1 && <span style={{color: muted}}>,</span>}</span>
              ))}
            </div>
          </div>

          {/* Brief recap */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid ' + rule }}>
            <Kicker color={muted}>From the brief</Kicker>
            <div style={{ marginTop: 12 }}>
              {cn.questions.filter((q) => cn.answers[q.id]).map((q) => (
                <div key={q.id} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 9,
                                fontWeight: 700, letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: muted, marginBottom: 2 }}>
                    {q.id}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
                                color: ink }}>{cn.answers[q.id]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RefineBlock ────────────────────────────────────────────────────
// Inline block that appears in the conversation column after a results
// round, asking the user to refine for round 02.
function RefineBlock({ cn, accent = 'var(--orange)', dark = true, density = 'editorial' }) {
  const [value, setValue] = React.useState('');
  const muted = dark ? 'rgba(245,242,238,0.55)' : 'rgba(17,17,17,0.45)';
  const fg = dark ? 'var(--off-white)' : 'var(--black)';
  const rule = dark ? 'rgba(245,242,238,0.10)' : 'rgba(17,17,17,0.10)';

  const savedList = cn.savedNames;
  const nextRound = String((cn.round || 1) + 1).padStart(2, '0');

  const submit = () => {
    if (!value.trim()) return;
    cn.generate({ refinement: value.trim() });
  };

  return (
    <div style={{
      marginTop: 24, paddingTop: 28,
      borderTop: '1px solid ' + rule,
      animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <Kicker color={accent}>Refine · Round {nextRound}</Kicker>
      <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                   fontWeight: 400, fontSize: density === 'compact' ? 38 : 52,
                   lineHeight: 0.98, color: fg, marginTop: 12, maxWidth: 580 }}>
        What's pulling you in?
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6,
                  color: muted, marginTop: 14, maxWidth: 520 }}>
        Tell us what's working and what to push harder on. We'll mine your saves and
        push the next eight further.
      </p>

      {savedList.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: muted, marginBottom: 8 }}>
            Saved so far · {savedList.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {savedList.map((n) => (
              <span key={n.id} style={{
                fontFamily: 'var(--font-display)', fontSize: 18, color: fg,
                borderBottom: '2px solid ' + accent, paddingBottom: 2,
              }}>{n.name}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, maxWidth: 640 }}>
        <textarea autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="More tactile. Lean compound. Drop anything that sounds like a SaaS startup…"
          rows={3}
          className={dark ? 'dark' : ''}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 400,
            fontSize: 22, lineHeight: 1.35,
            color: fg,
            borderLeft: '3px solid ' + accent,
            paddingLeft: 18, paddingTop: 2,
            caretColor: accent,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 22 }}>
        <PrimaryBtn onClick={submit} disabled={!value.trim()} dark={dark} accent={accent}>
          Generate round {nextRound} →
        </PrimaryBtn>
        <SecondaryBtn onClick={cn.cancelRefinement} dark={dark} accent={accent}>
          Cancel
        </SecondaryBtn>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                       letterSpacing: '0.14em', textTransform: 'uppercase',
                       color: muted }}>
          ⌘ + ↩ to run
        </span>
      </div>
    </div>
  );
}

// ── SavedTray ────────────────────────────────────────────────────────
// A compact strip of saved names at the top of the names rail.
function SavedTray({ cn, accent = 'var(--orange)', onExport }) {
  const list = cn.savedNames;
  if (!list.length) return null;

  return (
    <div style={{
      padding: '14px 16px', marginBottom: 18,
      background: 'rgba(255,70,28,0.05)',
      borderLeft: '2px solid ' + accent,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <Kicker color={accent}>★ Saved · {list.length}</Kicker>
        <span style={{ flex: 1 }}/>
        <button onClick={onExport}
          style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                   padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                   letterSpacing: '0.14em', textTransform: 'uppercase',
                   color: 'rgba(17,17,17,0.55)' }}>
          Copy all →
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((n) => (
          <button key={n.id} onClick={() => cn.openDetail(n.id)}
            style={{ appearance: 'none', background: 'var(--warm-white)',
                     border: '1px solid rgba(17,17,17,0.10)',
                     cursor: 'pointer', padding: '5px 9px',
                     fontFamily: 'var(--font-display)', fontSize: 14,
                     color: 'var(--black)', lineHeight: 1,
                     display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
            {n.name}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, fontWeight: 700,
                           letterSpacing: '0.12em', color: accent }}>R{n.round || 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ToastHost ────────────────────────────────────────────────────────
// Tiny ephemeral notification (used for "copied" feedback).
function useToast() {
  const [msg, setMsg] = React.useState(null);
  const show = React.useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 1800);
  }, []);
  const view = msg ? (
    <div style={{
      position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--black)', color: 'var(--off-white)',
      padding: '12px 22px',
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      borderRadius: 0, zIndex: 50,
      animation: 'fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
    }}>{msg}</div>
  ) : null;
  return [view, show];
}

Object.assign(window, { NameDetail, RefineBlock, SavedTray, useToast, ExportModal });

// ── ExportModal ──────────────────────────────────────────────────────
// Full-coverage modal showing the export text in a selectable textarea.
// Triggered by cn.exportText being non-null; always works regardless of
// whether clipboard API succeeded.
function ExportModal({ cn, accent = 'var(--orange)' }) {
  const e = cn.exportText;
  const taRef = React.useRef(null);

  React.useEffect(() => {
    if (e && taRef.current) {
      // Pre-select all so ⌘+C is one step.
      taRef.current.focus();
      taRef.current.select();
    }
  }, [e && e.text]);

  if (!e) return null;

  const recopy = async () => {
    try {
      if (taRef.current) {
        taRef.current.focus();
        taRef.current.select();
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(e.text);
        } else {
          document.execCommand('copy');
        }
      }
    } catch (err) { /* user can still ⌘+C */ }
  };

  return (
    <div onClick={cn.closeExport} style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(17,17,17,0.78)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 48,
      animation: 'fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{
        background: 'var(--warm-white)', color: 'var(--black)',
        width: 'min(640px, 100%)', maxHeight: '100%',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
      }}>
        <div style={{ padding: '20px 24px 14px',
                      borderBottom: '1px solid var(--rule)',
                      display: 'flex', alignItems: 'center', gap: 14 }}>
          <Kicker color={accent}>{e.copied ? 'Copied · ' + e.count + ' names' : 'Ready to copy'}</Kicker>
          <span style={{ flex: 1 }}/>
          <button onClick={cn.closeExport}
            style={{ appearance: 'none', background: 'transparent', border: 'none',
                     cursor: 'pointer', padding: 0,
                     fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                     letterSpacing: '0.14em', textTransform: 'uppercase',
                     color: 'rgba(17,17,17,0.5)' }}>Close ✕</button>
        </div>

        <div style={{ padding: '18px 24px 6px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 16, color: 'var(--ink)', maxWidth: 520, lineHeight: 1.4 }}>
            {e.copied
              ? 'On your clipboard. Or grab it again below — press ⌘+C / Ctrl+C.'
              : 'Clipboard was blocked. The text is selected — press ⌘+C / Ctrl+C to copy.'}
          </p>
        </div>

        <textarea ref={taRef} readOnly value={e.text}
          style={{ margin: '12px 24px 18px', flex: 1, minHeight: 240,
                   border: '1px solid var(--rule)', background: 'var(--off-white)',
                   fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                   fontSize: 12, lineHeight: 1.55, color: 'var(--ink)',
                   padding: '14px 16px', resize: 'vertical', outline: 'none' }}
          onClick={(ev) => ev.currentTarget.select()}/>

        <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10 }}>
          <PrimaryBtn onClick={recopy} accent={accent}>
            {e.copied ? 'Copy again' : 'Copy now'}
          </PrimaryBtn>
          <SecondaryBtn onClick={cn.closeExport}>Done</SecondaryBtn>
        </div>
      </div>
    </div>
  );
}
