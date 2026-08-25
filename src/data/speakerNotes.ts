/**
 * Speaker notes for the SoCo Startup Week talk, presented one card at a time
 * at /presentation/notes — a stage tool, read from a phone in a dim room or
 * printed. Lines allow light inline markup (<em> for the words to lean on)
 * and [bracketed] stage directions; the content is authored here, so it is
 * trusted.
 *
 * Slide numbers match the deck: /presentation?slide=N.
 */
export type Speaker = 'kisora' | 'joze' | 'both'

export interface NoteCue {
  /** advance = when to click · hand = hand-off · hold = stay put */
  kind: 'advance' | 'hand' | 'hold'
  text: string
}

export interface SlideNote {
  num: number
  name: string
  timing: string
  speaker: Speaker
  /** Stage direction — how to play it, not what to say. */
  beat: string
  lines: string[]
  cues: NoteCue[]
}

export interface NotesAct {
  id: string
  label: string
  title: string
  slides: SlideNote[]
}

export const notesMeta = {
  event: 'SoCo Startup Week',
  date: 'Tuesday, August 25',
  presenters: 'Kisora Thomas & Joze Petrich',
  runtime: 'about 20 minutes, including 4 in the demo',
}

export const speakerNames: Record<Speaker, string> = {
  kisora: 'Kisora',
  joze: 'Joze',
  both: 'Both',
}

export const acts: NotesAct[] = [
  {
    id: 'htf',
    label: 'Act I',
    title: 'Hack Trinidad Forward',
    slides: [
      {
        num: 1,
        name: 'Title',
        timing: '40 sec',
        speaker: 'kisora',
        beat: "Don't speak until the room settles. The black slide can hold longer than feels comfortable.",
        lines: [
          "“Two years ago, if you searched <em>Trinidad Colorado hackathon</em>, you got nothing. Not a bad result — <em>no</em> result. [beat] Last November, that changed.”",
          "“I'm Kisora Thomas. This is Joze Petrich. For the next twenty minutes we want to show you what a town of eight thousand people built in a single weekend — and the language it left behind.”",
        ],
        cues: [{ kind: 'advance', text: 'on “left behind”' }],
      },
      {
        num: 2,
        name: 'Your hosts',
        timing: '45 sec',
        speaker: 'both',
        beat: 'Ten seconds each. Nobody came for our résumés.',
        lines: [
          "“I run Apotome Labs — a software studio inside Emergent Campus, on Park Street in Trinidad.”",
          "“Emergent Campus is Joze's. Same building, two very different jobs. He also wrote the thing that turned out to be the spine of this entire talk: the <em>Rural Pattern Language.</em>”",
          "“One stubborn conviction between us: <em>small towns are not small ideas.</em>”",
        ],
        cues: [
          { kind: 'hand', text: 'Joze introduces himself in his own words' },
          { kind: 'advance', text: 'when he lands' },
        ],
      },
      {
        num: 3,
        name: 'The hackathon',
        timing: '45 sec',
        speaker: 'kisora',
        beat: 'Say “first” like it means something. It does.',
        lines: [
          "“Hack Trinidad Forward was the first hackathon our town has ever had. Not the first this year — the <em>first.</em>”",
          "“And it was never really a tech event. The prompt wasn't ‘build an app.’ The prompt was: <em>make Trinidad better.</em> Forty-eight hours to try.”",
          "“The numbers are behind me. I'll let them stand there and do the bragging.”",
        ],
        cues: [{ kind: 'advance', text: 'without reading the stats aloud' }],
      },
      {
        num: 4,
        name: 'The weekend',
        timing: '40 sec',
        speaker: 'kisora',
        beat: 'Move briskly through the schedule. Land hard on the laptops.',
        lines: [
          "“Friday night, strangers turned into teams. Saturday: keynotes, mentors, more pizza than any of us want to discuss. Sunday — demos at one, awards at two-thirty.”",
          "“But the detail I'm proudest of isn't in bold up there. It's the <em>loaner laptops at the front desk.</em> Nobody was turned away for lacking the right hardware — or the right vocabulary.”",
          "“We had retirees building next to high-schoolers. That wasn't a happy accident. That was the design goal.”",
        ],
        cues: [{ kind: 'advance', text: 'on “design goal”' }],
      },
      {
        num: 5,
        name: 'Community',
        timing: '35 sec',
        speaker: 'kisora',
        beat: 'Gesture at the wall of names. Never read a sponsor list aloud.',
        lines: [
          "“Sixteen partners made it real. A Fortune-500 security company. A hospital. A college. The coffee shop down the block.”",
          "“Not one of them asked me for a business case. They asked, <em>‘What do you need?’</em> [beat] That isn't sponsorship. That's a town deciding to show up for itself.”",
        ],
        cues: [{ kind: 'advance', text: 'after the beat' }],
      },
      {
        num: 6,
        name: 'What they built',
        timing: '50 sec',
        speaker: 'kisora',
        beat: 'Slow down. This is evidence, not anecdote.',
        lines: [
          "“First place: <em>Stories of Trinidad.</em> QR codes on historic buildings — scan one and the town tells you its own story, in the voices of people who live there.”",
          "“Then a county resources app. Neighbors adopting neglected pockets of public land. A tool library.”",
          "“Notice what nobody built: another food-delivery app. Every project was <em>Trinidad-shaped.</em> These could only have come from people who live inside the problem.”",
        ],
        cues: [{ kind: 'advance', text: 'on “inside the problem”' }],
      },
      {
        num: 7,
        name: 'The spark',
        timing: '55 sec',
        speaker: 'kisora',
        beat: 'The hinge of the whole talk. Slow it down and let the last line hang.',
        lines: [
          "“Here's the question I couldn't stop asking afterward: where did those ideas actually come from? Sixty people don't spontaneously invent civic projects at eight o'clock on a Friday night.”",
          "“They came from a map. Joze walked in that weekend with a framework: name the wicked problem out loud, then find the pattern that has already answered it somewhere real.”",
          "“The hackathon ended Sunday at two-thirty. [beat — let it sit] The framework was just getting started.”",
        ],
        cues: [
          { kind: 'advance', text: 'ON “getting started” — the screen dissolves' },
          { kind: 'hand', text: 'Joze takes the room' },
        ],
      },
      {
        num: 8,
        name: 'The bridge',
        timing: '20 sec',
        speaker: 'joze',
        beat: 'Say nothing. Let the pixels dissolve and the ribbons settle. Count to three.',
        lines: ['Then, quietly:', "“So we gave it somewhere to live.”"],
        cues: [{ kind: 'advance', text: 'after the line' }],
      },
    ],
  },
  {
    id: 'pl',
    label: 'Act II',
    title: 'The Rural Pattern Language',
    slides: [
      {
        num: 9,
        name: 'A language',
        timing: '55 sec',
        speaker: 'joze',
        beat: 'The intellectual anchor. Warm and plain — resist the lecture.',
        lines: [
          "“In 1977 an architect named Christopher Alexander noticed something. The places people genuinely love aren't designed from scratch. They're assembled from patterns that repeat — a window seat, a public square, a street the right width.”",
          "“He wrote them down and gave them names. And naming a thing is what lets ordinary people argue about it.”",
          "“The Rural Pattern Language does that for the problems small towns actually have. Youth flight. Low civic trust. Empty storefronts. Each one named — and paired with a pattern that has worked somewhere before.”",
        ],
        cues: [{ kind: 'advance', text: 'after the pairs land' }],
      },
      {
        num: 10,
        name: 'The platform',
        timing: '40 sec',
        speaker: 'kisora',
        beat: 'The “we built the thing” slide. Keep it light and quick.',
        lines: [
          "“For years this language lived in workshops, on whiteboards, in a binder. Which works beautifully — right up until everyone goes home on Monday.”",
          "“So we put it on the internet. Fifty patterns. The stories of towns that used them. And a living map of the communities doing this work right now.”",
          "“All of it free to read. No login, no wall.”",
        ],
        cues: [{ kind: 'advance', text: 'on “no wall”' }],
      },
      {
        num: 11,
        name: 'Meet PAL',
        timing: '50 sec',
        speaker: 'kisora',
        beat: "A product demo in one breath. Don't oversell it — the screen is doing the work.",
        lines: [
          "“This is PAL — the Pattern Language Assistant. You tell it what your town is struggling with, in your own words. No jargon required.”",
          "“It finds the patterns that fit and turns them into a playbook: real tasks, measurable KPIs, and a definition of what success looks like in ninety days.”",
          "“Look at the exchange on screen. Somebody types a sentence any of us could have written — <em>our young people leave and never come back.</em> What comes back isn't advice. It's a plan with a due date.”",
        ],
        cues: [
          { kind: 'advance', text: 'on “due date”' },
          { kind: 'hand', text: 'back to Joze' },
        ],
      },
      {
        num: 12,
        name: 'Not a blueprint',
        timing: '45 sec',
        speaker: 'joze',
        beat: 'The most important distinction in the talk. Land it cleanly, then pause.',
        lines: [
          "“One thing before we use it. A pattern is not a blueprint.”",
          "“A blueprint tells you what to build. A pattern names three things: a recurring problem, the context it lives in, and a response you have to adapt. That third part is your job — not mine.”",
          "“The pattern can travel. The solution has to be local. [beat] So let's watch a town actually try it.”",
        ],
        cues: [{ kind: 'advance', text: 'on “actually try it”' }],
      },
      {
        num: 13,
        name: 'Cottonwood Springs',
        timing: '50 sec',
        speaker: 'joze',
        beat: 'Say “fictional” early and clearly — then treat the town as completely real.',
        lines: [
          "“Meet Cottonwood Springs, Colorado. It does not exist. We invented it for this workshop, and every number on the screen is made up — but I promise nothing here is unfamiliar.”",
          "“Eleven thousand people. Median age fifty-one. A quarter of downtown sitting empty. Sixty-eight percent of graduating seniors expect to leave.”",
          "“And the sentence you hear in every town like it: <em>‘We have ideas. We just can't seem to get them across the finish line.’</em>”",
        ],
        cues: [{ kind: 'advance', text: 'on the quote' }],
      },
      {
        num: 14,
        name: 'Where would you start?',
        timing: '45 sec',
        speaker: 'joze',
        beat: 'Ask, then actually wait. Three seconds of silence feels like a minute — take it anyway.',
        lines: [
          "“Six patterns go on the table. Anchor point. Youth pathways. Main Street. Micro-enterprise. Capacity backbone. Trust.”",
          "“If you were on Cottonwood's team and you could only start with <em>three</em> — which three would you pick?”",
          '[Take one or two answers if they come. Repeat them back so the whole room hears them.]',
        ],
        cues: [{ kind: 'advance', text: 'after 2 answers, or 10 seconds of silence' }],
      },
      {
        num: 15,
        name: 'The Junction',
        timing: '55 sec',
        speaker: 'joze',
        beat: 'The payoff of the framework. Confident, unhurried.',
        lines: [
          "“Here's what they chose. Anchor point, youth pathways, micro-enterprise — three patterns, <em>one</em> project.”",
          "“Not three programs running in parallel. One ninety-day experiment, in three thousand square feet of an empty department store. They called it The Junction.”",
          "“Students working real problems brought in by real employers. Six entrepreneurs testing products before signing a lease. The college teaching short classes while the building is already full of people.”",
          "“Eighteen thousand dollars, stitched together from six different pockets. Not a permanent center. <em>Not yet.</em>”",
        ],
        cues: [{ kind: 'advance', text: 'on “not yet”' }],
      },
      {
        num: 16,
        name: 'Then reality shows up',
        timing: '55 sec',
        speaker: 'joze',
        beat: 'Tell the failures with a straight face. They are the credibility of the whole talk.',
        lines: [
          "“Then reality shows up. Some of it worked: students kept coming back, Thursday evenings and Saturdays were strong, two ventures found real customers.”",
          "“Plenty didn't. Sunday was dead. Tuesday-evening workshops drew almost nobody. Childcare turned out to be a licensing problem, not a space problem. And the coordinator burned out.”",
          "“Here's the sentence I'd like you to leave with: the visible problem was space. <em>The hidden problem was capacity.</em>”",
          "“So the next pattern isn't a renovation. It's one person whose actual job is to own the follow-through.”",
        ],
        cues: [
          { kind: 'advance', text: 'on “follow-through”' },
          { kind: 'hand', text: 'Kisora runs the demo' },
        ],
      },
      {
        num: 17,
        name: 'Your turn — demo',
        timing: '4 min',
        speaker: 'kisora',
        beat: 'Phones out. Stop talking and let them arrive before you say the next thing.',
        lines: [
          "“Your turn. Everybody take out your phone and scan the code on the screen.”",
          "“It hands you a citizen of Cottonwood Springs — a name like Willow Finch. No signup, no password. You're in.”",
          "“Ask PAL for three patterns for the town. Argue with it. Make it merge them into a single playbook.”",
          "“And if you want to work together — trade citizen names with the person beside you and invite them onto your playbook.”",
          '[Work the room. When somebody gets a good playbook, read it out loud.]',
        ],
        cues: [
          { kind: 'hold', text: 'stay ~4 minutes' },
          { kind: 'advance', text: 'while the energy is still up, not after it dies' },
        ],
      },
      {
        num: 18,
        name: 'September 19',
        timing: '40 sec',
        speaker: 'joze',
        beat: 'The ask. Direct, no hedging, no apologizing for asking.',
        lines: [
          "“Cottonwood Springs was practice. On September 19, in Cañon City, we stop pretending.”",
          "“Real challenges, real assets, real people in the room — the same method, pointed at an actual town.”",
          "“It's on the events page. And we'd much rather you brought a neighbor than came alone.”",
        ],
        cues: [{ kind: 'advance', text: 'on “came alone”' }],
      },
      {
        num: 19,
        name: 'The offer',
        timing: '35 sec',
        speaker: 'kisora',
        beat: 'Say the free part plainly, then stop talking. Let it be simple.',
        lines: [
          "“Sign up this fall and the whole platform is free for the coming months. PAL, playbooks, teams, your town's page — all of it.”",
          "“No card. We aren't trying to sell you software. We're trying to find out whether this language works in <em>your</em> town — and you telling us it doesn't is worth more to us than a subscription.”",
        ],
        cues: [{ kind: 'advance', text: 'after “than a subscription”' }],
      },
      {
        num: 20,
        name: 'Closing',
        timing: '30 sec',
        speaker: 'both',
        beat: 'Both of you on stage. Short lines. Then stop — silence is a fine ending.',
        lines: [
          "“A hackathon lasts forty-eight hours. A pattern language lasts as long as the community still speaking it.”",
          "“We're around for the rest of the week — come find us. Help your town find its pattern.”",
          "“Thank you.”",
        ],
        cues: [{ kind: 'hold', text: 'hold this slide through Q&A' }],
      },
    ],
  },
]

export const contingency =
  "If the tech dies: every number you need is in these lines — the act works on a blank screen. If you're running long, cut slide 4's schedule sentence and slide 10 entirely; never cut the laptops, the failures on 16, or the demo."

/** Flat list in deck order — the notes are presented one card at a time. */
export const allNotes: Array<SlideNote & { actLabel: string; actTitle: string }> = acts.flatMap(
  (act) => act.slides.map((slide) => ({ ...slide, actLabel: act.label, actTitle: act.title }))
)
