import { ref } from 'vue'

// Responses start typing at a natural pace, then glide up to a fast — but
// still readable — cruise. Words stream one at a time; the trailing words
// wear a graded blur that resolves word by word at exactly the typing pace.
const NORMAL_DELAY_MS = 30   // per word during the natural intro
const NORMAL_WORDS = 18      // how many words type at natural pace
const DECAY = 0.88           // gentle per-word delay decay while accelerating
const CRUISE_DELAY_MS = 14   // steady top speed (~70 words/sec)
const LONG_RESPONSE_WORDS = 350 // beyond this, cruise doubles up to stay snappy
// How many trailing words carry the blur gradient. A long band is the point:
// at cruise the leading edge outruns a short trail, and the reveal is over
// before the eye finds it. Every word now stays soft for ~26 words after it
// lands, so the blur reads as a wave following the text down the page.
export const REVEAL_TRAIL = 26
const DRAIN_STEP_MS = 40     // per-word focus settle after the last word lands

/**
 * The word-by-word reveal animation PAL replies type in with, shared by the
 * dashboard chat and the guest demo. `typeOut` runs the full choreography;
 * the caller commits the finished message to its store and then `reset`s.
 */
export function useTypingReveal(maybeScrollToBottom: () => void) {
  const isTyping = ref(false)
  const typedContent = ref('')
  // Trailing words carrying the blur gradient; drains to 0 as the message settles
  const revealTrail = ref(REVEAL_TRAIL)

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const typeOut = async (contentToType: string) => {
    isTyping.value = true
    typedContent.value = ''
    revealTrail.value = REVEAL_TRAIL

    // Phase 1 — natural typing. Phase 2 — per-word delay decays rapidly.
    // Phase 3 — the rest floods in as growing chunks under a slight blur.
    const words = contentToType.split(/(?<=\s)/)
    let delay = NORMAL_DELAY_MS
    let i = 0

    for (; i < words.length && i < NORMAL_WORDS; i++) {
      typedContent.value += words[i]
      if (i % 3 === 0) maybeScrollToBottom()
      await sleep(delay)
    }

    // Glide from the natural pace down to cruise speed
    for (; i < words.length && delay > CRUISE_DELAY_MS; i++) {
      typedContent.value += words[i]
      if (i % 3 === 0) maybeScrollToBottom()
      delay = Math.max(delay * DECAY, CRUISE_DELAY_MS)
      await sleep(delay)
    }

    // Cruise: a steady stream of single words so the reveal stays smooth.
    // Very long responses step up to two words per tick, never more.
    const wordsPerTick = words.length - i > LONG_RESPONSE_WORDS ? 2 : 1
    while (i < words.length) {
      typedContent.value += words.slice(i, i + wordsPerTick).join('')
      i += wordsPerTick
      if (i % 4 === 0) maybeScrollToBottom()
      await sleep(CRUISE_DELAY_MS)
    }

    // Drain: the last words settle into focus one by one
    for (let trail = REVEAL_TRAIL - 1; trail >= 0; trail--) {
      revealTrail.value = trail
      await sleep(DRAIN_STEP_MS)
    }
    maybeScrollToBottom()
  }

  const reset = () => {
    isTyping.value = false
    typedContent.value = ''
    revealTrail.value = REVEAL_TRAIL
  }

  return { isTyping, typedContent, revealTrail, typeOut, reset }
}
