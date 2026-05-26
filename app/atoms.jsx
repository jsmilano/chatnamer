/* ------------------------------------------------------------------
   Chatnamer v2 — Shared atoms (chip, name row, progress, etc.)
   All take light/dark mode + density via props.
   ------------------------------------------------------------------ */

// ── Kicker label (ALL CAPS Work Sans 700, tracked) ────────────────────
function Kicker({ children, color = 'var(--orange)', size = 10 }) {
  return (
    <span style={{
      fontFamily: 'var(--font-body)', fontWeight: 700,
      fontSize: size, letterSpacing: '0.14em', textTransform: 'uppercase',
      color, lineHeight: 1
    }}>{children}</span>);

}

// ── Progress pips (Tanj nav style) ────────────────────────────────────
function Pips({ total, current, accent = 'var(--orange)', dark = false }) {
  const dimColor = dark ? 'rgba(245,242,238,0.30)' : 'rgba(17,17,17,0.20)';
  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <span key={i} style={{
            width: active ? 18 : 5, height: 5,
            background: active ? accent : dimColor,
            borderRadius: 0,
            transition: 'width .25s cubic-bezier(0.16,1,0.3,1)'
          }} />);

      })}
    </div>);

}

// ── Chip — square, hairline, hover-orange ────────────────────────────
function Chip({ children, onClick, dark = false, accent = 'var(--orange)',
  density = 'editorial', icon = null, dim = false }) {
  const pad = density === 'compact' ? '7px 11px' : '9px 13px';
  const fs = density === 'compact' ? 12 : 13;
  const baseBorder = dark ? 'rgba(245,242,238,0.18)' : 'rgba(17,17,17,0.14)';
  const baseColor = dark ? 'rgba(245,242,238,0.92)' : 'var(--ink)';
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', background: 'transparent', cursor: 'pointer',
        border: '1px solid ' + (hover ? accent : baseBorder),
        color: hover ? accent : baseColor,
        opacity: dim ? 0.62 : 1,
        padding: pad, borderRadius: 0,
        fontFamily: 'var(--font-body)', fontSize: fs, fontWeight: 500,
        lineHeight: 1.3, textAlign: 'left',
        transition: 'border-color .18s ease, color .18s ease',
        maxWidth: 360,
        display: 'inline-flex', alignItems: 'center', gap: 8
      }}>
      
      {icon && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: hover ? accent : dark ? 'rgba(245,242,238,0.55)' : 'rgba(17,17,17,0.45)' }}>{icon}</span>}
      {children}
    </button>);

}

// ── Three-tab chip rail (try / spark / reframe) ─────────────────────
function ChipRail({ question, answers, aiChips, onInsert, onRequestAi, chipsLoading,
  dark = false, accent = 'var(--orange)', density = 'editorial', visible = true }) {
  const [tab, setTab] = React.useState('try');
  if (!visible) return null;

  const tryChips = aiChips && aiChips[question.id] || question.chips.try;
  const sparkChips = question.chips.spark || [];
  const reframeChips = question.chips.reframe || [];

  const tabs = [
  { id: 'try', label: 'Try', count: tryChips.length, desc: 'Click to drop into your answer' },
  { id: 'spark', label: 'Spark', count: sparkChips.length, desc: 'Provocations to broaden thinking' },
  { id: 'reframe', label: 'Reframe', count: reframeChips.length, desc: 'Try the question another way' }];


  const current = tab === 'try' ? tryChips : tab === 'spark' ? sparkChips : reframeChips;
  const muted = dark ? 'rgba(245,242,238,0.55)' : 'rgba(17,17,17,0.45)';
  const fg = dark ? 'var(--off-white)' : 'var(--black)';

  return (
    <div style={{ marginTop: density === 'compact' ? 18 : 28 }}>
      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'baseline',
        borderBottom: '1px solid ' + (dark ? 'rgba(245,242,238,0.12)' : 'rgba(17,17,17,0.10)'),
        paddingBottom: 10, marginBottom: 14 }}>
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
            style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: active ? accent : muted,
              borderBottom: '2px solid ' + (active ? accent : 'transparent'),
              paddingBottom: 6, marginBottom: -11 }}>
              {t.label} <span style={{ opacity: 0.6 }}>·&nbsp;{t.count}</span>
            </button>);

        })}
        <div style={{ flex: 1 }} />
        {tab === 'try' &&
        <button onClick={onRequestAi} disabled={chipsLoading}
        style={{ ...{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: chipsLoading ? muted : dark ? 'var(--lime)' : 'var(--black)',
            opacity: chipsLoading ? 0.6 : 1, transition: 'opacity .2s ease' }, color: "rgb(255, 70, 28)" }}>
            {chipsLoading ? 'Asking…' : '↻ Suggest for me'}
          </button>
        }
      </div>

      {/* tiny tab description */}
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 13, color: muted, marginBottom: 10 }}>
        {tabs.find((x) => x.id === tab).desc}
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {current.map((text, i) =>
        <Chip key={i} dark={dark} accent={accent} density={density}
        onClick={() => onInsert(text)}
        dim={tab !== 'try'}>
            {text}
          </Chip>
        )}
      </div>
    </div>);

}

// ── Domain & trademark dots ─────────────────────────────────────────
function StatusDot({ status, label, dark = false }) {
  // status: 'clear' | 'open' | 'risky' | 'taken'
  const map = {
    clear: { color: 'var(--lime)', fill: 'var(--lime)' },
    open: { color: 'var(--lime)', fill: 'var(--lime)' },
    risky: { color: 'var(--orange)', fill: 'var(--orange)' },
    taken: { color: dark ? 'rgba(245,242,238,0.35)' : 'rgba(17,17,17,0.32)',
      fill: 'transparent', border: 'rgba(17,17,17,0.32)' }
  };
  const s = map[status] || map.clear;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: dark ? 'rgba(245,242,238,0.85)' : 'var(--ink)' }}>
      <span style={{ width: 7, height: 7, borderRadius: 0,
        background: s.fill, border: s.fill === 'transparent' ? '1px solid ' + s.border : 'none' }} />
      {label}
    </span>);

}

// ── Star (save) icon ─────────────────────────────────────────────────
function StarIcon({ filled, dark = false, accent = 'var(--orange)', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1l2.2 4.6 5 .7-3.6 3.6.9 5L8 12.5l-4.5 2.4.9-5L.8 6.3l5-.7L8 1z"
      fill={filled ? accent : 'none'}
      stroke={filled ? accent : dark ? 'rgba(245,242,238,0.6)' : 'rgba(17,17,17,0.45)'}
      strokeWidth={1.4} strokeLinejoin="round" />
    </svg>);

}

// ── Compact name row (used in results panel) ────────────────────────
function NameRow({ name, kind, etymology, rationale, domain, trademark, round,
  saved, onToggleSave, dark = false, accent = 'var(--orange)',
  density = 'editorial', onOpenDetail }) {
  const [open, setOpen] = React.useState(false);
  const muted = dark ? 'rgba(245,242,238,0.62)' : 'rgba(17,17,17,0.55)';
  const fg = dark ? 'var(--off-white)' : 'var(--black)';
  const rule = dark ? 'rgba(245,242,238,0.10)' : 'rgba(17,17,17,0.08)';

  const fsName = density === 'compact' ? 22 : 28;
  const vpad = density === 'compact' ? 12 : 16;

  return (
    <div style={{
      borderBottom: '1px solid ' + rule, padding: `${vpad}px 0`,
      animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both'
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onOpenDetail} disabled={!onOpenDetail} style={{
              appearance: 'none', background: 'transparent', border: 'none',
              padding: 0, cursor: onOpenDetail ? 'pointer' : 'default',
              fontFamily: 'var(--font-display)', fontSize: fsName,
              lineHeight: 1, color: fg, textAlign: 'left',
              borderBottom: '1px solid transparent',
              transition: 'border-color .18s ease'
            }}
            onMouseEnter={(e) => { if (onOpenDetail) e.currentTarget.style.borderBottomColor = accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; }}>
              {name}
            </button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: accent }}>{kind}{round ? ' · R' + String(round).padStart(2, '0') : ''}</span>
          </div>
          {etymology &&
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 12.5, color: muted, marginTop: 4 }}>{etymology}</div>
          }
        </div>
        <button onClick={onToggleSave} aria-label="Save"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, marginRight: -6 }}>
          <StarIcon filled={saved} dark={dark} accent={accent} />
        </button>
      </div>

      {/* status row */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusDot status={domain?.com === 'open' ? 'open' : 'taken'}
        label={'.COM ' + (domain?.com === 'open' ? 'OPEN' : 'TAKEN')} dark={dark} />
        {domain?.alt &&
        <StatusDot status="open" label={domain.alt.toUpperCase()} dark={dark} />
        }
        <StatusDot status={trademark} label={'TM ' + (trademark || 'CLEAR').toUpperCase()} dark={dark} />

        <div style={{ flex: 1 }} />
        <button onClick={() => setOpen(!open)}
        style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: muted, textDecoration: 'none' }}>
          {open ? 'Hide' : 'Why ↗'}
        </button>
        {onOpenDetail && (
          <button onClick={onOpenDetail}
          style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: accent, textDecoration: 'none' }}>
            Deep dive →
          </button>
        )}
      </div>

      {open && rationale &&
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.65,
        color: dark ? 'rgba(245,242,238,0.78)' : 'var(--ink)',
        marginTop: 12, maxWidth: 420 }}>{rationale}</div>
      }
    </div>);

}

// ── Live brief running list (right-panel summary) ─────────────────────
function BriefList({ questions, answers, currentIdx, onJump, dark = false,
  accent = 'var(--orange)', density = 'editorial' }) {
  const muted = dark ? 'rgba(245,242,238,0.55)' : 'rgba(17,17,17,0.45)';
  const fg = dark ? 'var(--off-white)' : 'var(--black)';
  return (
    <div>
      {questions.map((q, i) => {
        const v = (answers[q.id] || '').trim();
        const active = i === currentIdx;
        return (
          <button key={q.id} onClick={() => onJump(i)}
          style={{ appearance: 'none', background: 'transparent', border: 'none',
            textAlign: 'left', width: '100%', cursor: 'pointer',
            display: 'block',
            padding: density === 'compact' ? '8px 0' : '10px 0',
            borderBottom: '1px solid ' + (dark ? 'rgba(245,242,238,0.08)' : 'rgba(17,17,17,0.06)') }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.14em', color: active ? accent : muted,
                minWidth: 14 }}>{String(q.n).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                color: active ? fg : muted, textTransform: 'uppercase',
                letterSpacing: '0.08em', flex: 1 }}>{q.id}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55,
              color: v ? dark ? 'rgba(245,242,238,0.92)' : 'var(--ink)' : muted,
              fontStyle: v ? 'normal' : 'italic',
              marginTop: 3, paddingLeft: 24,
              textOverflow: 'ellipsis', overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {v || '—'}
            </div>
          </button>);

      })}
    </div>);

}

// ── Primary CTA button (per design system) ────────────────────────────
function PrimaryBtn({ children, onClick, dark = false, accent = 'var(--orange)', disabled = false }) {
  const [hover, setHover] = React.useState(false);
  const bg = dark ? 'var(--off-white)' : 'var(--black)';
  const fg = dark ? 'var(--black)' : 'var(--off-white)';
  return (
    <button onClick={onClick} disabled={disabled}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{
      appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: hover && !disabled ? accent : bg,
      color: hover && !disabled ? 'var(--black)' : fg,
      border: 'none', borderRadius: 0,
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      padding: '13px 24px',
      opacity: disabled ? 0.4 : 1,
      transition: 'background .18s ease, color .18s ease'
    }}>{children}</button>);

}

function SecondaryBtn({ children, onClick, dark = false, accent = 'var(--orange)' }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{
      appearance: 'none', background: 'transparent', cursor: 'pointer',
      color: hover ? accent : dark ? 'var(--off-white)' : 'var(--black)',
      border: '1px solid ' + (hover ? accent : dark ? 'rgba(245,242,238,0.22)' : 'rgba(17,17,17,0.25)'),
      borderRadius: 0,
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      padding: '12px 22px',
      transition: 'border-color .18s ease, color .18s ease'
    }}>{children}</button>);

}

// ── T-bar diagonal SVG (ghost field for dark surfaces) ───────────────
function TBarField({ opacity = 0.05 }) {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="none"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <line x1="-50" y1="420" x2="850" y2="220" stroke="rgba(245,242,238,1)" strokeWidth="80" opacity={opacity} />
      <line x1="-50" y1="520" x2="850" y2="320" stroke="rgba(245,242,238,1)" strokeWidth="60" opacity={opacity * 0.7} />
      <line x1="-50" y1="320" x2="850" y2="120" stroke="rgba(245,242,238,1)" strokeWidth="40" opacity={opacity * 0.5} />
    </svg>);

}

Object.assign(window, {
  Kicker, Pips, Chip, ChipRail, StatusDot, StarIcon,
  NameRow, BriefList, PrimaryBtn, SecondaryBtn, TBarField
});