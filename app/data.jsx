/* ------------------------------------------------------------------
   Chatnamer v2 — Question data
   8 questions: original 7 + inspirational brand names (new)
   Each question has 3 chip rails: try / spark / reframe
   ------------------------------------------------------------------ */
const CHATNAMER_QUESTIONS = [
  {
    id: 'category',
    n: 1,
    title: 'What do you need to name?',
    hint: 'A company, a product, or a service. Keep it simple but specific.',
    placeholder: 'A company that offers… A product that does…',
    chips: {
      try: [
        'A coffee subscription for offices',
        'An AI tool that drafts contracts',
        'A natural deodorant for runners',
      ],
      spark: [
        'Describe it like you would to your grandmother — one breath.',
        'What category will customers shop in to find you?',
        'If a journalist wrote one headline, what would it be?',
      ],
      reframe: [
        'Try: "We help X do Y so Z."',
        'Forget the product. What outcome does the customer get?',
        'If a competitor vanished, what would users miss?',
      ],
    },
  },
  {
    id: 'character',
    n: 2,
    title: 'Pick a character for your brand.',
    hint: 'A famous person, archetype, or unique personality the brand walks like.',
    placeholder: 'Think: Anthony Bourdain. Mr. Rogers. A retired race-car engineer…',
    chips: {
      try: [
        'Anthony Bourdain — direct, curious, no patience for fluff',
        'A jazz club owner who only books Tuesdays',
        'Patagonia\'s Yvon Chouinard — quiet conviction',
      ],
      spark: [
        'If your brand walked into a dinner party, who turns to look?',
        'Whose voice do you wish you sounded like in your category?',
        'Pick a film character — what do they say first?',
      ],
      reframe: [
        'Skip celebrities. What kind of person — barista, librarian, mechanic?',
        'Describe them in three adjectives and one habit.',
      ],
    },
  },
  {
    id: 'purpose',
    n: 3,
    title: 'What is your brand\'s purpose?',
    hint: 'One short sentence. Think big.',
    placeholder: 'To help people… To make the world…',
    chips: {
      try: [
        'To make legal work feel less like a tax.',
        'To put a barista in every office.',
        'To make running gear that doesn\'t smell after mile 10.',
      ],
      spark: [
        'Finish: "The world would be better if ___."',
        'What\'s broken about the way people do this today?',
        'Why did you start — not the polite answer, the real one?',
      ],
      reframe: [
        'Cut every word that could appear on a SaaS landing page.',
        'Read it out loud. Does it sound like you, or a press release?',
      ],
    },
  },
  {
    id: 'benefits',
    n: 4,
    title: 'Top 1–2 benefits. What makes it unique?',
    hint: 'Pick the sharpest two. Don\'t list six.',
    placeholder: 'Faster than… Without the… The first to…',
    chips: {
      try: [
        'Drafts in 8 minutes, not 8 hours.',
        'Same beans every Tuesday, ground that morning.',
        'No aluminum, no baking soda, no smell.',
      ],
      spark: [
        'What would a power user brag about to a friend?',
        'What\'s the line a competitor literally can\'t copy?',
        'Where is the asymmetry in your offer?',
      ],
      reframe: [
        'If you could keep one feature and delete the rest, which one?',
        'Replace "innovative" or "seamless" with a verb you can prove.',
      ],
    },
  },
  {
    id: 'tone',
    n: 5,
    title: 'Tonality. What mood do the names live in?',
    hint: '1–3 adjectives. Be specific.',
    placeholder: 'Calm and editorial. Sharp and dry. Warm but precise.',
    chips: {
      try: [
        'Confident, dry, a little wry',
        'Warm, hand-made, slightly off-beat',
        'Clinical, quiet, exact',
      ],
      spark: [
        'Which magazine\'s masthead matches your vibe?',
        'Pick a song. Now name three adjectives that describe it.',
        'Is your brand more whiskey or more tea?',
      ],
      reframe: [
        'Cut adjectives every brand uses (premium, modern, sleek).',
        'What tone are you NOT? Sometimes it\'s easier.',
      ],
    },
  },
  {
    id: 'style',
    n: 6,
    title: 'What style of names should we explore?',
    hint: 'Pick one for the cleanest results.',
    placeholder: 'Real words / Compounds / Coinages',
    chips: {
      try: [
        'Real words (Apple, Patagonia, Notion)',
        'Compounds & blends (Facebook, Snowflake, Oatly)',
        'Coinages — newly invented (Kodak, Häagen-Dazs, Xerox)',
      ],
      spark: [
        'Real words feel familiar. Coinages feel ownable. Compounds split the difference.',
        'Do you want a name that explains, or a name that intrigues?',
      ],
      reframe: [
        'If trademark and domain are tight, lean coined.',
        'If you want SEO discovery, real words help.',
      ],
    },
  },
  {
    id: 'length',
    n: 7,
    title: 'How long should the names be?',
    hint: 'The number of letters, not syllables. Skip if you don\'t care.',
    placeholder: '4–8 letters. Up to 12. Don\'t care.',
    chips: {
      try: ['4–6 letters', '5–8 letters', '6–10 letters', 'Don\'t care'],
      spark: [
        'Short names hit harder but cost more to clear.',
        'Two syllables read as friendlier than one.',
      ],
      reframe: [
        'Test by saying it on a phone call. Did you have to spell it?',
      ],
    },
  },
  {
    id: 'inspirations',
    n: 8,
    title: 'Brand names that inspire you.',
    hint: 'List up to 5 from any category — the ones you secretly wish you\'d named.',
    placeholder: 'Aesop. Liquid Death. Method. Oatly…',
    chips: {
      try: [
        'Aesop, Method, Oatly',
        'Liquid Death, Death Wish, Mschf',
        'Patagonia, Filson, Snow Peak',
      ],
      spark: [
        'Which name in your industry do you envy?',
        'Which name OUTSIDE your industry would steal customers?',
        'Pick one you love and one you find overrated. Why?',
      ],
      reframe: [
        'You don\'t want to copy them. We\'ll mine the pattern, not the spelling.',
      ],
    },
  },
];

const DEFAULT_ANSWERS = CHATNAMER_QUESTIONS.reduce((a, q) => (a[q.id] = '', a), {});

window.CHATNAMER_QUESTIONS = CHATNAMER_QUESTIONS;
window.DEFAULT_ANSWERS = DEFAULT_ANSWERS;
