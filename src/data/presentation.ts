/**
 * Every word of the SoCo Startup Week deck, lifted out of the slide
 * components so the Apotome editor kit can reach it.
 *
 * One key per slide, named after the component
 * (`SlideJunction` -> `junction`). The slides render from here and hold
 * nothing but markup, so a published edit reaches the deck without a deploy.
 *
 * Three rules shape the shapes below. All of them follow from how the kit
 * binds: it walks the DOM for an element whose whole text equals a config
 * string, and the editor bar has no field list, so a string that is never
 * some element's *entire* text cannot be edited at all.
 *
 * - A line that mixes plain text with a nested <em>/<strong>, or that breaks
 *   across a <br />, becomes one key per run ("body" + "bodyEmphasis",
 *   "headLine1" + "headLine2"). The slide wraps each run in its own inline
 *   <span> so every key owns an element. Bare spans carry no styling in
 *   presentation.css, so the render is unchanged.
 * - Anything that is a CSS value rather than copy - an accent custom
 *   property, an HTF highlighter class list - is keyed `swatch`, which is in
 *   the kit's SKIP_KEYS, so it never shows up as editable text.
 * - Keys the kit skips outright (id, url, date, image, icon...) are avoided
 *   for real copy: a schedule uses `when`, a wordmark uses `web`. Route
 *   fragments like "/cities" stay under `webPath`, where the kit's URL rule
 *   correctly leaves them alone.
 */

/* non-breaking space, spelled out so the separators survive a copy/paste */
const NB = '\u00A0'

export const presentation = {
  /* 01 - title */
  title: {
    line1: 'Hack_',
    line2: 'Trinidad_',
    line3: 'Forward_',
    tagPrimary: 'SoCo Startup Week 2026',
    tagSecondary: 'What a small town builds in 48 hours',
    byline: `Kisora Thomas ${NB}·${NB} Joze Petrich ${NB}·${NB} Trinidad, CO`,
  },

  /* 02 - your hosts */
  host: {
    eyebrow: 'Apotome Labs × Emergent Campus',
    headLine1: "Hi, we're",
    headLine2: 'your hosts!',
    /* one <strong> per name, so the paragraph splits into six runs */
    bodyName1: 'Kisora Thomas',
    bodyPart1: '— founder of Apotome Labs, a software studio in Trinidad, Colorado.',
    bodyName2: 'Joze Petrich',
    bodyPart2: '— Emergent Campus, creator of the Rural Pattern Language. Last November we ran',
    bodyName3: 'Hack Trinidad Forward',
    bodyPart3:
      ", our town's first hackathon. This is the story of that weekend — and of where it's headed next.",
    captionKisora: 'Kisora',
    captionJoze: 'Joze',
  },

  /* 03 - the hackathon */
  hackathon: {
    headLead: "Trinidad's first",
    headHl: 'hackathon_',
    lede: 'Focused on civic innovation — inspiring and amplifying the voices of our residents to create real impact in a town of 8,000 people.',
    /* keyed rather than a list: the four tiles are hand-placed in the
       template, each with its own entrance delay */
    stats: {
      hours: { value: '48', label: 'hours of hacking' },
      sponsors: { value: '16', label: 'sponsors & partners' },
      prizes: { value: '$1.6K', label: 'in prizes awarded' },
      projects: { value: '6', label: 'projects took home prizes' },
    },
    when: 'November 14–16, 2025',
    where: 'Emergent Campus · Trinidad, CO',
  },

  /* 04 - the weekend */
  weekend: {
    heading: 'The weekend_',
    days: [
      {
        name: 'Friday_',
        swatch: 'htf-hl',
        items: [
          ['6:00 PM', 'Sign-in & mixer'],
          ['7:00 PM', 'Intro & team formation'],
          ['8:00 PM', 'Hacking begins!'],
        ],
      },
      {
        name: 'Saturday_',
        swatch: 'htf-hl htf-hl--pink',
        items: [
          ['10:00 AM', 'Keynote — Tasha Upchurch: Vibe Coding Your Project'],
          ['12:00 PM', 'Lunch & mentor sessions'],
          ['2:00 PM', 'Keynote — Brad Rowland: Why the Future is HERE'],
          ['6:00 PM', 'Dinner with Trinidad State College'],
        ],
      },
      {
        name: 'Sunday_',
        swatch: 'htf-hl htf-hl--yellow',
        items: [
          ['11:00 AM', 'Submissions due'],
          ['1:00 PM', 'Demos & judging'],
          ['2:30 PM', 'Awards ceremony'],
        ],
      },
    ],
    note: 'Borrowed laptops at the front desk. A snack station in the hallway. Mentors on call all weekend. Nobody got turned away for not being "technical enough."',
  },

  /* 05 - the sponsor wall */
  community: {
    headLine1: 'Proof that we come together',
    headLine2: 'as a community',
    headLine3: 'when we need it most.',
    lede: 'Sixteen partners — from Fortune-500 security firms to the coffee shop on Main Street — contributed cash, swag, food, venue space, and logistics.',
    sponsors: [
      'CrowdStrike',
      'CDW-G',
      'Mt. San Rafael Hospital',
      'Emergent Campus',
      'Trinidad State College',
      'Cyderes',
      'CSI',
      'Multicard',
      "Gobin's Inc.",
      'Way Out West Coffee Co.',
      'Disruptive Innovations',
      'Creo En Ti Foundation',
      'InBank',
      'ELLKAY',
      'Biometrica',
      'Apotome Labs',
    ],
  },

  /* 06 - what they built */
  winners: {
    headLine1: 'What they',
    headLine2: 'built_',
    winners: [
      {
        place: '1st',
        prize: '$700',
        name: 'Stories of Trinidad',
        desc: 'QR-coded historical audio tour of downtown — scan a plaque, hear the town speak.',
        swatch: 'htf-hl',
      },
      {
        place: '2nd',
        prize: '$300',
        name: 'Local Resources App',
        desc: 'One place to find every service, program, and helping hand in Las Animas County.',
        swatch: 'htf-hl htf-hl--pink',
      },
      {
        place: '3rd',
        prize: '$200',
        name: 'Adopt a Pocket',
        desc: 'Neighbors adopting neglected pockets of public space, one block at a time.',
        swatch: 'htf-hl htf-hl--yellow',
      },
      {
        place: '3rd',
        prize: '$200',
        name: 'The Tool Library',
        desc: 'A lending library for tools — buy nothing, build everything.',
        swatch: 'htf-hl htf-hl--yellow',
      },
    ],
    footLead:
      'Every single project pointed at a real local problem. Judged on innovation, execution, design, presentation — and above all,',
    footHl: 'civic impact',
  },

  /* 07 - finding the spark */
  spark: {
    eyebrow: 'Finding the spark_',
    headLine1: 'Where did the',
    headLine2: 'ideas come from?',
    bodyLead:
      "Before anyone wrote a line of code, we put an ideation framework on the table: Joze's",
    bodyStrong: 'Rural Pattern Language',
    bodyTrail:
      '— the wicked problems rural communities face, each mapped to practical, proven patterns.',
    problems: [
      'Youth flight & talent drain',
      'Low civic trust',
      'Isolation & disconnection',
      'Economic stagnation',
      'Underused local assets',
      'Civic apathy',
    ],
    pivotLine1: 'The hackathon ended',
    pivotLine2: 'Sunday at 2:30 PM.',
    pivotBoxed1: 'The framework was',
    pivotBoxed2: 'just getting started_',
  },

  /* 08 - the act I -> act II curtain */
  bridge: {
    wordmark: 'pattern language',
    tagline: 'A living framework for towns that refuse to fade.',
  },

  /* 09 - a language for community change */
  language: {
    num: '01',
    heading: 'A language for community change',
    bodyLead:
      'In 1977, architect Christopher Alexander showed that good places are built from recurring, nameable patterns. The',
    bodyEmphasis: 'Rural Pattern Language',
    bodyTrail:
      'applies that idea to the hardest problems small towns face — 50 proven patterns, each one a solution that has worked somewhere real.',
    pairs: [
      {
        problem: 'Youth flight & talent drain',
        pattern: 'Youth Return Pathway',
        swatch: 'var(--color-accent-1)',
      },
      {
        problem: 'Low civic trust',
        pattern: 'Community Anchor Point',
        swatch: 'var(--color-accent-2)',
      },
      {
        problem: 'Isolation & disconnection',
        pattern: 'Shared Cultural Story',
        swatch: 'var(--color-accent-3)',
      },
      {
        problem: 'Economic stagnation',
        pattern: 'Main Street Reawakening',
        swatch: 'var(--color-accent-warm)',
      },
    ],
  },

  /* 10 - the platform */
  platform: {
    num: '02',
    heading: 'ruralpatternlanguage.com',
    lede: 'We took the framework off the whiteboard and made it a platform — the same one that sparked the hackathon ideas, now open to any community.',
    pillars: [
      {
        title: 'Patterns',
        swatch: 'var(--color-accent-1)',
        desc: '50 proven approaches to rural regeneration — each with the problem it solves, the solution, and concrete implementation steps.',
      },
      {
        title: 'Stories',
        swatch: 'var(--color-accent-2)',
        desc: 'Real towns, real outcomes. What communities tried, what worked, and what changed — so nobody starts from zero.',
      },
      {
        title: 'Cities',
        swatch: 'var(--color-accent-3)',
        desc: 'A living map of the towns using the language — their challenges, their active patterns, and their progress.',
      },
    ],
  },

  /* 11 - meet PAL */
  pal: {
    num: '03',
    heading: 'Meet PAL',
    bodyLead:
      'The Pattern Language Assistant. Describe what your town is struggling with, in your own words — PAL finds the patterns that fit and turns them into a',
    bodyStrong: 'playbook',
    bodyTrail:
      ': tasks, KPIs, and a 90-day definition of success your whole community can work from.',
    userBubble: 'Our young people leave for the city and never come back.',
    palLead:
      "That's one of the wicked problems the language names directly — let's look at",
    palStrong: 'Pattern 9: Youth Return Pathway',
    palTrail: '. I can build you a playbook for it.',
    playbookLabel: 'Generated playbook',
    playbookTitle: 'Youth Return Pathway — Trinidad, CO',
    playbookMeta: ['12 tasks across 3 phases', '4 measurable KPIs', '90-day success plan'],
  },

  /* 12 - anatomy of a pattern */
  anatomy: {
    num: '04',
    heading: 'A pattern is not a blueprint.',
    term1: 'Recurring problem',
    term2: 'Context',
    term3: 'Adaptable response',
    termFixed: 'a fixed program',
    travelLead: 'The pattern can travel.',
    travelEmphasis: 'The solution has to be local.',
    kicker: 'So what does that look like when a community actually tries it?',
  },

  /* 13 - the worked example town */
  cottonwood: {
    num: '05',
    tag: 'a fictional town, built for this workshop',
    heading: 'Meet Cottonwood Springs, Colorado',
    stats: [
      { value: '11,200', label: 'city population' },
      { value: '51', label: 'median age' },
      { value: '$53K', label: 'median household income' },
      { value: '24%', label: 'downtown vacancy' },
      { value: '68%', label: 'of seniors expect to leave' },
      { value: '70%', label: "of employers can't hire" },
    ],
    quote: '"We have ideas. We just don\'t seem to get them across the finish line."',
    kickerLead: "Question to the room: what is Cottonwood Springs'",
    kickerEmphasis: 'real',
    kickerTrail: 'problem?',
  },

  /* 14 - six patterns on the table */
  sixPatterns: {
    num: '06',
    heading: 'Where would you start?',
    lede: 'Six patterns go on the table.',
    patterns: [
      {
        name: 'Community Anchor Point',
        desc: 'A visible place where relationships and activity can gather.',
        swatch: 'var(--color-accent-1)',
      },
      {
        name: 'Youth Stay Pathways',
        desc: 'Make local futures visible before young people decide they must leave.',
        swatch: 'var(--color-accent-2)',
      },
      {
        name: 'Main Street Reawakening',
        desc: 'Bring activity and experimentation back into downtown.',
        swatch: 'var(--color-accent-3)',
      },
      {
        name: 'Regenerative Micro-Enterprise',
        desc: 'Help small local ventures start, test, and grow.',
        swatch: 'var(--color-accent-warm)',
      },
      {
        name: 'Local Capacity Backbone',
        desc: 'Give coordination, ownership, and implementation a home.',
        swatch: 'var(--color-accent-2)',
      },
      {
        name: 'Trust Infrastructure',
        desc: 'Create routines and structures that build trust through action.',
        swatch: 'var(--color-accent-1)',
      },
    ],
    kickerLead: 'If you could choose only',
    kickerEmphasis: 'three',
    kickerTrail: '— which would you start with?',
  },

  /* 15 - the three-pattern stack */
  junction: {
    eyebrow: `07 ${NB}·${NB} Cottonwood chooses a three-pattern stack`,
    heading: 'The Junction',
    stack: [
      { name: 'Community Anchor Point', swatch: 'var(--color-accent-1)' },
      { name: 'Youth Stay Pathways', swatch: 'var(--color-accent-2)' },
      { name: 'Regenerative Micro-Enterprise', swatch: 'var(--color-accent-3)' },
    ],
    stackNote: '→ one merged playbook, not three parallel plans',
    body: 'A 90-day experiment in 3,000 sq ft of the empty department store, connecting youth, employers, entrepreneurs, and learning. Not a permanent center.',
    bodyEmphasis: 'Not yet.',
    functions: [
      {
        title: 'Youth + Employer Project Lab',
        desc: 'Student teams work real problems brought by local employers — after school, twice a week.',
      },
      {
        title: 'Entrepreneur Test Market',
        desc: 'Six early-stage ventures rotate through a Thu–Sun market: test products, pricing, and demand before any lease.',
      },
      {
        title: 'Skills + Learning Corner',
        desc: 'The college runs short practical sessions while the building is already busy.',
      },
      {
        title: 'Community Connection Space',
        desc: 'Mixers, showcases, dinners, idea nights — once or twice a month.',
      },
    ],
    fundingLabel: '$18K cash stack',
    funding: [
      { label: 'Foundation', amount: 5, swatch: 'var(--color-accent-1)' },
      { label: 'City', amount: 4, swatch: 'var(--color-accent-2)' },
      { label: 'Employers', amount: 3, swatch: 'var(--color-accent-3)' },
      { label: 'College', amount: 3, swatch: 'var(--color-accent-warm)' },
      { label: 'Bank', amount: 2, swatch: 'var(--color-text-tertiary)' },
      { label: 'Donations', amount: 1, swatch: 'var(--color-text-secondary)' },
    ],
    fundingSuffix: '+ donated space & time',
  },

  /* 16 - then reality shows up */
  learning: {
    num: '08',
    heading: 'Then reality shows up.',
    wellTitle: 'What worked',
    wrongTitle: "What didn't",
    wentWell: [
      'Students keep showing up for the after-school employer projects.',
      'Thursday after-work and Saturday generate the strongest traffic.',
      'Two ventures sell across multiple days; a third clearly works as an event business.',
      'A Thursday micro-class fills because people are already in the building.',
    ],
    wentWrong: [
      'Sunday traffic is weak for most of the entrepreneurs.',
      'Saturday-only sales make concepts look stronger than they are.',
      'Tuesday-evening public workshops draw almost nobody.',
      "Childcare can't simply be added — licensing and staffing are harder than expected.",
      'The coordinator and volunteers become overloaded.',
    ],
    pivotLead: 'The visible problem was space.',
    pivotEmphasis: 'The hidden problem was capacity.',
    nextLead: 'Next pattern:',
    nextChip: 'Local Capacity Backbone',
    nextTrail:
      '— a small coordinating team that owns partners, schedules, funding, and follow-through.',
    loop: ['See', 'Combine', 'Test', 'Learn', 'Adapt'],
  },

  /* 17 - phones out */
  demo: {
    eyebrow: `09 ${NB}·${NB} interactive — phones out`,
    headLead: 'Now',
    headEmphasis: 'you',
    headTrail: 'are the',
    headLine2: 'Cottonwood Springs team.',
    steps: [
      {
        title: 'Open the town',
        desc: 'Scan the code, or type the address below.',
      },
      {
        title: 'Become a citizen',
        desc: "You're in instantly — no account, no password. You arrive as someone like Willow Finch.",
      },
      {
        title: 'Choose your patterns',
        desc: 'Ask PAL for a three-pattern stack and let it merge them into one playbook.',
      },
      {
        title: 'Team up',
        desc: 'Trade citizen names with a neighbor and invite them onto your playbook.',
      },
    ],
    web: 'ruralpatternlanguage.com',
    webPath: '/demo',
    kicker: 'Would you solve it the same way they did?',
  },

  /* 18 - the real working session */
  sept19: {
    month: 'Sep',
    day: '19',
    year: '2026',
    eyebrow: `10 ${NB}·${NB} Cañon City, Colorado`,
    heading: 'We stop pretending.',
    bodyLead: 'Cottonwood Springs was practice. On September 19 we put',
    bodyEmphasis: "Cañon City's",
    bodyTrail:
      'real challenges, real assets, and real people on the table — a working session to find its pattern stack and sketch the first 90-day experiment.',
    web: 'ruralpatternlanguage.com',
    webPath: '/events',
    note: 'Sign up today — bring your neighbors.',
  },

  /* 19 - the offer */
  offer: {
    heading: 'Be an early voice.',
    bodyLead: 'Sign up this fall and the whole platform is',
    bodyEmphasis: 'free for the coming months',
    bodyTrail:
      "— PAL, playbooks, teams, your town's page, all of it. Help us shape the language while it's still being written.",
    web: 'ruralpatternlanguage.com',
    webPath: '/signup',
    small: 'No card. Just a community.',
  },

  /* 20 - closing */
  closing: {
    headLine1: 'Help your town',
    headLine2: 'find its pattern.',
    body: 'A hackathon lasts 48 hours. A pattern language lasts as long as the community that speaks it. Thank you, SoCo Startup Week.',
    contact: `Kisora Thomas & Joze Petrich ${NB}·${NB} ruralpatternlanguage.com ${NB}·${NB} September 19 — Cañon City`,
  },
}
