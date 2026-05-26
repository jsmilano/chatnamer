/* ------------------------------------------------------------------
   Direction C — Scroll Room
   Scrolling conversational left column (all prior Q&A visible),
   sticky narrow names rail on right. Marquee status strip on top.
   ------------------------------------------------------------------ */

function DirectionC({ width = 1280, height = 860, tweaks = {} }) {
  const cn = useChatnamer();
  const accent = 'var(--orange)';
  const showChips = tweaks.showChips !== false;
  const density = tweaks.density || 'editorial';

  const q = cn.question;
  const v = cn.answers[q.id] || '';

  const scrollRef = React.useRef(null);
  const currentRef = React.useRef(null);

  // Auto-scroll to current question when it changes
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (currentRef.current && scrollRef.current) {
        const el = currentRef.current;
        const sc = scrollRef.current;
        sc.scrollTo({ top: el.offsetTop - 24, behavior: 'smooth' });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [cn.idx]);

  return (
    <div data-screen-label="C · Scroll Room" style={{
      width, height, position: 'relative', overflow: 'hidden',
      background: 'var(--off-white)', color: 'var(--black)',
      fontFamily: 'var(--font-body)',
      display: 'grid', gridTemplateColumns: '1.5fr 1fr',
      gridTemplateRows: '44px 1fr',
    }}>
      {/* ── Top marquee strip ───────────────────────────────────── */}
      <div style={{
        gridColumn: '1 / -1', gridRow: 1,
        background: 'var(--black)', color: 'var(--off-white)',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        borderBottom: '1px solid rgba(245,242,238,0.10)',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                       fontSize: 16, letterSpacing: 0 }}>chatnamer</span>
        <Kicker color="rgba(245,242,238,0.45)">Created by Tanj.co</Kicker>
        <span style={{ flex: 1 }}/>
        <Kicker color="var(--lime)">
          {cn.phase === 'asking' ? `Asking · ${cn.answeredCount}/${cn.total}`
            : cn.phase === 'generating' ? `Naming · ${cn.names.length}/8`
            : `Results · ${cn.names.length} drafted, ${cn.saved.size} saved`}
        </Kicker>
        <span style={{ width: 22 }}/>
        <Pips total={cn.total} current={cn.idx} accent="var(--lime)" dark/>
      </div>

      {/* ── Left: scrolling conversation ────────────────────────── */}
      <div ref={scrollRef} style={{
        gridColumn: 1, gridRow: 2, overflowY: 'auto', position: 'relative',
        padding: density === 'compact' ? '24px 56px 48px' : '36px 72px 64px',
        borderRight: '1px solid var(--rule)',
      }}>
        {/* Intro */}
        <div style={{ marginBottom: 28 }}>
          <Kicker color={accent}>The brief</Kicker>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                       fontSize: density === 'compact' ? 36 : 44, lineHeight: 1.0,
                       marginTop: 12, maxWidth: 560 }}>
            Eight questions.<br/>
            <em style={{ color: 'rgba(17,17,17,0.55)' }}>One sharper brief.</em>
          </h1>
        </div>

        {/* Past Q&A entries — only those before current */}
        {cn.questions.map((qq, i) => {
          if (i > cn.idx) return null;
          const isCurrent = i === cn.idx && cn.phase === 'asking';
          const a = cn.answers[qq.id];
          return (
            <div key={qq.id}
                 ref={isCurrent ? currentRef : null}
                 style={{ marginBottom: density === 'compact' ? 24 : 32,
                          paddingBottom: density === 'compact' ? 18 : 24,
                          borderBottom: isCurrent ? 'none' : '1px solid var(--rule)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <Kicker color={isCurrent ? accent : 'rgba(17,17,17,0.45)'}>
                  {String(qq.n).padStart(2,'0')} · {qq.id}
                </Kicker>
                {!isCurrent && (
                  <button onClick={() => cn.goto(i)} style={{
                    appearance: 'none', background: 'transparent', border: 'none',
                    fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: 'rgba(17,17,17,0.45)', cursor: 'pointer', padding: 0,
                  }}>Edit ↗</button>
                )}
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                           fontSize: isCurrent ? (density === 'compact' ? 30 : 38) : 22,
                           lineHeight: 1.1, letterSpacing: 0,
                           color: isCurrent ? 'var(--black)' : 'var(--ink)',
                           maxWidth: 600 }}>
                {qq.title}
              </h2>

              {isCurrent ? (
                <>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                              fontSize: 15, color: 'rgba(17,17,17,0.55)',
                              marginTop: 10, maxWidth: 540 }}>
                    {qq.hint}
                  </p>
                  <div style={{ marginTop: 18, maxWidth: 600 }}>
                    <textarea
                      value={v} onChange={(e) => cn.setAnswer(qq.id, e.target.value)}
                      placeholder={qq.placeholder}
                      rows={Math.max(2, Math.min(5, v.split('\n').length + 1))}
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        background: 'transparent', resize: 'none',
                        fontFamily: 'var(--font-display)', fontWeight: 400,
                        fontSize: 22, lineHeight: 1.35,
                        color: 'var(--black)',
                        borderLeft: '3px solid ' + accent,
                        paddingLeft: 16, paddingTop: 2,
                      }}
                    />
                  </div>

                  <ChipRail
                    question={qq} answers={cn.answers} aiChips={cn.aiChips}
                    chipsLoading={cn.chipsLoading}
                    onInsert={(t) => cn.appendToAnswer(qq.id, t)}
                    onRequestAi={() => cn.refreshChips(qq.id)}
                    accent={accent} dark={false} density="compact" visible={showChips}
                  />

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
                    {cn.idx > 0 && <SecondaryBtn onClick={cn.back}>← Back</SecondaryBtn>}
                    {!cn.isLast && (
                      <PrimaryBtn onClick={cn.next} disabled={!v.trim()}>Next question →</PrimaryBtn>
                    )}
                    {cn.isLast && (
                      <PrimaryBtn onClick={cn.generate} disabled={!v.trim()}>
                        Generate names →
                      </PrimaryBtn>
                    )}
                  </div>
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: density === 'compact' ? 18 : 21, lineHeight: 1.3,
                  color: a ? 'var(--black)' : 'rgba(17,17,17,0.35)',
                  borderLeft: '2px solid ' + (a ? accent : 'rgba(17,17,17,0.15)'),
                  paddingLeft: 14, marginTop: 12, maxWidth: 580,
                }}>
                  {a || '— skipped'}
                </div>
              )}
            </div>
          );
        })}

        {/* Generating state */}
        {cn.phase === 'generating' && (
          <div style={{ marginTop: 32, animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
            <Kicker color={accent}>Working</Kicker>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                         fontWeight: 400, fontSize: 48, lineHeight: 1.0,
                         marginTop: 14, maxWidth: 580 }}>
              Reading the brief.<br/>Drafting names.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13,
                        color: 'rgba(17,17,17,0.55)', marginTop: 14,
                        letterSpacing: '0.04em' }}>
              {cn.names.length} of 8 →
            </p>
          </div>
        )}

        {/* Results state header */}
        {cn.phase === 'results' && (
          <div style={{ marginTop: 32, animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
            <Kicker color={accent}>Round 01 complete</Kicker>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
                         fontSize: 44, lineHeight: 1.0,
                         marginTop: 14, maxWidth: 560 }}>
              Eight starting points.<br/>
              <em style={{ color: 'rgba(17,17,17,0.55)' }}>Star the ones with pull.</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.65,
                        color: 'var(--ink)', marginTop: 14, maxWidth: 520 }}>
              Tell us what you saved and why. Round two will mine the pattern.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
              <PrimaryBtn onClick={cn.generate}>Run round 02 →</PrimaryBtn>
              <SecondaryBtn onClick={cn.reset}>Start over</SecondaryBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: sticky names rail ──────────────────────────── */}
      <div style={{
        gridColumn: 2, gridRow: 2,
        background: 'var(--warm-white)',
        padding: density === 'compact' ? '24px 28px' : '30px 36px',
        overflowY: 'auto', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <Kicker color={accent}>
            {cn.phase === 'results' ? 'Names · ' + cn.names.length : 'Names so far'}
          </Kicker>
          <span style={{ flex: 1 }}/>
          {cn.saved.size > 0 && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                           letterSpacing: '0.12em', color: accent }}>
              ★ {cn.saved.size} SAVED
            </span>
          )}
        </div>

        {cn.names.length === 0 && cn.phase !== 'generating' && (
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 17, color: 'rgba(17,17,17,0.55)',
                        lineHeight: 1.35, marginBottom: 20 }}>
              The list arrives once you finish the brief.
            </p>
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 16 }}>
              <Kicker color="rgba(17,17,17,0.45)">What we know so far</Kicker>
              <div style={{ marginTop: 10 }}>
                {cn.questions.filter((qq) => cn.answers[qq.id]).map((qq) => (
                  <div key={qq.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9,
                                  fontWeight: 700, letterSpacing: '0.14em',
                                  textTransform: 'uppercase',
                                  color: 'rgba(17,17,17,0.45)', marginBottom: 4 }}>
                      {qq.id}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13,
                                  lineHeight: 1.55, color: 'var(--ink)' }}>
                      {cn.answers[qq.id]}
                    </div>
                  </div>
                ))}
                {cn.answeredCount === 0 && (
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                              fontSize: 14, color: 'rgba(17,17,17,0.35)' }}>
                    Nothing yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {cn.phase === 'generating' && cn.names.length === 0 && (
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 17, color: accent }}>
            Drafting…
          </p>
        )}

        {cn.names.map((n) => (
          <NameRow key={n.id} {...n}
                   saved={cn.saved.has(n.id)}
                   onToggleSave={() => cn.toggleSave(n.id)}
                   accent={accent} density="compact"/>
        ))}
      </div>
    </div>
  );
}

window.DirectionC = DirectionC;
