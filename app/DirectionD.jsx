/* ------------------------------------------------------------------
   Direction D — Dark Hall + Scroll Room (combined)
   Full dark left side with T-bar ghost field & orange accents.
   Editorial intro headline + scrolling conversation (all Q&A in view).
   Warm-white names rail on right.
   ------------------------------------------------------------------ */

function DirectionD({ width = 1280, height = 860, tweaks = {} }) {
  const cn = useChatnamer();
  const accent = 'var(--orange)';
  const showChips = tweaks.showChips !== false;
  const density = tweaks.density || 'editorial';
  const [toastView, showToast] = useToast();

  const handleExport = async () => {
    await cn.exportSaved();
  };

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

  const muted = 'rgba(245,242,238,0.55)';
  const ink = 'rgba(245,242,238,0.78)';
  const rule = 'rgba(245,242,238,0.10)';

  return (
    <div data-screen-label="D · Dark Studio" style={{
      width, height, position: 'relative', overflow: 'hidden',
      background: 'var(--black)', color: 'var(--off-white)',
      fontFamily: 'var(--font-body)',
      display: 'grid',
      gridTemplateColumns: '1.45fr 1fr',
      gridTemplateRows: '52px 1fr'
    }}>
      {/* ── Top status strip (orange) ───────────────────────────── */}
      <div style={{
        gridColumn: '1 / -1', gridRow: 1,
        background: 'var(--black)',
        display: 'flex', alignItems: 'center', padding: '0 28px',
        borderBottom: '1px solid ' + rule, position: 'relative',
        zIndex: 2
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
          fontSize: 18, letterSpacing: 0, color: 'var(--off-white)' }}>Chatnamer

        </span>
        <span style={{ width: 1, height: 18, background: rule, margin: '0 16px' }} />
        <Kicker color="rgba(245,242,238,0.45)">Created by Tanj.co</Kicker>

        <span style={{ flex: 1 }} />
        <Kicker color={accent}>
          {cn.phase === 'asking' ? `Asking · ${cn.answeredCount}/${cn.total}` :
          cn.phase === 'generating' ? `Naming · ${cn.names.length}/${cn.round > 1 ? cn.names.length : 8}` :
          cn.phase === 'refining' ? `Refining · Round ${String((cn.round || 1) + 1).padStart(2, '0')}` :
          `Round ${String(cn.round || 1).padStart(2,'0')} · ${cn.names.length} drafted, ${cn.saved.size} saved`}
        </Kicker>
        <span style={{ width: 20 }} />
        <Pips total={cn.total} current={cn.idx} accent={accent} dark />
      </div>

      {/* ── Left: dark scrolling conversation ───────────────────── */}
      <div ref={scrollRef} style={{
        gridColumn: 1, gridRow: 2,
        position: 'relative', overflowY: 'auto',
        background: 'var(--black)',
        padding: density === 'compact' ? '32px 56px 56px' : '44px 72px 72px'
      }}>
        <TBarField opacity={0.045} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Editorial intro — borrowed & dark-styled from Direction C */}
          <div style={{ marginBottom: density === 'compact' ? 30 : 44 }}>
            <Kicker color={accent}>The brief</Kicker>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
              fontSize: density === 'compact' ? 56 : 76,
              lineHeight: 0.96, letterSpacing: 0,
              color: 'var(--off-white)', marginTop: 14, maxWidth: 720 }}>
              Eight questions.<br />
              <em style={{ color: accent }}>One sharp brief.</em>
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400,
              fontSize: 14.5, lineHeight: 1.65,
              color: muted, marginTop: 18, maxWidth: 540 }}>Talk to Chatnamer like a strategist, not a form. Type freely or click a chip. It listens, then names your brand.


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
                marginBottom: density === 'compact' ? 24 : 36,
                paddingBottom: density === 'compact' ? 18 : 24,
                borderBottom: isCurrent ? 'none' : '1px solid ' + rule
              }}>
                {/* Question header — kicker + edit button */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <Kicker color={isCurrent ? accent : 'rgba(245,242,238,0.40)'}>
                    {String(qq.n).padStart(2, '0')} · {qq.id}
                  </Kicker>
                  {!isCurrent &&
                  <button onClick={() => cn.goto(i)} style={{
                    appearance: 'none', background: 'transparent', border: 'none',
                    fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: muted, cursor: 'pointer', padding: 0
                  }}>Edit ↗</button>
                  }
                </div>

                {/* The question itself */}
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: isCurrent ? 'italic' : 'normal',
                  fontWeight: 400,
                  fontSize: isCurrent ? density === 'compact' ? 38 : 48 : 22,
                  lineHeight: isCurrent ? 0.98 : 1.15,
                  letterSpacing: 0,
                  color: isCurrent ? 'var(--off-white)' : ink,
                  maxWidth: isCurrent ? 660 : 600
                }}>
                  {qq.title}
                </h2>

                {isCurrent ?
                <>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400,
                    fontSize: 14, lineHeight: 1.55,
                    color: muted, marginTop: 14, maxWidth: 540 }}>
                      {qq.hint}
                    </p>

                    {/* Intuitive editorial input — orange left rule */}
                    <div style={{ marginTop: density === 'compact' ? 20 : 28, maxWidth: 660 }}>
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
                      className="dark"
                      style={{
                        width: '100%', border: 'none', outline: 'none',
                        background: 'transparent', resize: 'none',
                        fontFamily: 'var(--font-display)', fontWeight: 400,
                        fontSize: density === 'compact' ? 24 : 30, lineHeight: 1.3,
                        color: 'var(--off-white)',
                        borderLeft: '3px solid ' + accent,
                        paddingLeft: 18, paddingTop: 2,
                        caretColor: accent
                      }} />
                    
                    </div>

                    <ChipRail
                    question={qq} answers={cn.answers} aiChips={cn.aiChips}
                    chipsLoading={cn.chipsLoading}
                    onInsert={(t) => cn.appendToAnswer(qq.id, t)}
                    onRequestAi={() => cn.refreshChips(qq.id)}
                    accent={accent} dark={true}
                    density={density === 'compact' ? 'compact' : 'editorial'}
                    visible={showChips} />
                  

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center',
                    marginTop: density === 'compact' ? 26 : 36 }}>
                      {cn.idx > 0 &&
                    <SecondaryBtn onClick={cn.back} dark accent={accent}>← Back</SecondaryBtn>
                    }
                      {!cn.isLast &&
                    <PrimaryBtn onClick={cn.next} disabled={!v.trim()} dark accent={accent}>
                          Next question →
                        </PrimaryBtn>
                    }
                      {cn.isLast &&
                    <PrimaryBtn onClick={cn.generate} disabled={!v.trim()} dark accent={accent}>
                          Generate names →
                        </PrimaryBtn>
                    }
                      <span style={{ flex: 1 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                      color: muted }}>
                        ⌘ + ↩ to continue
                      </span>
                    </div>
                  </> :

                // Past answer — italic Georgia quote with orange left rule
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: density === 'compact' ? 18 : 22, lineHeight: 1.3,
                  color: a ? 'var(--off-white)' : 'rgba(245,242,238,0.35)',
                  borderLeft: '2px solid ' + (a ? accent : rule),
                  paddingLeft: 16, marginTop: 12, maxWidth: 580
                }}>
                    {a || '— skipped'}
                  </div>
                }
              </div>);

          })}

          {/* Generating state */}
          {cn.phase === 'generating' &&
          <div style={{ marginTop: 24, animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
              <Kicker color={accent}>Working</Kicker>
              <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontWeight: 400, fontSize: 64, lineHeight: 0.96,
              color: 'var(--off-white)', marginTop: 14, maxWidth: 600 }}>
                Reading your brief.<br />Drafting names.
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13,
              color: muted, marginTop: 16,
              letterSpacing: '0.04em' }}>
                {cn.names.length} of 8 drafted →
              </p>
            </div>
          }

          {/* Results state header */}
          {cn.phase === 'results' &&
          <div style={{ marginTop: 28, animation: 'fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
              <Kicker color={accent}>Round {String(cn.round || 1).padStart(2,'0')} complete</Kicker>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400,
              fontSize: 60, lineHeight: 0.98,
              color: 'var(--off-white)', marginTop: 14, maxWidth: 580 }}>
                {cn.round > 1 ? <>{8 * cn.round} names on the table.<br /></> : <>Eight starting points.<br /></>}
                <em style={{ color: accent }}>Save what catches.</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.65,
              color: muted, marginTop: 16, maxWidth: 520 }}>
                Star the names with pull, then tell us what's working. Round {String((cn.round || 1) + 1).padStart(2,'0')} will mine the pattern.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <PrimaryBtn onClick={cn.startRefinement} dark accent={accent}>
                  Refine · Round {String((cn.round || 1) + 1).padStart(2,'0')} →
                </PrimaryBtn>
                <SecondaryBtn onClick={handleExport} dark accent={accent}>
                  {cn.saved.size > 0 ? `Copy ${cn.saved.size} saved` : 'Copy all'}
                </SecondaryBtn>
                <SecondaryBtn onClick={cn.reset} dark accent={accent}>Start over</SecondaryBtn>
              </div>
            </div>
          }

          {/* Refinement state — inline block */}
          {cn.phase === 'refining' &&
            <RefineBlock cn={cn} accent={accent} dark density={density} />
          }
        </div>
      </div>

      {/* ── Right: warm-white names rail ──────────────────────── */}
      <div style={{
        gridColumn: 2, gridRow: 2,
        background: 'var(--warm-white)', color: 'var(--black)',
        padding: density === 'compact' ? '28px 32px' : '36px 40px',
        overflowY: 'auto', position: 'relative',
        borderLeft: '1px solid ' + rule
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
          <Kicker color={accent}>
            {cn.phase === 'results' || cn.phase === 'refining' ? 'Names · ' + cn.names.length : 'Names'}
          </Kicker>
          <span style={{ flex: 1 }} />
          {cn.saved.size > 0 &&
          <button onClick={handleExport}
            style={{ appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: accent }}>
              ★ {cn.saved.size} Saved — Copy →
            </button>
          }
        </div>

        <SavedTray cn={cn} accent={accent} onExport={handleExport}/>

        {cn.names.length === 0 && cn.phase !== 'generating' &&
        <div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 17, lineHeight: 1.35,
            color: 'rgba(17,17,17,0.55)', marginBottom: 22 }}>
              Names arrive once the brief is sharp.
            </p>
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 18 }}>
              <Kicker color="rgba(17,17,17,0.45)">What we know so far</Kicker>
              <div style={{ marginTop: 10 }}>
                {cn.questions.filter((qq) => cn.answers[qq.id]).map((qq) =>
              <div key={qq.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 9,
                  fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.45)', marginBottom: 4 }}>
                      {qq.id}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5,
                  lineHeight: 1.55, color: 'var(--ink)' }}>
                      {cn.answers[qq.id]}
                    </div>
                  </div>
              )}
                {cn.answeredCount === 0 &&
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 14, color: 'rgba(17,17,17,0.35)' }}>
                    Nothing yet. Start with question 01.
                  </p>
              }
              </div>
            </div>
          </div>
        }

        {cn.phase === 'generating' && cn.names.length === 0 &&
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 17, color: accent }}>
            Drafting…
          </p>
        }

        {cn.names.map((n) =>
        <NameRow key={n.id} {...n}
        saved={cn.saved.has(n.id)}
        onToggleSave={() => cn.toggleSave(n.id)}
        onOpenDetail={() => cn.openDetail(n.id)}
        accent={accent} density={density === 'compact' ? 'compact' : 'compact'} />
        )}

        {(cn.phase === 'results' || cn.phase === 'refining') && cn.names.length > 0 &&
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rule)',
          display: 'flex', gap: 10 }}>
            <SecondaryBtn onClick={handleExport}>
              Copy list
            </SecondaryBtn>
            {cn.phase === 'results' &&
              <PrimaryBtn onClick={cn.startRefinement} accent={accent}>
                Refine →
              </PrimaryBtn>
            }
          </div>
        }
      </div>

      {/* Name detail overlay */}
      {cn.detailName && <NameDetail cn={cn} accent={accent}/>}

      {/* Export modal (clipboard fallback) */}
      <ExportModal cn={cn} accent={accent}/>

      {/* Toast */}
      {toastView}
    </div>);

}

window.DirectionD = DirectionD;