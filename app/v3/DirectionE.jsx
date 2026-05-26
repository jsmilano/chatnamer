/* ------------------------------------------------------------------
   Chatnamer v3 — DirectionE  ·  Tanj.co 2026 reskin
   Same 2-col conversational flow as v2-D, but expressive editorial type
   (Saira Condensed all-caps + DM Sans + JetBrains Mono), warm cream
   surfaces, a marquee ticker, and a spinning orange badge.
   ------------------------------------------------------------------ */

function DirectionE({ width = 1280, height = 860, tweaks = {} }) {
  const cn = useChatnamer();
  const accent = 'var(--v3-orange)';
  const showChips = tweaks.showChips !== false;
  const density = tweaks.density || 'editorial';
  const [toastView, showToast] = useToast();

  // Feedback modal — auto fires after delay; also exposed via header button.
  const triggerSec = tweaks.feedbackAfterSec ?? 90;
  const [fbOpen, setFbOpen] = React.useState(null); // null = let timer drive
  const [fbFired, setFbFired] = React.useState(false);

  const handleExport = async () => {await cn.exportSaved();};

  const q = cn.question;
  const v = cn.answers[q.id] || '';

  const scrollRef = React.useRef(null);
  const currentRef = React.useRef(null);

  // Auto-scroll the current question into view as the user advances.
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (currentRef.current && scrollRef.current) {
        const el = currentRef.current;
        const sc = scrollRef.current;
        sc.scrollTo({ top: Math.max(0, el.offsetTop - 28), behavior: 'smooth' });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [cn.idx]);

  const muted = 'rgba(26,26,26,0.55)';
  const ink = 'var(--v3-ink)';
  const cream = 'var(--v3-cream)';
  const rule = 'rgba(26,26,26,0.12)';

  // Build ticker items — Chatnamer-focused, with Since 2022
  const tickerItems = [
  'Chatnamer · v3',
  `${String(cn.idx + 1).padStart(2, '0')} / ${String(cn.total).padStart(2, '0')} ${cn.phase === 'asking' ? 'asking' : cn.phase}`,
  `${cn.names.length} names drafted`,
  `${cn.saved.size} saved`,
  'Since 2022',
  'AI-assisted, human-trained',
  'Created by Tanj.co',
  'Live · Naming engine'];


  return (
    <div
      data-screen-label="E · Tanj.co reskin"
      className="v3-scope"
      style={{
        width, height, position: 'relative', overflow: 'hidden',
        background: cream, color: ink,
        fontFamily: 'var(--font-body)',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gridTemplateRows: '56px 34px 1fr'
      }}>

      {/* ── Top status strip (black) ─────────────────────────────────── */}
      <div style={{
        gridColumn: '1 / -1', gridRow: 1,
        background: ink, color: cream,
        display: 'flex', alignItems: 'center', padding: '0 28px',
        borderBottom: '1px solid rgba(244,240,233,0.10)',
        position: 'relative', zIndex: 4
      }} className="v3-on-dark">
        {/* Handwritten Tanj wordmark — links to tanj.co */}
        <a href="https://tanj.co" target="_blank" rel="noopener"
           aria-label="Tanj — opens tanj.co in a new tab"
           style={{ display: 'inline-flex', alignItems: 'center', marginRight: 18,
                    textDecoration: 'none', lineHeight: 0 }}>
          <img src="assets/logo-white.png" alt="Tanj"
               style={{ height: 22, width: 'auto', transform: 'translateY(-2px)',
                        transition: 'opacity .18s ease' }}
               onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.7; }}
               onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }} />
        </a>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 22, lineHeight: 1,
          letterSpacing: '-0.005em', textTransform: 'uppercase',
          color: cream
        }}>Chatnamer</span>
        <span style={{ width: 1, height: 18, background: 'rgba(244,240,233,0.18)', margin: '0 18px' }} />
        <KickerV3 color="rgba(244,240,233,0.55)" size={10}>
          v2 · AI naming assistant
        </KickerV3>

        <span style={{ flex: 1 }} />

        {/* Status mono kicker */}
        <KickerV3 color={accent} size={10}>
          {cn.phase === 'asking' ? `Asking · ${String(cn.answeredCount).padStart(2, '0')}/${String(cn.total).padStart(2, '0')}` :
          cn.phase === 'generating' ? `Naming · ${String(cn.names.length).padStart(2, '0')}/${String(8 * (cn.round || 1)).padStart(2, '0')}` :
          cn.phase === 'refining' ? `Refining · Round ${String((cn.round || 1) + 1).padStart(2, '0')}` :
          `Round ${String(cn.round || 1).padStart(2, '0')} · ${cn.saved.size} saved`}
        </KickerV3>
        <span style={{ width: 16 }} />
        <PipsV3 total={cn.total} current={cn.idx} accent={accent} dark />
        <span style={{ width: 22 }} />

        {/* How's it going? trigger */}
        <button onClick={() => {setFbOpen(true);setFbFired(true);}}
        style={{
          appearance: 'none', background: 'transparent',
          border: '1px solid rgba(244,240,233,0.28)',
          color: cream, padding: '8px 12px',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          cursor: 'pointer'
        }}>
          How's it going? ↗
        </button>
      </div>

      {/* ── Marquee ticker ───────────────────────────────────────────── */}
      <div style={{ gridColumn: '1 / -1', gridRow: 2, position: 'relative', zIndex: 3 }}>
        <TickerV3 items={tickerItems} accent={accent} highlightIdx={1} />
      </div>

      {/* ── LEFT: editorial brief column ─────────────────────────────── */}
      <div ref={scrollRef} style={{
        gridColumn: 1, gridRow: 3,
        position: 'relative', overflowY: 'auto',
        background: cream,
        padding: density === 'compact' ? '32px 56px 64px' : '44px 68px 80px',
        borderRight: '1px solid ' + rule
      }}>
        {/* Editorial intro — stair-step headline */}
        <div className="v3-up" style={{ marginBottom: density === 'compact' ? 36 : 52, maxWidth: 880 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span className="v3-pulse-dot" aria-hidden="true" />
            <KickerV3 color={accent}>The brief / 01</KickerV3>
            <span style={{ width: 28, height: 1, background: rule }} />
            <KickerV3 color={muted}>Eight questions · One brief</KickerV3>
          </div>
          <StairV3
            size={density === 'compact' ? 72 : 88}
            indents={[0, 64]}
            lines={[
              'Eight questions.',
              '{{One sharp brief.}}'
            ]} />
          <div style={{ width: 96, marginTop: 18 }}>
            <span className="v3-rule-draw" />
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 400,
            fontSize: 15, lineHeight: 1.6,
            color: muted, marginTop: 22, maxWidth: 540
          }}>Talk to Chatnamer like a strategist, not a form. Type freely or click a suggestion. It listens, then names your brand.


          </p>
        </div>

        {/* Past + current Q&A list */}
        {cn.questions.map((qq, i) => {
          if (i > cn.idx) return null;
          const isCurrent = i === cn.idx && cn.phase === 'asking';
          const a = cn.answers[qq.id];

          return (
            <div key={qq.id}
            ref={isCurrent ? currentRef : null}
            style={{
              marginBottom: density === 'compact' ? 28 : 40,
              paddingBottom: density === 'compact' ? 22 : 28,
              borderBottom: isCurrent ? 'none' : '1px solid ' + rule
            }}>
              {/* Question header */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                <KickerV3 color={isCurrent ? accent : muted}>
                  Q{String(qq.n).padStart(2, '0')} · {qq.id}
                </KickerV3>
                <span style={{ width: 22, height: 1, background: rule, alignSelf: 'center' }} />
                {!isCurrent &&
                <button onClick={() => cn.goto(i)} style={{
                  appearance: 'none', background: 'transparent', border: 'none',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: muted, cursor: 'pointer', padding: 0
                }}>Edit ↗</button>}
              </div>

              {/* The question itself */}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: isCurrent ? 800 : 700,
                fontSize: isCurrent ? density === 'compact' ? 52 : 64 : 26,
                lineHeight: isCurrent ? 0.92 : 1.1,
                letterSpacing: '-0.005em',
                textTransform: 'uppercase',
                color: isCurrent ? ink : 'rgba(26,26,26,0.85)',
                maxWidth: isCurrent ? 720 : 640
              }}>
                {qq.title}
              </h2>

              {isCurrent ?
              <>
                  <p style={{
                  fontFamily: 'var(--font-mono)', fontStyle: 'italic',
                  fontSize: 13, lineHeight: 1.55,
                  color: muted, marginTop: 16, maxWidth: 560
                }}>
                    {qq.hint}
                  </p>

                  {/* Editorial textarea — orange left rule */}
                  <div style={{ marginTop: density === 'compact' ? 20 : 30, maxWidth: 720 }}>
                    <textarea
                    autoFocus
                    value={v} onChange={(e) => cn.setAnswer(qq.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && v.trim()) {
                        cn.isLast ? cn.generate() : cn.next();
                      }
                    }}
                    placeholder={qq.placeholder}
                    rows={Math.max(2, Math.min(5, v.split('\n').length + 1))}
                    style={{
                      width: '100%', border: 'none', outline: 'none',
                      background: 'transparent', resize: 'none',
                      fontFamily: 'var(--font-body)', fontWeight: 500,
                      fontSize: density === 'compact' ? 22 : 26, lineHeight: 1.35,
                      color: ink,
                      borderLeft: '3px solid ' + accent,
                      paddingLeft: 18, paddingTop: 2,
                      caretColor: accent
                    }} />
                  </div>

                  <ChipRailV3
                  question={qq} answers={cn.answers} aiChips={cn.aiChips}
                  chipsLoading={cn.chipsLoading}
                  onInsert={(t) => cn.appendToAnswer(qq.id, t)}
                  onRequestAi={() => cn.refreshChips(qq.id)}
                  accent={accent} dark={false}
                  density={density === 'compact' ? 'compact' : 'editorial'}
                  visible={showChips} />

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center',
                  marginTop: density === 'compact' ? 26 : 36 }}>
                    {cn.idx > 0 &&
                  <SecondaryBtnV3 onClick={cn.back} accent={accent}>← Back</SecondaryBtnV3>}
                    {!cn.isLast &&
                  <PrimaryBtnV3 onClick={cn.next} disabled={!v.trim()} accent={accent}>
                        Next question →
                      </PrimaryBtnV3>}
                    {cn.isLast &&
                  <PrimaryBtnV3 onClick={cn.generate} disabled={!v.trim()} accent={accent}>
                        Generate names →
                      </PrimaryBtnV3>}
                    <span style={{ flex: 1 }} />
                    <MonoCapV3 color={muted} size={10}>
                      ⌘ + ↩ to continue
                    </MonoCapV3>
                  </div>
                </> : (

              /* Past answer — DM Sans w/ orange left rule */
              <div style={{
                fontFamily: 'var(--font-body)', fontWeight: 400,
                fontSize: density === 'compact' ? 16 : 18, lineHeight: 1.4,
                color: a ? ink : 'rgba(26,26,26,0.35)',
                borderLeft: '2px solid ' + (a ? accent : rule),
                paddingLeft: 16, marginTop: 14, maxWidth: 620
              }}>
                  {a || '— skipped'}
                </div>)
              }
            </div>);
        })}

        {/* Generating state */}
        {cn.phase === 'generating' &&
        <div className="v3-up" style={{ marginTop: 30 }}>
            <KickerV3 color={accent}>Working</KickerV3>
            <div style={{ marginTop: 12 }}>
              <StairV3
              size={70} indents={[0, 60]}
              lines={['Reading the brief.', '{{Drafting names.}}']} />
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
            color: muted, marginTop: 14, letterSpacing: '0.02em' }}>
              {String(cn.names.length).padStart(2, '0')} / 08 drafted →
            </p>
          </div>}

        {/* Results state header */}
        {cn.phase === 'results' &&
        <div className="v3-up" style={{ marginTop: 32 }}>
            <KickerV3 color={accent}>Round {String(cn.round || 1).padStart(2, '0')} complete</KickerV3>
            <div style={{ marginTop: 14 }}>
              <StairV3
              size={72} indents={[0, 50]}
              lines={[
              cn.round > 1 ? `${8 * cn.round} names on the table.` : 'Eight starting points.',
              '{{Save what catches.}}']
              } />
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.6,
            color: muted, marginTop: 16, maxWidth: 560 }}>
              Star the names with pull, then tell us what's working. Round
              {' ' + String((cn.round || 1) + 1).padStart(2, '0')} will mine the pattern.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
              <PrimaryBtnV3 onClick={cn.startRefinement} accent={accent}>
                Refine · Round {String((cn.round || 1) + 1).padStart(2, '0')} →
              </PrimaryBtnV3>
              <SecondaryBtnV3 onClick={handleExport} accent={accent}>
                {cn.saved.size > 0 ? `Copy ${cn.saved.size} saved` : 'Copy all'}
              </SecondaryBtnV3>
              <SecondaryBtnV3 onClick={cn.reset} accent={accent}>Start over</SecondaryBtnV3>
            </div>
          </div>}

        {/* Refinement state */}
        {cn.phase === 'refining' &&
        <RefineBlock cn={cn} accent={accent} dark={false} density={density} />}
      </div>

      {/* ── RIGHT: names rail (deeper cream) ─────────────────────────── */}
      <div style={{
        gridColumn: 2, gridRow: 3,
        background: 'var(--v3-cream-2)', color: ink,
        padding: density === 'compact' ? '32px 32px 64px' : '40px 38px 80px',
        overflowY: 'auto', position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <KickerV3 color={accent}>
            Names · {String(cn.names.length).padStart(2, '0')}
          </KickerV3>
          <span style={{ flex: 1 }} />
          {cn.saved.size > 0 &&
          <button onClick={handleExport}
          style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: accent }}>
              ★ {cn.saved.size} Saved — Copy →
            </button>}
        </div>

        {/* Stair headline for the names panel */}
        <div style={{ marginBottom: 18 }}>
          <StairV3
            size={44} indents={[0, 14]} lineHeight={0.88}
            lines={['The names', '{{rail.}}']} />
        </div>

        <SavedTray cn={cn} accent={accent} onExport={handleExport} />

        {cn.names.length === 0 && cn.phase !== 'generating' &&
        <div>
            <div style={{ paddingTop: 4 }}>
              <KickerV3 color="rgba(26,26,26,0.45)">What we know so far</KickerV3>
              <div style={{ marginTop: 12 }}>
                {cn.questions.filter((qq) => cn.answers[qq.id]).map((qq) =>
              <div key={qq.id} style={{ marginBottom: 14 }}>
                    <MonoCapV3 color="rgba(26,26,26,0.45)" size={9}>
                      {String(qq.n).padStart(2, '0')} · {qq.id}
                    </MonoCapV3>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5,
                  lineHeight: 1.55, color: 'var(--v3-ink)', marginTop: 4 }}>
                      {cn.answers[qq.id]}
                    </div>
                  </div>)}
                {cn.answeredCount === 0 &&
              <p style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic',
                fontSize: 12, color: 'rgba(26,26,26,0.40)' }}>
                    Nothing yet. Start with question 01.
                  </p>}
              </div>
            </div>
          </div>}

        {cn.phase === 'generating' && cn.names.length === 0 &&
        <p style={{ fontFamily: 'var(--font-mono)', fontStyle: 'italic',
          fontSize: 14, color: accent }}>
            Drafting…
          </p>}

        {cn.names.map((n) =>
        <NameRowV3 key={n.id} {...n}
        saved={cn.saved.has(n.id)}
        onToggleSave={() => cn.toggleSave(n.id)}
        onOpenDetail={() => cn.openDetail(n.id)}
        accent={accent} density="compact" />)}

        {(cn.phase === 'results' || cn.phase === 'refining') && cn.names.length > 0 &&
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid ' + rule,
          display: 'flex', gap: 10 }}>
            <SecondaryBtnV3 onClick={handleExport}>Copy list</SecondaryBtnV3>
            {cn.phase === 'results' &&
          <PrimaryBtnV3 onClick={cn.startRefinement} accent={accent}>Refine →</PrimaryBtnV3>}
          </div>}
      </div>

      {/* Name detail overlay (from v2 NameDetail.jsx) */}
      {cn.detailName && <NameDetail cn={cn} accent={accent} />}

      {/* Export modal (clipboard fallback) */}
      <ExportModal cn={cn} accent={accent} />

      {/* Feedback CTA — auto fires; also controllable */}
      <FeedbackModalV3
        delayMs={triggerSec * 1000}
        open={fbOpen}
        onClose={() => setFbOpen(false)}
        onTrigger={() => setFbFired(true)}
        accent={accent} />
      

      {toastView}
    </div>);
}

window.DirectionE = DirectionE;