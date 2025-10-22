import { ref } from 'vue'
import { typingPhrases } from '@/utils/data'

export function useTypingAnimation() {
  const currentTypedText = ref('')
  const isTyping = ref(true)
  let currentPhraseIndex = 0
  let currentCharIndex = 0

  const typePhrase = () => {
    const currentPhrase = typingPhrases[currentPhraseIndex]
    if (!currentPhrase) return

    if (currentCharIndex <= currentPhrase.length) {
      currentTypedText.value = currentPhrase.substring(0, currentCharIndex)
      currentCharIndex++
      isTyping.value = true

      if (currentCharIndex <= currentPhrase.length) {
        setTimeout(typePhrase, 60)
      } else {
        // Finished typing, pause then reset
        isTyping.value = false
        setTimeout(() => {
          currentCharIndex = 0
          currentPhraseIndex = (currentPhraseIndex + 1) % typingPhrases.length
          typePhrase()
        }, 2500)
      }
    }
  }

  const startTypingAnimation = () => {
    typePhrase()
  }

  return {
    currentTypedText,
    isTyping,
    startTypingAnimation
  }
}
