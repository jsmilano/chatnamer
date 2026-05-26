/* ------------------------------------------------------------------
   Direction B — Dark Hall
   Black left side with T-bar ghost field & lime accents. Italic Georgia
   question. Right: warm-white results column.
   ------------------------------------------------------------------ */

function DirectionB({ width = 1280, height = 860, tweaks = {} }) {
  const cn = useChatnamer();
  const accent = 'var(--lime)';     // lime in this direction
  const resultAccent = 'var(--orange)'; // results column uses orange (one accent per surface)
  const showChips = tweaks.showChips !== false;
  const density = tweaks.density || 'editorial';

  const q = cn.question;
  const v = cn.answers[q.id] || '';

  const colRef = React.useRef(null);
  React.useEffect(() => { if (colRef.current) colRef.current.scrollTop = 0; }, [cn.idx, cn.phase]);

  return (
    <div data-screen-label="B · Dark Hall" style={{
      width, height, position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-body)', color: 'var(--off-white)',
      display: 'grid', gridTemplateColumns: '1.25fr 1fr',
      background: 'var(--black)',
    }}>
      {/* ── Left: dark hall ─────────────────────────────────────── */}
      <div ref={colRef} style={{
        position: 'relative', overflowY: 'auto',
        background: 'var(--black)',
        padding: density === 'compact' ? '40px 56px 32px' : '60px 72px 40px',
      }}>
        <TBarField opacity={0.05}/>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                           fontSize: 20, letterSpacing: 0, color: 'var(--off-white)' }}>
              chatnamer
            </span>
            <Kicker color="rgba(245,242,238,0.45)">Created by Tanj.co</Kicker>
            <span style={{ flex: 1 }}/>
            <Kicker color={accent}>
              Q {String(q.n).padStart(2,'0')} / {String(cn.total).padStart(2,'0')}
            </Kicker>
            <Pips total={cn.total} current={cn.idx} accent={accent} dark/>
          </div>

          {cn.phase === 'asking' && (
            <div key={'qB-' + cn.idx} className="a1">
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                           fontWeight: 400,
                           fontSize: density === 'compact' ? 52 : 72,
                           lineHeight: 0.96, letterSpacing: 0,
                           color: 'var(--off-white)', maxWidth: 660 }}>
                {q.title}
              </h1>

              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400,
                          fontSize: 15, lineHeight: 1.5,
                          color: 'rgba(245,242,238,0.62)',
                          marginTop: 20, maxWidth: 540 }}>
                {q.hint}
              </p>

              {/* Answer */}
              <div style={{ marginTop: density === 'compact' ? 26 : 40, maxWidth: 660 }}>
                <textarea
                  value={v} onChange={(e) => cn.setAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={Math.max(2, Math.min(6, v.split('\n').length + 1))}
                  style={{
                    width: '100%', border: 'none', outline: 'none',
                    background: 'transparent', resize: 'none',
                    fontFamily: 'var(--font-display)', fontWeight: 400,
                    fontSize: density === 'compact' ? 22 : 28, lineHeight: 1.35,
                    color: 'var(--off-white)',
                    borderBottom: '2px solid ' + accent,
                    paddingBottom: 12, caretColor: accent,
                  }}
                />
              </div>

              <ChipRail
                question={q} answers={cn.answers} aiChips={cn.aiChips}
                chipsLoading={cn.chipsLoading}
                onInsert={(t) => cn.appendToAnswer(q.id, t)}
                onRequestAi={() => cn.refreshChips(q.id)}
                accent={accent} dark={true} density={density} visible={showChips}
              />

              <div style={{ display: 'flex', gap: 12, alignItems: 'center',
                            marginTop: density === 'compact' ? 28 : 44 }}>
                {cn.idx > 0 && <SecondaryBtn onClick={cn.back} dark accent={accent}>← Back</SecondaryBtn>}
                {!cn.isLast && (
                  <PrimaryBtn onClick={cn.next} disabled={!v.trim()} dark accent={accent}>Continue →</PrimaryBtn>
                )}
                {cn.isLast && (
                  <PrimaryBtn onClick={cn.generate} disabled={!v.trim()} dark accent={accent}>
                    Generate names →
                  </PrimaryBtn>
                )}
                <span style={{ flex: 1 }}/>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                               letterSpacing: '0.14em', textTransform: 'uppercase',
                               color: 'rgba(245,242,238,0.5)' }}>
                  {cn.answeredCount}/{cn.total} answered
                </span>
              </div>
            </div>
          )}

          {cn.phase === 'generating' && (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
                          minHeight: '60vh', maxWidth: 620 }}>
              <Kicker color={accent}>Listening</Kicker>
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                           fontWeight: 400, fontSize: 80, lineHeight: 0.96,
                           color: 'var(--off-white)', marginTop: 18 }}>
                The room is quiet.<br/>The names arrive.
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14,
                          color: 'rgba(245,242,238,0.62)', marginTop: 22,
                          letterSpacing: '0.04em' }}>
                {cn.names.length} of 8 drafted →
              </p>
            </div>
          )}

          {cn.phase === 'results' && (
            <div className="a1">
              <Kicker color={accent}>Round 01 · 8 names</Kicker>
              <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                           fontWeight: 400, fontSize: 72, lineHeight: 0.96,
                           color: 'var(--off-white)', marginTop: 14, maxWidth: 600 }}>
                Eight openings.<br/>
                <span style={{ fontStyle: 'normal', color: accent }}>Save what catches.</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.65,
                          color: 'rgba(245,242,238,0.72)', marginTop: 22, maxWidth: 520 }}>
                Draft candidates, not the final list. Star the ones with pull; tell us why;
                we'll mine the pattern and run round two.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <PrimaryBtn onClick={cn.generate} dark accent={accent}>Run round 02 →</PrimaryBtn>
                <SecondaryBtn onClick={cn.reset} dark accent={accent}>Start over</SecondaryBtn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: warm-white results / brief ──────────────────── */}
      <div style={{
        background: 'var(--warm-white)', color: 'var(--black)',
        padding: density === 'compact' ? '28px 36px' : '34px 44px',
        overflowY: 'auto', position: 'relative',
        borderLeft: '1px solid var(--rule)',
      }}>
        {/* Mini brief */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <Kicker color="rgba(17,17,17,0.45)">Brief</Kicker>
            <span style={{ flex: 1 }}/>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                           letterSpacing: '0.12em', color: 'rgba(17,17,17,0.45)' }}>
              {cn.answeredCount}/{cn.total}
            </span>
          </div>
          <BriefList questions={cn.questions} answers={cn.answers}
                     currentIdx={cn.idx} onJump={cn.goto}
                     accent={resultAccent} density={density}/>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <Kicker color={resultAccent}>Names {cn.names.length > 0 && '· ' + cn.names.length}</Kicker>
            <span style={{ flex: 1 }}/>
            {cn.saved.size > 0 && (
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                             letterSpacing: '0.12em', color: resultAccent }}>
                ★ {cn.saved.size} SAVED
              </span>
            )}
          </div>
          {cn.names.length === 0 && cn.phase !== 'generating' && (
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 14.5, color: 'rgba(17,17,17,0.45)' }}>
              Finish the brief — names arrive here.
            </p>
          )}
          {cn.phase === 'generating' && (
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 14.5, color: resultAccent }}>
              Drafting… ({cn.names.length}/8)
            </p>
          )}
          {cn.names.map((n) => (
            <NameRow key={n.id} {...n}
                     saved={cn.saved.has(n.id)}
                     onToggleSave={() => cn.toggleSave(n.id)}
                     accent={resultAccent} density={density}/>
          ))}
        </div>
      </div>
    </div>
  );
}

window.DirectionB = DirectionB;
