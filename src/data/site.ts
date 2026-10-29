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
   * The shop's opening band: the book, now on sale. Single-run strings, so
   * the editor kit can bind each one as a whole element. The presale (and its
   * $5 to Emergent Campus) ended in autumn 2026; these keys replaced the
   * `presale*` ones so no published edit of the old copy can come back.
   */
  shop: {
    bookEyebrow: 'About the book',
    bookHeadline: 'The book is in print, and shipping now.',
    bookBody:
      'Fifty patterns for rural places, each drawn from a town where it worked, with the method for putting them together. Your purchase funds the ongoing development of rural community tools, workshops, internships, and resources.',
    bookThanks: 'Thank you for your support.',
    bookShipsLabel: 'Ships',
    bookShipsValue: 'Now, from our store',
    bookCheckoutLabel: 'Checkout',
    bookCheckoutValue: 'Secure, on our store',
  },

  /**
   * The SoCo Startup Week deck. Every slide's copy, one key per slide, kept
   * in its own module because it is longer than the rest of this file put
   * together — see data/presentation.ts for how the shapes are chosen.
   */
  presentation,
})
