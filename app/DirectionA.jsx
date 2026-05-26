/* ------------------------------------------------------------------
   Direction A — Studio Light
   Editorial light layout. One-question-at-a-time, big Georgia headline.
   Left 60%: question + chip rail. Right 40%: brief + names panel.
   ------------------------------------------------------------------ */

function DirectionA({ width = 1280, height = 860, tweaks = {} }) {
  const cn = useChatnamer();
  const accent = 'var(--orange)';
  const dark = false;
  const showChips = tweaks.showChips !== false;
  const density = tweaks.density || 'editorial';

  const q = cn.question;
  const v = cn.answers[q.id] || '';
  const onChange = (e) => cn.setAnswer(q.id, e.target.value);

  // Question column refs for scroll reset on q change
  const colRef = React.useRef(null);
  React.useEffect(() => { if (colRef.current) colRef.current.scrollTop = 0; }, [cn.idx, cn.phase]);

  const asking = cn.phase !== 'results' && cn.phase !== 'generating';

  return (
    <div data-screen-label="A · Studio Light" style={{
      width, height, position: 'relative', overflow: 'hidden',
      background: 'var(--off-white)', color: 'var(--black)',
      fontFamily: 'var(--font-body)',
      display: 'grid', gridTemplateColumns: '1.35fr 1fr', gridTemplateRows: '1fr 56px',
    }}>
      {/* ── Left column: question / chips / answer ───────────────── */}
      <div ref={colRef} style={{
        gridColumn: 1, gridRow: 1,
        padding: density === 'compact' ? '40px 56px 30px' : '64px 72px 40px',
        overflowY: 'auto', position: 'relative',
        borderRight: '1px solid var(--rule)',
      }}>
        {cn.phase === 'asking' && (
          <div key={'q-' + cn.idx} className="a1">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <Kicker color={accent}>Brief · {String(q.n).padStart(2,'0')} / {String(cn.total).padStart(2,'0')}</Kicker>
              <span style={{ width: 32, height: 1, background: 'rgba(17,17,17,0.18)' }}/>
              <Pips total={cn.total} current={cn.idx} accent={accent}/>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                         fontSize: density === 'compact' ? 44 : 56,
                         lineHeight: 1.02, letterSpacing: 0,
                         color: 'var(--black)', maxWidth: 620 }}>
              {q.title}
            </h1>

            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 17, color: 'rgba(17,17,17,0.55)',
                        marginTop: 14, maxWidth: 580 }}>
              {q.hint}
            </p>

            {/* Answer area */}
            <div style={{ marginTop: density === 'compact' ? 22 : 32, maxWidth: 640 }}>
              <textarea
                value={v}
                onChange={onChange}
                placeholder={q.placeholder}
                rows={Math.max(2, Math.min(6, v.split('\n').length + 1))}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  background: 'transparent', resize: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 400,
                  fontSize: density === 'compact' ? 22 : 26, lineHeight: 1.35,
                  color: 'var(--black)',
                  borderBottom: '2px solid var(--black)',
                  paddingBottom: 12, paddingTop: 6,
                }}
              />
            </div>

            <ChipRail
              question={q} answers={cn.answers} aiChips={cn.aiChips}
              chipsLoading={cn.chipsLoading}
              onInsert={(t) => cn.appendToAnswer(q.id, t)}
              onRequestAi={() => cn.refreshChips(q.id)}
              accent={accent} dark={dark} density={density} visible={showChips}
            />

            {/* Nav row */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center',
                          marginTop: density === 'compact' ? 30 : 44 }}>
              {cn.idx > 0 && <SecondaryBtn onClick={cn.back}>← Back</SecondaryBtn>}
              {!cn.isLast && (
                <PrimaryBtn onClick={cn.next} disabled={!v.trim()}>Continue →</PrimaryBtn>
              )}
              {cn.isLast && (
                <PrimaryBtn onClick={cn.generate} disabled={!v.trim()}>Generate names →</PrimaryBtn>
              )}
              <span style={{ flex: 1 }}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
                             color: 'rgba(17,17,17,0.45)', letterSpacing: '0.04em' }}>
                {cn.answeredCount}/{cn.total} answered · ↩ to continue
              </span>
            </div>
          </div>
        )}

        {cn.phase === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
                        height: '100%', maxWidth: 600 }}>
            <Kicker color={accent}>Working</Kicker>
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                         fontWeight: 400, fontSize: 64, lineHeight: 1.02,
                         color: 'var(--black)', marginTop: 16 }}>
              Reading your<br/>brief.<br/>Naming<br/>begins.
            </h1>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 18, color: 'rgba(17,17,17,0.55)', marginTop: 18 }}>
              {cn.names.length} of 8 drafted →
            </p>
          </div>
        )}

        {cn.phase === 'results' && (
          <div className="a1">
            <Kicker color={accent}>Round 01 · 8 names</Kicker>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                         fontSize: 56, lineHeight: 1.02, marginTop: 16, maxWidth: 540 }}>
              Eight starting points.<br/>
              <em style={{ color: 'rgba(17,17,17,0.55)' }}>Save what catches.</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.65,
                        color: 'var(--ink)', marginTop: 18, maxWidth: 520 }}>
              These are draft candidates, not the final list. Star the ones with pull; tell us why; we'll mine the pattern and run round two.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <PrimaryBtn onClick={cn.generate}>Run round 02 →</PrimaryBtn>
              <SecondaryBtn onClick={cn.reset}>Start over</SecondaryBtn>
              <SecondaryBtn onClick={() => alert('Export coming soon')}>Export list</SecondaryBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Right column: Brief + Names ─────────────────────────── */}
      <div style={{
        gridColumn: 2, gridRow: 1,
        background: 'var(--warm-white)',
        padding: density === 'compact' ? '24px 32px' : '32px 40px',
        overflowY: 'auto', position: 'relative',
      }}>
        {/* Top: Brief running list */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <Kicker color="rgba(17,17,17,0.45)">Live brief</Kicker>
            <span style={{ flex: 1 }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                           letterSpacing: '0.12em', color: 'rgba(17,17,17,0.45)' }}>
              {cn.answeredCount}/{cn.total}
            </span>
          </div>
          <BriefList questions={cn.questions} answers={cn.answers}
                     currentIdx={cn.idx} onJump={cn.goto}
                     accent={accent} density={density}/>
        </div>

        {/* Names section */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <Kicker color={accent}>Names {cn.names.length > 0 && '· ' + cn.names.length}</Kicker>
            <span style={{ flex: 1 }}/>
            {cn.saved.size > 0 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                             letterSpacing: '0.12em', color: accent }}>
                ★ {cn.saved.size} SAVED
              </span>
            )}
          </div>
          {cn.names.length === 0 && cn.phase !== 'generating' && (
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 14.5, color: 'rgba(17,17,17,0.45)' }}>
              Finish the brief — names will arrive here.
            </p>
          )}
          {cn.phase === 'generating' && (
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 14.5, color: accent }}>
              Drafting… ({cn.names.length}/8)
            </p>
          )}
          <div>
            {cn.names.map((n) => (
              <NameRow key={n.id} {...n}
                       saved={cn.saved.has(n.id)}
                       onToggleSave={() => cn.toggleSave(n.id)}
                       accent={accent} density={density}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer bar (black, full width) ───────────────────────── */}
      <div style={{
        gridColumn: '1 / -1', gridRow: 2,
        background: 'var(--black)', color: 'var(--off-white)',
        display: 'flex', alignItems: 'center', padding: '0 32px',
        borderTop: '1px solid rgba(245,242,238,0.10)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                       fontSize: 18, letterSpacing: 0 }}>
          chatnamer
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                       letterSpacing: '0.14em', textTransform: 'uppercase',
                       color: 'rgba(245,242,238,0.45)', marginLeft: 12 }}>
          Created by Tanj.co
        </span>
        <span style={{ flex: 1 }}/>
        <Pips total={cn.total} current={cn.idx} accent="var(--lime)" dark/>
        <span style={{ marginLeft: 22, fontFamily: 'var(--font-body)', fontSize: 10,
                       fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                       color: 'rgba(245,242,238,0.55)' }}>
          {cn.phase === 'asking' ? `Q ${String(q.n).padStart(2,'0')} of ${String(cn.total).padStart(2,'0')}`
            : cn.phase === 'generating' ? 'Generating' : 'Results'}
        </span>
      </div>
    </div>
  );
}

window.DirectionA = DirectionA;
