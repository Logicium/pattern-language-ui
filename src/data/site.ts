import { reactive } from 'vue'
import { typingPhrases } from '@/utils/data'
import { presentation } from './presentation'

/**
 * The marketing copy, lifted into one reactive object.
 *
 * Pattern Language is an application, not a brochure: patterns, cities,
 * stories, challenges and everything on the dashboard come from the Pattern
 * Language service and belong to it. Only the words on the public front
 * door live here, which is exactly what the Apotome editor kit is for.
 *
 * The typing phrases are the array that already lives in static-content.ts,
 * carried in by reference rather than copied. The kit patches arrays IN
 * PLACE for this reason: the composable that animates them keeps its own
 * module-level import, and a published edit reaches both.
 *
 * Components render from `content` and nothing else, so an edit published
 * through the studio reaches visitors without a deploy.
 */
export const content = reactive({
  hero: {
    titleLead: 'Designing Thriving',
    titleTrail: 'Rural Communities',
    descLead: 'A collaborative tool empowering rural communities',
    descMid: 'to design, plan, and implement innovative solutions',
    descTrail: 'to complex challenges.',
    exploreLabel: 'Explore',
    /* the same array the typing animation reads, not a copy of it */
    typingPhrases,
  },

  cta: {
    titleLead: 'Ready to transform',
    titleTrail: 'your community?',
    lede: 'A growing library of proven patterns, paired with the people putting them to work in places like yours.',
    actionLabel: 'Create Profile',
    steps: [
      {
        num: '01',
        label: 'Discover',
        text: 'Browse a curated library of regenerative patterns drawn from real projects.',
      },
      {
        num: '02',
        label: 'Design',
        text: 'Match each pattern to the people, place, and constraints of your community.',
      },
      {
        num: '03',
        label: 'Collaborate',
        text: 'Connect with practitioners and document what works as you build it together.',
      },
    ],
  },

  /**
   * The shop's presale band. Split into single-run strings — the paragraph
   * that used to wrap an inline <a> could not be bound by the editor kit,
   * which matches whole elements.
   */
  shop: {
    presaleEyebrow: 'About the Presale',
    presaleHeadLead: '$5 from every presale purchase goes to',
    presaleHeadLink: 'Emergent Campus',
    presaleBody:
      'Your purchase supports rural programs and community-led revitalization work — funding the ongoing development of rural community tools, workshops, internships, and resources.',
    presaleThanks: 'Thank you for your support.',
    presaleShipsLabel: 'Ships',
    presaleShipsValue: 'End of August',
    presaleGivesLabel: 'Gives Back',
    presaleGivesValue: '$5 per order to Emergent Campus',
  },

  /**
   * The SoCo Startup Week deck. Every slide's copy, one key per slide, kept
   * in its own module because it is longer than the rest of this file put
   * together — see data/presentation.ts for how the shapes are chosen.
   */
  presentation,
})
