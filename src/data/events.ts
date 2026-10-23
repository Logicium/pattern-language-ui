/**
 * Upcoming events — static base data rendered by /events. RSVP submissions go
 * to the service (POST /events/signup) keyed by `slug`; edit or add entries
 * here as new gatherings are announced.
 */
export interface CommunityEvent {
  slug: string
  title: string
  /** ISO date (start). */
  date: string
  /** Optional ISO end date for multi-day events. */
  endDate?: string
  timeLabel?: string
  location: string
  description: string
  /** External link (event site), if any. */
  url?: string
  /** Show the RSVP form for this event. */
  signupOpen?: boolean
  featured?: boolean
}

export const events: CommunityEvent[] = [
  {
    slug: 'canon-city-workshop-2026',
    title: 'The Cañon City Workshop',
    date: '2026-09-19',
    timeLabel: 'Time & venue announced to attendees',
    location: 'Cañon City, Colorado',
    description:
      'We stop pretending. After exploring the fictional Cottonwood Springs, we put Cañon ' +
      "City's real challenges, assets, and people on the table — a hands-on working session " +
      'to find the patterns that fit, sketch a first 90-day experiment, and decide who owns ' +
      'it. Bring your neighbors.',
    signupOpen: true,
    featured: true,
  },
  {
    slug: 'soco-startup-week-2026',
    title: 'From a 48-Hour Hackathon to a Pattern Language',
    date: '2026-08-25',
    timeLabel: 'SoCo Startup Week',
    location: 'Colorado Springs, Colorado',
    description:
      'Kisora Thomas & Joze Petrich on what a town of 8,000 built in one weekend — and the ' +
      'living framework it left behind. Includes a live, hands-on demo of PAL and the ' +
      'Cottonwood Springs sandbox.',
    url: 'https://socostartupweek.com/',
  },
  {
    slug: 'cottonwood-walkthrough-2026',
    title: 'Cottonwood Springs, Live — an online PAL walkthrough',
    date: '2026-10-08',
    timeLabel: 'Details to come',
    location: 'Online',
    description:
      'A guided hour inside the platform: pick patterns for the fictional Cottonwood ' +
      'Springs, generate a merged playbook with PAL, and see how teams work one together.',
  },
  {
    slug: 'pattern-language-hackathon-2026',
    title: 'Community Solution Sprint',
    date: '2026-11-07',
    timeLabel: '9 AM – 5 PM MT',
    location: 'Old Post Office Event Center · 505 Macon Ave, Cañon City, CO 81212',
    description:
      'One day, one town, forty-five patterns. Name what must stay true, stack the patterns that protect it, ' +
      'and leave at five with a 90-day playbook. Real seed money for the strongest plan. Free. Play the game first at /hackathon.',
    url: '/hackathon',
    featured: true,
  },
  {
    slug: 'hack-trinidad-forward-2026',
    title: 'Hack Trinidad Forward 2026 — save the date',
    date: '2026-11-13',
    endDate: '2026-11-15',
    timeLabel: 'Save the date',
    location: 'Emergent Campus · Trinidad, Colorado',
    description:
      "Trinidad's civic-innovation hackathon returns for year two. 48 hours, real local " +
      'problems, and prizes for the projects that move the town forward.',
    url: 'https://www.hacktrinidadforward.io/',
  },
]
