/* ------------------------------------------------------------------
   Chatnamer v2 — Engine
   useChatnamer() — state, navigation, AI calls
   ------------------------------------------------------------------ */

// Mock fallback names when claude.complete is unavailable or fails.
// Deterministic so the prototype always feels alive.
const MOCK_NAMES = [
  { name: 'Halcyon',   kind: 'Coined',   etymology: 'Gk. ἀλκυών — calm, golden weather',           rationale: 'Classical roots, ownable, reads as a brand not a category.', domain: { com: 'taken', alt: '.co open' },   trademark: 'risky' },
  { name: 'Northbound',kind: 'Compound', etymology: 'Directional — destination implied',           rationale: 'Suggests momentum and orientation without naming the category.', domain: { com: 'taken', alt: '.io open' },  trademark: 'clear' },
  { name: 'Mercer',    kind: 'Founder',  etymology: 'M.E. — a dealer in fine cloth',               rationale: 'Surname-as-brand. Editorial, credible, magazine-masthead feel.', domain: { com: 'taken', alt: '.co open' }, trademark: 'risky' },
  { name: 'Tessera',   kind: 'Coined',   etymology: 'L. — a small mosaic tile',                    rationale: 'Suggests detail and craft. Sticks in the ear. Easy to clear.', domain: { com: 'open', alt: '' },           trademark: 'clear' },
  { name: 'Foreroom',  kind: 'Compound', etymology: 'Archaic — the front room of a shop',          rationale: 'Warm and specific. Unowned in trademark. Distinctive in search.', domain: { com: 'open', alt: '' },        trademark: 'clear' },
  { name: 'Quillon',   kind: 'Coined',   etymology: 'Fr. — the cross-guard of a sword',            rationale: 'Quiet authority. Two syllables. Reads as design-led.', domain: { com: 'open', alt: '' },                 trademark: 'clear' },
  { name: 'Bywater',   kind: 'Compound', etymology: 'Old English — a place beside the water',      rationale: 'Pastoral but unfussy. Could carry a serious editorial brand.', domain: { com: 'taken', alt: '.studio open' }, trademark: 'clear' },
  { name: 'Atlas Hall',kind: 'Compound', etymology: 'Gr. Titan + civic space',                     rationale: 'Two-word mark with weight. Works on a sign.', domain: { com: 'open', alt: '' },                          trademark: 'risky' },
  { name: 'Notable',   kind: 'Real',     etymology: 'L. notabilis — worth noting',                 rationale: 'Plain-spoken, confident. Conversational in copy.', domain: { com: 'taken', alt: '.co open' },              trademark: 'risky' },
  { name: 'Pendant',   kind: 'Real',     etymology: 'L. pendere — to hang, to weigh',              rationale: 'Tactile, contained. Suggests a careful weighing of things.', domain: { com: 'open', alt: '' },                trademark: 'clear' },
];

function pickMockNames(seed = 0, count = 6) {
  const shuffled = [...MOCK_NAMES];
  // simple deterministic-ish shuffle
  for (let i = 0; i < shuffled.length; i++) {
    const j = (i * 7 + seed * 13 + 3) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ── AI helpers ────────────────────────────────────────────────────────

async function aiGenerateChips(question, answers) {
  // Best-effort: ask Claude for 3 more contextual "try" chip suggestions.
  // Falls back to existing chips silently.
  if (!window.claude || !window.claude.complete) return null;
  try {
    const brief = Object.entries(answers)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join('\n');
    const prompt = [
      'You are helping someone name a brand. Suggest THREE short example answers to the question below, tailored to their brief so far.',
      'Each example: one short sentence, under 14 words, no lists, no quotes around it.',
      'Return STRICT JSON: { "chips": ["...", "...", "..."] }. No prose.',
      '',
      'Brief so far:',
      brief || '(empty)',
      '',
      'Question: ' + question.title,
      'Hint: ' + (question.hint || ''),
    ].join('\n');
    const raw = await window.claude.complete(prompt);
    const m = raw && raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]);
    if (Array.isArray(parsed.chips)) return parsed.chips.slice(0, 3).filter(Boolean);
  } catch (e) { /* swallow */ }
  return null;
}

async function aiGenerateNames(answers, opts = {}) {
  const count = opts.count || 8;
  const round = opts.round || 1;
  const refinement = opts.refinement || '';
  const previous = opts.previous || [];
  const saved = opts.saved || [];
  if (!window.claude || !window.claude.complete) return pickMockNames(Date.now(), count);
  try {
    const brief = Object.entries(answers).
    filter(([, v]) => v && v.trim()).
    map(([k, v]) => `- ${k}: ${v.trim()}`).
    join('\n');
    const refinementBlock = refinement ? [
      '',
      'ROUND ' + round + ' REFINEMENT NOTE from the user:',
      refinement,
      saved.length ? 'Names they saved from prior rounds: ' + saved.map((n) => n.name).join(', ') : '',
      previous.length ? 'Names already drafted (do NOT repeat): ' + previous.map((n) => n.name).join(', ') : '',
    ].filter(Boolean).join('\n') : '';
    const prompt = [
    'You are a senior brand-naming strategist at Tanj, an editorial NYC naming agency.',
    'Generate ' + count + ' candidate brand names for the brief below.',
    'Mix styles based on the user\'s stated preference. Each name should be ownable, distinct, and printable.',
    'Do NOT use puns, generic words, "ly" endings, or names that sound like every SaaS startup.',
    refinement ? 'This is ROUND ' + round + '. Push further. Mine the pattern of what they saved; avoid what they rejected.' : '',
    '',
    'Return STRICT JSON only, no prose:',
    '{ "names": [ { "name": "...", "kind": "Real|Compound|Coined|Founder", "etymology": "...", "rationale": "1-2 sentences, plain English", "domain": { "com": "open|taken", "alt": "" }, "trademark": "clear|risky|taken" } ] }',
    '',
    'Brief:',
    brief,
    refinementBlock,
    ].filter(Boolean).join('\n');
    const raw = await window.claude.complete(prompt);
    const m = raw && raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('no json');
    const parsed = JSON.parse(m[0]);
    if (!parsed.names || !parsed.names.length) throw new Error('no names');
    return parsed.names.map((n, i) => ({
      name: n.name,
      kind: n.kind || 'Coined',
      etymology: n.etymology || '',
      rationale: n.rationale || '',
      domain: n.domain || { com: i % 3 === 0 ? 'taken' : 'open', alt: '' },
      trademark: n.trademark || 'clear',
    }));
  } catch (e) {
  console.error('AI GENERATION FAILED:', e);
  throw e;
}
}

// ── useChatnamer hook ─────────────────────────────────────────────────

function useChatnamer() {
  const [answers, setAnswers] = React.useState(() => ({ ...DEFAULT_ANSWERS }));
  const [idx, setIdx]   = React.useState(0);
  const [names, setNames] = React.useState([]); // array of { id, round, ...nameObj }
  const [saved, setSaved] = React.useState(new Set());
  const [phase, setPhase] = React.useState('asking'); // 'asking' | 'generating' | 'results' | 'refining'
  const [aiChips, setAiChips] = React.useState({});  // {questionId: [..3 chips]}
  const [chipsLoading, setChipsLoading] = React.useState(false);
  const [round, setRound] = React.useState(0);       // 0 = not yet generated; 1+ after first gen
  const [refinement, setRefinement] = React.useState('');
  const [detailId, setDetailId] = React.useState(null); // currently open name detail
  const [depthCache, setDepthCache] = React.useState({}); // {nameId: depth data}
  const [depthLoading, setDepthLoading] = React.useState(false);
  const nameIdRef = React.useRef(1);

  const total = CHATNAMER_QUESTIONS.length;
  const question = CHATNAMER_QUESTIONS[idx];
  const isLast = idx === total - 1;
  const answeredCount = Object.values(answers).filter((v) => v && v.trim()).length;

  const setAnswer = React.useCallback((id, value) => {
    setAnswers((a) => ({ ...a, [id]: value }));
  }, []);
  const appendToAnswer = React.useCallback((id, fragment) => {
    setAnswers((a) => {
      const prev = a[id] || '';
      const sep = prev && !prev.endsWith(' ') ? ' ' : '';
      return { ...a, [id]: prev + sep + fragment };
    });
  }, []);

  const next = React.useCallback(() => setIdx((i) => Math.min(i + 1, total - 1)), [total]);
  const back = React.useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);
  const goto = React.useCallback((i) => setIdx(Math.max(0, Math.min(i, total - 1))), [total]);

  const generate = React.useCallback(async (opts = {}) => {
    const isRefine = !!opts.refinement;
    setPhase('generating');
    const nextRound = (isRefine ? round : 0) + 1;
    setRound(nextRound);
    // Round 1: clear; Round 2+: keep previous list, append new round below.
    const previous = isRefine ? names : [];
    if (!isRefine) setNames([]);
    const savedNames = names.filter((n) => saved.has(n.id));
    const batch = await aiGenerateNames(answers, {
      count: 8, round: nextRound,
      refinement: opts.refinement || '',
      previous, saved: savedNames,
    });
    for (const n of batch) {
      await new Promise((r) => setTimeout(r, 240 + Math.random() * 240));
      setNames((cur) => [...cur, { id: nameIdRef.current++, round: nextRound, ...n }]);
    }
    setPhase('results');
    setRefinement('');
  }, [answers, names, saved, round]);

  const startRefinement = React.useCallback(() => {
    setPhase('refining');
  }, []);
  const cancelRefinement = React.useCallback(() => {
    setPhase('results');
  }, []);

  const refreshChips = React.useCallback(async (questionId) => {
    setChipsLoading(true);
    const chips = await aiGenerateChips(
      CHATNAMER_QUESTIONS.find((q) => q.id === questionId),
      answers,
    );
    if (chips) setAiChips((c) => ({ ...c, [questionId]: chips }));
    setChipsLoading(false);
  }, [answers]);

  const toggleSave = React.useCallback((id) => {
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setAnswers({ ...DEFAULT_ANSWERS });
    setIdx(0);
    setNames([]);
    setSaved(new Set());
    setAiChips({});
    setPhase('asking');
    setRound(0);
    setRefinement('');
    setDetailId(null);
    setDepthCache({});
  }, []);

  // Deep-dive: load supplementary copy for a name (loaded lazily on detail open)
  const loadDepth = React.useCallback(async (nameObj) => {
    if (!nameObj || depthCache[nameObj.id]) return;
    setDepthLoading(true);
    let depth = null;
    if (window.claude && window.claude.complete) {
      try {
        const brief = Object.entries(answers).
        filter(([, v]) => v && v.trim()).
        map(([k, v]) => `${k}: ${v.trim()}`).
        join('\n');
        const prompt = [
        'You are a senior brand-naming strategist at Tanj. The user is reviewing a candidate name in deep-dive view.',
        'Generate concise editorial supplementary content. Tanj voice: short, declarative, confident, no fluff.',
        '',
        'Return STRICT JSON, no prose, exactly this shape:',
        '{',
        '  "why": "2-3 sentences on why this name works for the brief",',
        '  "suggests": ["3-5 word phrase", "3-5 word phrase", "3-5 word phrase"],',
        '  "sounds": ["phonetic adjacent", "phonetic adjacent", "phonetic adjacent"],',
        '  "sentence": "one short example tagline or in-context sentence",',
        '  "risk": "1 sentence on the trade-off / risk",',
        '  "domains": [{ "tld": ".com", "status": "open|taken|premium" }, ... 5 TLDs ...]',
        '}',
        '',
        'NAME: ' + nameObj.name,
        'KIND: ' + nameObj.kind,
        'ETYMOLOGY: ' + (nameObj.etymology || '—'),
        'EXISTING RATIONALE: ' + (nameObj.rationale || '—'),
        '',
        'BRIEF:',
        brief,
        ].join('\n');
        const raw = await window.claude.complete(prompt);
        const m = raw && raw.match(/\{[\s\S]*\}/);
        if (m) depth = JSON.parse(m[0]);
      } catch (e) { /* fall through */ }
    }
    if (!depth) {
      // Mock fallback
      depth = {
        why: nameObj.rationale || 'A confident, ownable mark with room to grow into.',
        suggests: ['Craft and care', 'Quiet authority', 'Considered taste'],
        sounds: ['Halcyon', 'Mercer', 'Tessera'],
        sentence: 'Welcome to ' + nameObj.name + '. We help you think before you ship.',
        risk: 'Reads abstract on first contact — will need an editorial system to anchor it.',
        domains: [
        { tld: '.com', status: nameObj.domain?.com === 'open' ? 'open' : 'taken' },
        { tld: '.co', status: 'open' },
        { tld: '.studio', status: 'open' },
        { tld: '.io', status: 'premium' },
        { tld: '.nyc', status: 'open' }],

      };
    }
    setDepthCache((c) => ({ ...c, [nameObj.id]: depth }));
    setDepthLoading(false);
  }, [answers, depthCache]);
  const savedNames = React.useMemo(
    () => names.filter((n) => saved.has(n.id)),
    [names, saved],
  );
  const detailName = React.useMemo(
    () => names.find((n) => n.id === detailId) || null,
    [names, detailId],
  );

  // Export modal state (always shown — clipboard is a best-effort bonus)
  const [exportText, setExportText] = React.useState(null);
  const closeExport = React.useCallback(() => setExportText(null), []);

  // Build the formatted text + try multiple clipboard paths.
  const exportSaved = React.useCallback(async () => {
    const list = savedNames.length ? savedNames : names;
    if (!list.length) return { ok: false, count: 0 };

    const header = `Chatnamer — ${savedNames.length ? 'Saved names' : 'All drafted names'}\n` +
      `${new Date().toLocaleDateString()}\n\n`;
    const body = list.map((n) =>
      `${n.name}  [${n.kind}${n.round ? ' · R' + String(n.round).padStart(2,'0') : ''}]\n` +
      (n.etymology ? `  ${n.etymology}\n` : '') +
      (n.rationale ? `  ${n.rationale}\n` : '') +
      `  .com ${n.domain?.com || 'unknown'}` +
      (n.domain?.alt ? `  ·  alt ${n.domain.alt}` : '') +
      `  ·  TM ${n.trademark || 'clear'}\n`,
    ).join('\n');
    const text = header + body;

    // Try the modern clipboard API first.
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (e) { /* fall through */ }

    // Fallback: execCommand on a temporary textarea.
    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '0'; ta.style.left = '0';
        ta.style.opacity = '0'; ta.style.pointerEvents = 'none';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        copied = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { copied = false; }
    }

    // ALWAYS surface the text in a modal — copy is a bonus, not a guarantee.
    setExportText({ text, count: list.length, copied });
    return { ok: copied, count: list.length, text };
  }, [savedNames, names]);

  return {
    // data
    questions: CHATNAMER_QUESTIONS,
    question, idx, total, isLast, answeredCount,
    answers, names, saved, savedNames, phase, aiChips, chipsLoading,
    round, refinement, detailId, detailName,
    depthCache, depthLoading,
    // actions
    setAnswer, appendToAnswer, next, back, goto,
    generate, refreshChips, toggleSave, reset,
    startRefinement, cancelRefinement, setRefinement,
    openDetail: setDetailId, closeDetail: () => setDetailId(null),
    loadDepth,
    exportSaved, exportText, closeExport,
  };
}

window.useChatnamer = useChatnamer;
window.aiGenerateNames = aiGenerateNames;
