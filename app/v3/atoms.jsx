/* ------------------------------------------------------------------
   Chatnamer v3 — Atoms for Tanj.co reskin
   Trade-Gothic-Cnd-Bold (Saira Condensed) + DM Sans + JetBrains Mono
   All v3 atoms are exported with a V3 suffix so they coexist with v2.
   ------------------------------------------------------------------ */

/* ── Mono kicker (replaces Work Sans ALL CAPS) ───────────────────── */
function KickerV3({ children, color = 'var(--v3-ink)', size = 10, weight = 500 }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontWeight: weight,
      fontSize: size,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color,
      lineHeight: 1
    }}>{children}</span>);
}

/* ── Mono small caption ─────────────────────────────────────────── */
function MonoCapV3({ children, color = 'var(--v3-muted)', size = 11 }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontWeight: 400,
      fontSize: size, letterSpacing: '0.01em',
      color, lineHeight: 1.5
    }}>{children}</span>);
}

/* ── Pips progress (Tanj nav style, tighter) ────────────────────── */
function PipsV3({ total, current, accent = 'var(--v3-orange)', dark = false }) {
  const dim = dark ? 'rgba(244,240,233,0.30)' : 'rgba(26,26,26,0.20)';
  return (
    <div style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <span key={i} style={{
            width: active ? 20 : 4, height: 4,
            background: active ? accent : done ? dim : dim,
            opacity: done && !active ? 0.55 : 1,
            transition: 'width .25s cubic-bezier(0.16,1,0.3,1)'
          }} />);
      })}
    </div>);
}

/* ── Marquee ticker bar ─────────────────────────────────────────── */
function TickerV3({ items, dark = false, accent = 'var(--v3-orange)', highlightIdx = -1 }) {
  // Render the items twice so the loop is seamless.
  const bg = dark ? 'var(--v3-ink)' : 'var(--v3-cream)';
  const fg = dark ? 'rgba(244,240,233,0.92)' : 'var(--v3-ink)';
  const seq = [...items, ...items];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: bg, color: fg,
      borderTop: dark ? '1px solid rgba(244,240,233,0.10)' : '1px solid var(--v3-rule)',
      borderBottom: dark ? '1px solid rgba(244,240,233,0.10)' : '1px solid var(--v3-rule)',
      height: 34
    }}>
      <div className="v3-ticker-track" style={{
        position: 'absolute', top: 0, left: 0, height: '100%',
        display: 'inline-flex', alignItems: 'center'
      }}>
        {seq.map((it, i) => {
          const isHi = (i % items.length) === highlightIdx;
          return (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '0 18px', height: '100%',
              fontFamily: 'var(--font-mono)', fontWeight: 500,
              fontSize: 11, letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: isHi ? accent : fg,
              whiteSpace: 'nowrap'
            }}>
              {it}
              <span style={{ opacity: 0.45, fontWeight: 300 }}>/</span>
            </span>);
        })}
      </div>
    </div>);
}

/* ── Big condensed stair-step headline ──────────────────────────── */
/* Renders an array of strings as stacked all-caps lines with optional
   per-line left indent (stair-step). Marks lines containing {{accent}}
   markers in orange. */
function StairV3({ lines, size = 92, color = 'var(--v3-ink)', accent = 'var(--v3-orange)',
                  indents = [], lineHeight = 0.86, weight = 800 }) {
  return (
    <div style={{
      fontFamily: 'var(--font-display)',
      fontWeight: weight,
      fontSize: size,
      lineHeight,
      letterSpacing: '-0.005em',
      textTransform: 'uppercase',
      color
    }}>
      {lines.map((raw, i) => {
        const parts = raw.split(/(\{\{[^}]+\}\})/g).filter(Boolean);
        return (
          <div key={i} style={{
            paddingLeft: (indents[i] || 0) + 'px',
            display: 'block',
            whiteSpace: 'nowrap'
          }}>
            {parts.map((p, j) => {
              const m = p.match(/^\{\{(.+)\}\}$/);
              if (m) return <span key={j} style={{ color: accent }}>{m[1]}</span>;
              return <span key={j}>{p}</span>;
            })}
          </div>);
      })}
    </div>);
}

/* ── Orange spinning badge with mono text on a circle ───────────── */
function OrangeBadgeV3({ size = 132, text = 'HELPING YOUR BRAND WIN ONE NAME AT A TIME ·',
                        inner = 'GO', innerHref = null, onInnerClick = null,
                        spin = true, color = 'var(--v3-orange)' }) {
  const id = React.useId();
  const r = size / 2 - 8;
  const cx = size / 2, cy = size / 2;
  // Circular path for textPath
  const path = `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,1 ${r*2},0 a ${r},${r} 0 1,1 -${r*2},0`;
  const InnerWrap = innerHref ? 'a' : onInnerClick ? 'button' : 'div';
  const innerProps = innerHref
    ? { href: innerHref, target: '_blank', rel: 'noopener' }
    : onInnerClick ? { onClick: onInnerClick, type: 'button' } : {};
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
           className={spin ? 'v3-spin' : ''}
           style={{ position: 'absolute', inset: 0 }}>
        <circle cx={cx} cy={cy} r={r + 6} fill={color} />
        <defs>
          <path id={`p-${id}`} d={path} fill="none" />
        </defs>
        <text fill="#1A1A1A" style={{
          fontFamily: 'var(--font-mono)', fontWeight: 500,
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase'
        }}>
          <textPath href={`#p-${id}`} startOffset="0">{text}</textPath>
        </text>
      </svg>
      <InnerWrap {...innerProps} style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: size * 0.42, height: size * 0.42, borderRadius: '50%',
        background: 'var(--v3-ink)', color: 'var(--v3-cream)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 10,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        border: 'none', cursor: (innerHref || onInnerClick) ? 'pointer' : 'default',
        textDecoration: 'none', padding: 0, lineHeight: 1.1, textAlign: 'center'
      }}>{inner}</InnerWrap>
    </div>);
}

/* ── Chip — square, hairline, hover-orange (mono) ───────────────── */
function ChipV3({ children, onClick, dark = false, accent = 'var(--v3-orange)',
                 density = 'editorial', icon = null, dim = false }) {
  const pad = density === 'compact' ? '7px 11px' : '9px 13px';
  const fs = density === 'compact' ? 12 : 13;
  const baseBorder = dark ? 'rgba(244,240,233,0.20)' : 'rgba(26,26,26,0.18)';
  const baseColor = dark ? 'rgba(244,240,233,0.92)' : 'var(--v3-ink)';
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', background: hover ? (dark ? 'rgba(244,240,233,0.05)' : 'rgba(26,26,26,0.04)') : 'transparent',
        cursor: 'pointer',
        border: '1px solid ' + (hover ? accent : baseBorder),
        color: hover ? accent : baseColor,
        opacity: dim ? 0.62 : 1,
        padding: pad, borderRadius: 999,
        fontFamily: 'var(--font-body)', fontSize: fs, fontWeight: 500,
        lineHeight: 1.3, textAlign: 'left',
        transition: 'border-color .18s ease, color .18s ease, background .18s ease',
        maxWidth: 360,
        display: 'inline-flex', alignItems: 'center', gap: 8
      }}>
      {icon && <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: hover ? accent : dark ? 'rgba(244,240,233,0.55)' : 'rgba(26,26,26,0.45)'
      }}>{icon}</span>}
      {children}
    </button>);
}

/* ── Chip rail (three tabs: try / spark / reframe) ──────────────── */
function ChipRailV3({ question, answers, aiChips, onInsert, onRequestAi, chipsLoading,
                     dark = false, accent = 'var(--v3-orange)', density = 'editorial', visible = true }) {
  const [tab, setTab] = React.useState('try');
  if (!visible) return null;

  const tryChips = (aiChips && aiChips[question.id]) || question.chips.try;
  const sparkChips = question.chips.spark || [];
  const reframeChips = question.chips.reframe || [];

  const tabs = [
    { id: 'try',     label: 'Try',     count: tryChips.length,     desc: 'Click to drop into your answer' },
    { id: 'spark',   label: 'Spark',   count: sparkChips.length,   desc: 'Provocations to broaden thinking' },
    { id: 'reframe', label: 'Reframe', count: reframeChips.length, desc: 'Try the question another way' }];

  const current = tab === 'try' ? tryChips : tab === 'spark' ? sparkChips : reframeChips;
  const muted = dark ? 'rgba(244,240,233,0.55)' : 'rgba(26,26,26,0.45)';

  return (
    <div style={{ marginTop: density === 'compact' ? 18 : 26 }}>
      {/* Tab strip */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'baseline',
        borderBottom: '1px solid ' + (dark ? 'rgba(244,240,233,0.14)' : 'var(--v3-rule)'),
        paddingBottom: 8, marginBottom: 14 }}>
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 0,
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                letterSpacing: '0.04em', textTransform: 'uppercase',
                color: active ? accent : muted,
                borderBottom: '2px solid ' + (active ? accent : 'transparent'),
                paddingBottom: 6, marginBottom: -9 }}>
              {t.label} <span style={{ opacity: 0.55, fontWeight: 400 }}>·&nbsp;{String(t.count).padStart(2,'0')}</span>
            </button>);
        })}
        <div style={{ flex: 1 }} />
        {tab === 'try' &&
          <button onClick={onRequestAi} disabled={chipsLoading}
            style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: chipsLoading ? muted : accent,
              opacity: chipsLoading ? 0.6 : 1, transition: 'opacity .2s ease' }}>
            {chipsLoading ? 'Asking…' : '↻ Suggest for me'}
          </button>}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontStyle: 'italic',
        fontSize: 12, color: muted, marginBottom: 12
      }}>
        {tabs.find((x) => x.id === tab).desc}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {current.map((text, i) =>
          <ChipV3 key={i} dark={dark} accent={accent} density={density}
                  onClick={() => onInsert(text)} dim={tab !== 'try'}>
            {text}
          </ChipV3>
        )}
      </div>
    </div>);
}

/* ── Status dot for domains / TM ────────────────────────────────── */
function StatusDotV3({ status, label, dark = false }) {
  const map = {
    clear:  { fill: 'var(--v3-orange)' },
    open:   { fill: 'var(--v3-orange)' },
    risky:  { fill: '#E5A12A' },
    taken:  { fill: 'transparent', border: dark ? 'rgba(244,240,233,0.35)' : 'rgba(26,26,26,0.32)' }
  };
  const s = map[status] || map.clear;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: dark ? 'rgba(244,240,233,0.85)' : 'var(--v3-ink)' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%',
        background: s.fill, border: s.fill === 'transparent' ? '1px solid ' + s.border : 'none' }} />
      {label}
    </span>);
}

/* ── Star icon ──────────────────────────────────────────────────── */
function StarIconV3({ filled, dark = false, accent = 'var(--v3-orange)', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.95 4.18 4.55.55-3.35 3.16.83 4.61L8 11.85l-3.98 2.15.83-4.61L1.5 6.23l4.55-.55L8 1.5z"
        fill={filled ? accent : 'none'}
        stroke={filled ? accent : dark ? 'rgba(244,240,233,0.55)' : 'rgba(26,26,26,0.40)'}
        strokeWidth={1.4} strokeLinejoin="round" />
    </svg>);
}

/* ── Compact name row (used in results panel) ───────────────────── */
function NameRowV3({ name, kind, etymology, rationale, domain, trademark, round,
                    saved, onToggleSave, dark = false, accent = 'var(--v3-orange)',
                    density = 'compact', onOpenDetail }) {
  const [open, setOpen] = React.useState(false);
  const muted = dark ? 'rgba(244,240,233,0.62)' : 'rgba(26,26,26,0.55)';
  const fg = dark ? 'rgba(244,240,233,0.96)' : 'var(--v3-ink)';
  const rule = dark ? 'rgba(244,240,233,0.10)' : 'var(--v3-rule)';

  return (
    <div className="v3-up" style={{
      borderBottom: '1px solid ' + rule,
      padding: '14px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onOpenDetail} disabled={!onOpenDetail} style={{
              appearance: 'none', background: 'transparent', border: 'none',
              padding: 0, cursor: onOpenDetail ? 'pointer' : 'default',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 30, lineHeight: 0.95,
              textTransform: 'uppercase', letterSpacing: '-0.005em',
              color: fg, textAlign: 'left',
              borderBottom: '2px solid transparent',
              transition: 'border-color .18s ease, color .18s ease'
            }}
              onMouseEnter={(e) => { if (onOpenDetail) { e.currentTarget.style.borderBottomColor = accent; e.currentTarget.style.color = accent; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'transparent'; e.currentTarget.style.color = fg; }}>
              {name}
            </button>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: accent
            }}>{kind}{round ? ' · R' + String(round).padStart(2, '0') : ''}</span>
          </div>
          {etymology &&
            <div style={{
              fontFamily: 'var(--font-mono)', fontStyle: 'italic',
              fontSize: 11.5, color: muted, marginTop: 5, lineHeight: 1.45
            }}>{etymology}</div>}
        </div>
        <button onClick={onToggleSave} aria-label="Save"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, marginRight: -6 }}>
          <StarIconV3 filled={saved} dark={dark} accent={accent} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusDotV3 status={domain?.com === 'open' ? 'open' : 'taken'}
          label={'.COM ' + (domain?.com === 'open' ? 'OPEN' : 'TAKEN')} dark={dark} />
        {domain?.alt && <StatusDotV3 status="open" label={domain.alt.toUpperCase()} dark={dark} />}
        <StatusDotV3 status={trademark} label={'TM ' + (trademark || 'CLEAR').toUpperCase()} dark={dark} />
        <div style={{ flex: 1 }} />
        <button onClick={() => setOpen(!open)}
          style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: muted }}>
          {open ? 'Hide' : 'Why ↗'}
        </button>
        {onOpenDetail &&
          <button onClick={onOpenDetail}
            style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              color: accent }}>
            Deep dive →
          </button>}
      </div>

      {open && rationale &&
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.6,
          color: dark ? 'rgba(244,240,233,0.82)' : 'var(--v3-ink)',
          marginTop: 12, maxWidth: 420
        }}>{rationale}</div>}
    </div>);
}

/* ── Primary / Secondary buttons ────────────────────────────────── */
function PrimaryBtnV3({ children, onClick, dark = false, accent = 'var(--v3-orange)', disabled = false }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: hover && !disabled ? accent : 'var(--v3-ink)',
        color: hover && !disabled ? 'var(--v3-cream)' : 'var(--v3-cream)',
        border: 'none', borderRadius: 0,
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        padding: '14px 22px',
        opacity: disabled ? 0.4 : 1,
        transition: 'background .18s ease, color .18s ease'
      }}>{children}</button>);
}

function SecondaryBtnV3({ children, onClick, dark = false, accent = 'var(--v3-orange)' }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        appearance: 'none', background: 'transparent', cursor: 'pointer',
        color: hover ? accent : dark ? 'var(--v3-cream)' : 'var(--v3-ink)',
        border: '1px solid ' + (hover ? accent : dark ? 'rgba(244,240,233,0.30)' : 'rgba(26,26,26,0.28)'),
        borderRadius: 0,
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        padding: '13px 20px',
        transition: 'border-color .18s ease, color .18s ease'
      }}>{children}</button>);
}

/* ── Brief list (left rail; mono) ───────────────────────────────── */
function BriefListV3({ questions, answers, currentIdx, onJump, dark = false,
                      accent = 'var(--v3-orange)' }) {
  const muted = dark ? 'rgba(244,240,233,0.55)' : 'rgba(26,26,26,0.45)';
  const fg = dark ? 'rgba(244,240,233,0.95)' : 'var(--v3-ink)';
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
              padding: '10px 0',
              borderBottom: '1px solid ' + (dark ? 'rgba(244,240,233,0.08)' : 'rgba(26,26,26,0.06)') }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
                letterSpacing: '0.04em', color: active ? accent : muted,
                minWidth: 22 }}>{String(q.n).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
                color: active ? fg : muted, textTransform: 'uppercase',
                letterSpacing: '0.04em', flex: 1 }}>{q.id}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
              color: v ? (dark ? 'rgba(244,240,233,0.92)' : 'var(--v3-ink)') : muted,
              fontStyle: v ? 'normal' : 'italic',
              marginTop: 4, paddingLeft: 32,
              textOverflow: 'ellipsis', overflow: 'hidden',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {v || '—'}
            </div>
          </button>);
      })}
    </div>);
}

Object.assign(window, {
  KickerV3, MonoCapV3, PipsV3, TickerV3, StairV3,
  OrangeBadgeV3, ChipV3, ChipRailV3,
  StatusDotV3, StarIconV3, NameRowV3,
  PrimaryBtnV3, SecondaryBtnV3, BriefListV3
});
