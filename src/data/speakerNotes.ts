/**
 * Speaker notes for the SoCo Startup Week talk, rendered at
 * /presentation/notes — a stage tool, meant to be read from a phone in a dim
 * room or printed. Lines allow light inline markup (<em> for the words to
 * lean on); the content is authored here, so it is trusted.
 *
 * Cue kinds:
 *   advance — when to click
 *   hand    — hand-off between presenters
 */
export interface NoteCue {
  kind: 'advance' | 'hand'
  text: string
}

export interface SlideNote {
  /** Deck slide number (1-based), matching /presentation?slide=N */
  num: number
  name: string
  timing: string
  beat: string
  lines: string[]
  cues: NoteCue[]
}

export interface NotesAct {
  id: string
  label: string
  title: string
  summary: string
  slides: SlideNote[]
}

export const notesMeta = {
  event: 'SoCo Startup Week',
  date: 'Tuesday, August 25',
  presenters: 'Kisora Thomas & Joze Petrich'
}

export const acts: NotesAct[] = [
  {
    id: 'htf',
    label: 'Act I',
    title: 'Hack Trinidad Forward',
    summary:
      "Slides 1–8 · roughly 5½ minutes. Don't read the slides — they carry the facts. You carry the story.",
    slides: [
      {
        num: 1,
        name: 'Title',
        timing: '~45 sec',
        beat: 'Let the room settle before you say a word.',
        lines: [
          '"Two years ago, if you\'d searched <em>\'Trinidad Colorado hackathon,\'</em> you\'d have found nothing. Zero results. [beat] Last November, that changed."',
          '"I\'m Kisora. This is Joze. And we want to show you what a town of eight thousand people can build in forty-eight hours — and the language it left behind."'
        ],
        cues: [{ kind: 'advance', text: 'advance on "left behind"' }]
      },
      {
        num: 2,
        name: 'Your hosts',
        timing: '~40 sec',
        beat: 'Fast intros — save the warmth for the story.',
        lines: [
          '"Quick introductions. I run Apotome Labs, a software studio on Main Street in Trinidad. Joze runs Emergent Campus — and long before I met him, he\'d written something called the <em>Rural Pattern Language.</em> Hold onto that name; it\'s the second half of this talk."',
          '"Between us: one hackathon, one framework, one stubborn belief — <em>small towns are not small ideas.</em>"'
        ],
        cues: [
          { kind: 'hand', text: 'Joze says hello in his own words' },
          { kind: 'advance', text: 'advance when he lands' }
        ]
      },
      {
        num: 3,
        name: 'The hackathon',
        timing: '~45 sec',
        beat: 'The premise: civic, not tech.',
        lines: [
          '"Hack Trinidad Forward was Trinidad\'s first hackathon. <em>Ever.</em> And it was never a tech event — it was a civic one. The prompt wasn\'t \'build an app.\' The prompt was: <em>make Trinidad better.</em>"',
          '"Forty-eight hours, one November weekend, downtown at Emergent Campus. Let the numbers on screen do the bragging."'
        ],
        cues: [{ kind: 'advance', text: "advance — don't read the stats aloud" }]
      },
      {
        num: 4,
        name: 'The weekend',
        timing: '~40 sec',
        beat: 'One detail matters more than the schedule.',
        lines: [
          '"Friday night, strangers became teams. Saturday, keynotes and mentors and too much pizza. Sunday — demos at one, awards at two-thirty."',
          '"But the detail I\'m proudest of is the smallest one: <em>loaner laptops at the front desk.</em> Nobody got turned away for not being \'technical enough.\' We had retirees building next to high-schoolers."'
        ],
        cues: [{ kind: 'advance', text: 'advance on "high-schoolers"' }]
      },
      {
        num: 5,
        name: 'Community',
        timing: '~35 sec',
        beat: "Gesture at the wall of names — don't list them.",
        lines: [
          '"Sixteen partners made it real. A Fortune-500 security company. A hospital. A college. The coffee shop on Main Street. Cash, food, venue, logistics."',
          '"Not one of them asked about ROI. They asked, <em>\'What do you need?\'</em> That\'s the town showing you who it is."'
        ],
        cues: [{ kind: 'advance', text: 'advance' }]
      },
      {
        num: 6,
        name: 'What they built',
        timing: '~50 sec',
        beat: 'Slow down — this is the proof.',
        lines: [
          '"First place: <em>Stories of Trinidad.</em> QR codes on historic buildings — scan one, and the town tells you its story. Then a county resources app. Neighbors adopting neglected pockets of public space. A tool-lending library."',
          '"Notice what\'s missing: nobody cloned a food-delivery app. Every single project was <em>Trinidad-shaped.</em> That\'s exactly what the judging rewarded — civic impact."'
        ],
        cues: [{ kind: 'advance', text: 'advance on "civic impact"' }]
      },
      {
        num: 7,
        name: 'The spark',
        timing: '~50 sec',
        beat: 'This is the pivot of the whole talk. Earn it.',
        lines: [
          '"Here\'s the question worth sitting with: <em>where did those ideas come from?</em> Sixty people don\'t spontaneously generate civic projects at eight p.m. on a Friday."',
          '"We gave them a map — Joze\'s Rural Pattern Language. Name the wicked problem. Match it to a pattern that\'s already worked somewhere real."',
          '"The hackathon ended Sunday at two-thirty. [beat — let it hang] The framework was just getting started."'
        ],
        cues: [{ kind: 'advance', text: 'advance ON "getting started" — the screen dissolves' }]
      },
      {
        num: 8,
        name: 'The bridge',
        timing: '~20 sec',
        beat: 'Say nothing. The slide is doing the talking.',
        lines: [
          'Let the pixels dissolve and the ribbons settle. Count to three. Then, quietly:',
          '"So we built it a home."'
        ],
        cues: [{ kind: 'hand', text: 'Joze takes the Pattern Language act from here' }]
      }
    ]
  }
]

export const contingency =
  'If tech fails: the whole act works with a blank screen — the numbers are in your lines. If time runs long, cut slide 04\'s schedule sentence, never the laptop detail.'
