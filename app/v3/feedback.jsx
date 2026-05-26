/* ------------------------------------------------------------------
   Chatnamer v3 — Feedback CTA modal
   Fires after a delay (default 90s) once per session.
   Thumbs-up / thumbs-down → personalized copy → big CTA to Tanj.co.
   ------------------------------------------------------------------ */

function FeedbackModalV3({
  delayMs = 90000,
  open: openProp = null,         // null = auto-trigger via timer; bool = controlled
  onClose,
  onTrigger,                      // fires when timer first opens it
  accent = 'var(--v3-orange)'
}) {
  const [open, setOpen] = React.useState(false);
  const [vote, setVote] = React.useState(null);  // 'up' | 'down' | null
  const [dismissed, setDismissed] = React.useState(false);
  const firedRef = React.useRef(false);

  // Auto-trigger via timer (only when uncontrolled)
  React.useEffect(() => {
    if (openProp !== null) return;
    if (firedRef.current) return;
    const t = setTimeout(() => {
      if (dismissed) return;
      firedRef.current = true;
      setOpen(true);
      onTrigger && onTrigger();
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs, dismissed, openProp, onTrigger]);

  // Controlled mode
  React.useEffect(() => {
    if (openProp === null) return;
    setOpen(openProp);
    if (openProp) { setVote(null); }
  }, [openProp]);

  const close = () => {
    setOpen(false);
    setDismissed(true);
    onClose && onClose();
  };

  if (!open) return null;

  const ink = 'var(--v3-ink)';
  const cream = 'var(--v3-cream)';
  const muted = 'rgba(244,240,233,0.65)';

  const thumbCopy = vote === 'up'
    ? {
        line1: 'Chatnamer has some great ideas,',
        line2: 'but is still learning how to name.',
      }
    : {
        line1: 'Chatnamer is still',
        line2: 'learning how to name.',
      };

  return (
    <>
      {/* Scrim */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20,20,20,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 90,
          animation: 'v3-fade-in .35s ease both'
        }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(560px, calc(100% - 64px))',
          background: ink, color: cream,
          padding: '34px 38px 32px',
          border: '1px solid rgba(244,240,233,0.10)',
          zIndex: 91,
          animation: 'v3-dialog-in .45s cubic-bezier(0.16,1,0.3,1) both'
        }}
        className="v3-on-dark"
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
          <KickerV3 color={accent} size={11}>Quick check-in · 01</KickerV3>
          <span style={{ flex: 1 }} />
          <button onClick={close} aria-label="Dismiss"
            style={{ appearance: 'none', background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 4,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: muted }}>
            Close ✕
          </button>
        </div>

        {vote === null ? (
          <>
            {/* Question state */}
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 58, lineHeight: 0.92,
              letterSpacing: '-0.005em', textTransform: 'uppercase',
              maxWidth: 480, marginBottom: 8
            }}>
              How's <span style={{ color: accent }}>Chatnamer</span> doing?
            </h2>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: muted, marginTop: 16, marginBottom: 28,
              letterSpacing: '0.01em', lineHeight: 1.55, maxWidth: 440
            }}>
              Honest take, in one tap. We're still tuning the model.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <ThumbBtn dir="up"   accent={accent} onClick={() => setVote('up')} />
              <ThumbBtn dir="down" accent={accent} onClick={() => setVote('down')} />
            </div>
          </>
        ) : (
          <>
            {/* Pitch state */}
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 52, lineHeight: 0.92,
              letterSpacing: '-0.005em', textTransform: 'uppercase',
              maxWidth: 500
            }}>
              {thumbCopy.line1}
              <br />
              <span style={{ color: accent }}>{thumbCopy.line2}</span>
            </h2>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.55,
              color: 'rgba(244,240,233,0.86)',
              marginTop: 22, maxWidth: 480
            }}>
              <a href="https://tanj.co" target="_blank" rel="noopener"
                 className="v3-link"
                 style={{ color: cream, borderBottomColor: 'rgba(244,240,233,0.40)' }}>
                Tanj
              </a> has already perfected it. They're the award-winning NYC-based
              naming agency that created Chatnamer.
            </p>

            <div style={{
              marginTop: 28, display: 'flex', alignItems: 'center', gap: 18,
              flexWrap: 'wrap'
            }}>
              <a href="https://tanj.co/contact" target="_blank" rel="noopener"
                 style={{
                   appearance: 'none', background: accent, color: ink,
                   border: 'none', borderRadius: 0,
                   fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
                   letterSpacing: '0.04em', textTransform: 'uppercase',
                   padding: '15px 22px',
                   textDecoration: 'none',
                   display: 'inline-flex', alignItems: 'center', gap: 10
                 }}>
                Want real (human) help? Reach out to Tanj
                <span style={{ fontWeight: 700 }}>→</span>
              </a>
              <button onClick={close}
                style={{
                  appearance: 'none', background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: muted,
                  borderBottom: '1px solid rgba(244,240,233,0.30)',
                  paddingBottom: 2
                }}>
                Keep naming with Chatnamer
              </button>
            </div>

            {/* Footer micro */}
            <div style={{
              marginTop: 30, paddingTop: 16,
              borderTop: '1px solid rgba(244,240,233,0.10)',
              display: 'flex', gap: 22, flexWrap: 'wrap'
            }}>
              <MonoCapV3 color={muted} size={10}>1,000+ Brands</MonoCapV3>
              <MonoCapV3 color={muted} size={10}>$26B+ Value</MonoCapV3>
              <MonoCapV3 color={muted} size={10}>$2.2B+ Funding</MonoCapV3>
              <MonoCapV3 color={muted} size={10}>20+ Years</MonoCapV3>
            </div>
          </>
        )}
      </div>
    </>);
}

/* ── Big thumb-button (square card with icon + label) ───────────── */
function ThumbBtn({ dir, accent, onClick }) {
  const [hover, setHover] = React.useState(false);
  const up = dir === 'up';
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', cursor: 'pointer',
        background: hover ? accent : 'transparent',
        color: hover ? 'var(--v3-ink)' : 'var(--v3-cream)',
        border: '1px solid ' + (hover ? accent : 'rgba(244,240,233,0.28)'),
        padding: '20px 24px',
        display: 'inline-flex', alignItems: 'center', gap: 14,
        minWidth: 200,
        transition: 'background .18s ease, color .18s ease, border-color .18s ease'
      }}>
      <ThumbIcon dir={dir} />
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: 22, lineHeight: 1,
        textTransform: 'uppercase', letterSpacing: '-0.005em',
        whiteSpace: 'nowrap'
      }}>{up ? 'Great so far' : 'Not quite'}</span>
    </button>);
}

function ThumbIcon({ dir }) {
  const up = dir === 'up';
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
      style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
      <path d="M7 10v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3z"
        stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M7 10l4.2-7.1A1.4 1.4 0 0 1 13.6 3l.6 1c.3.5.4 1 .3 1.6L13.5 9h5.7c1 0 1.7.9 1.5 1.9l-1.5 7.4A2 2 0 0 1 17.3 20H7"
        stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
    </svg>);
}

Object.assign(window, { FeedbackModalV3 });
