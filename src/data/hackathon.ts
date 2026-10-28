/**
 * Community Solution Sprint — Saturday, November 7, 2026. Lives at /hackathon.
 *
 * All copy for /hackathon lives here so the page itself stays a layout.
 * Registration posts to the service's public event sign-up keyed by `slug`
 * (the same endpoint /events uses), so the hackathon also appears in
 * src/data/events.ts under that slug.
 */
export const HACKATHON_SLUG = 'pattern-language-hackathon-2026'

export const hackathon = {
  slug: HACKATHON_SLUG,
  name: 'Community Solution Sprint',
  /** The compact wordmark used in the page chrome. */
  mark: 'PL/SPRINT',
  date: '2026-11-07',
  dateLabel: 'November 7, 2026',
  dayLabel: 'Saturday',
  timeLabel: '9:00 AM – 5:00 PM MT',
  venue: 'Old Post Office Event Center',
  address: '505 Macon Ave, Cañon City, CO 81212',
  /** The host, credited with its own wordmark (from emergentcampus.org). */
  host: {
    name: 'Emergent Campus',
    url: 'https://emergentcampus.org/',
    logo: '/brand/emergent-campus-green.png',
    logoOnDark: '/brand/emergent-campus-white.png'
  },
  /**
   * The sponsor, credited with its own logo (supplied by Kisora, Oct 2026).
   * The white version is the same artwork reversed out for dark grounds.
   */
  sponsor: {
    name: 'Boettcher Foundation',
    url: 'https://boettcherfoundation.org/',
    logo: '/brand/boettcher-foundation.png' as string,
    logoOnDark: '/brand/boettcher-foundation-white.png' as string
  },
  location: 'Old Post Office Event Center · 505 Macon Ave, Cañon City, CO 81212',
  /** How the day is held: in the room, on paper first. */
  format: 'In person. Limited seats available, register now.',
  tagline: 'One day. One town. Fifty patterns.',
  lede:
    'Name what must stay true. Stack the patterns that protect it. Leave at five with a 90-day plan that has your name on a line.',
  /** The landing's one-line tease of the game. */
  tease:
    'Start with the game. Fifteen wicked problems hang in a web; touch one, see its shape, connect the patterns that answer it, and PAL writes your first pitch. Three minutes.',
  manifesto: [
    'Every rural town is solving the same twenty problems alone.',
    'A pattern language is the shared vocabulary that lets them stop.',
    'For one day, we build with it, together.'
  ],
  details: [
    { label: 'When', value: 'Sat, Nov 7 · 9 AM – 5 PM MT' },
    { label: 'Where', value: 'Old Post Office Event Center · 505 Macon Ave, Cañon City, CO 81212' },
    { label: 'Who', value: 'Neighbors, organizers, builders, students. Limited seats available, register now.' },
    { label: 'Cost', value: 'Free. Coffee, snacks and lunch.' },
    { label: 'Teams', value: 'Come solo. Teams of five or six form around ideas by lunch.' },
    { label: 'Tools', value: 'Pattern cards, sticky notes, whiteboards. One laptop per team, for PAL and the deck.' },
    { label: 'Award', value: 'The winning project will receive financial support up to $250 to continue their project.' }
  ],
  /** The path every team walks: values, patterns, a 90-day playbook. */
  method: [
    { name: 'Values', blurb: 'What must remain true as we build. Named together, before anything else.' },
    { name: 'Patterns', blurb: 'Three to five moves that reinforce one another. A stack, not a list.' },
    { name: 'Playbook', blurb: 'The first 90 days, with one person’s name on every line.' },
    { name: 'Six slides', blurb: 'Six questions, five minutes. The same deck for every team.' },
    { name: 'Monday Morning', blurb: 'One person, one action, before next Friday. Required to win.' }
  ],
  /** On the table on the day, and here to read beforehand. */
  /**
   * The documents are being redesigned in the brand. Until they are ready
   * the page lists them as coming soon, with no download links, and the
   * emails leave them out. Set to true (here and `resourcesReady` in the
   * service's event-catalog.ts) once the new files are in public/hackathon/.
   */
  resourcesReady: false,
  resources: [
    { name: 'Presentation template', what: 'Six slides, six questions · PowerPoint', href: '/hackathon/presentation-template.pptx' },
    { name: 'Playbook worksheet', what: 'The first 90 days, a name on every line · Word', href: '/hackathon/playbook-worksheet.docx' },
    { name: 'Judging scorecard', what: 'Five criteria, scored 1 to 5 · Excel', href: '/hackathon/judging-scorecard.xlsx' }
  ],
  schedule: [
    { time: '9:00', what: 'Coffee, snacks and welcome' },
    { time: '9:30', what: 'Game of Values' },
    { time: '10:15', what: 'From values to patterns' },
    { time: '10:30', what: 'Break' },
    { time: '10:45', what: 'Ideas on the table' },
    { time: '11:15', what: 'Map patterns to ideas' },
    { time: '11:40', what: 'Idea pitches and team sign-up' },
    { time: '12:00', what: 'Lunch · teams set by 12:50' },
    { time: '1:00', what: 'Define the opportunity' },
    { time: '1:30', what: 'Build the pattern stack' },
    { time: '2:15', what: 'Build the playbook' },
    { time: '3:00', what: 'Break' },
    { time: '3:15', what: 'Build the six-slide deck' },
    { time: '4:15', what: 'Final presentations, five minutes each' },
    { time: '4:45', what: 'Monday Morning round · judges deliberate' },
    { time: '4:55', what: 'The award and next steps' }
  ],
  /** The judge scorecard: five criteria, 20% each, scored 1 to 5. */
  judging: [
    { name: 'Community need', blurb: 'A real, felt need, and evidence you heard it from the community.' },
    { name: 'Values', blurb: 'Reinforces the values on the wall, and names the ones it protects.' },
    { name: 'Pattern stack', blurb: 'Three to five patterns that genuinely reinforce one another.' },
    { name: '90-day plan', blurb: 'Realistic milestones, a name on every line, a visible win inside 30 days.' },
    { name: 'Momentum', blurb: 'If it works, it grows, and builds capacity beyond the team.' }
  ],
  judgingNote:
    'Each criterion is 20%. Monday Morning is a hard requirement: a team that cannot name one person and one action before next Friday is not eligible for the award.',
  prizes: [
    { place: 'Up to $250', what: 'The winning project will receive financial support up to $250 to continue their project. Announced before five.' },
    { place: 'Every team', what: 'A follow-up convening and a 30-day check-in, win or not.' }
  ],
  faq: [
    {
      q: 'Do I need to be technical?',
      a: 'No. The thinking happens on pattern cards, sticky notes and whiteboards. Each team gets one laptop, for PAL and the final deck.'
    },
    {
      q: 'Do I need a team or an idea?',
      a: 'No. Nothing is pre-chosen. Ideas go on the wall at 10:45, and teams of five or six form around them by lunch.'
    },
    {
      q: 'What is a pattern?',
      a: 'A repeatable move that solves a recurring problem in a particular context. Not a template. The library has 50, free at ruralpatternlanguage.com/patterns, and teams stack three to five.'
    },
    {
      q: 'What is PAL?',
      a: 'Our pattern-language AI. From 11:15 each team can use it as a research assistant, not a decision-maker. You still argue for every pattern.'
    },
    {
      q: 'What do we leave with?',
      a: 'A 90-day playbook with a name on every line, a six-slide deck, and one Monday Morning commitment. Five plans leave the room; the winning one leaves with up to $250 to keep going.'
    },
    {
      q: 'How do I get a seat?',
      a: 'Register on this page and tell us why you are interested. Seats are limited, so we read every registration; if there is a seat for you, your official invite arrives by email.'
    },
    {
      q: 'Can we start early?',
      a: 'Play the game. The presentation template and playbook worksheet arrive before the day; that is the only other head start.'
    }
  ],
  contact: 'hello@ruralpatternlanguage.com'
}
