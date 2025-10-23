<template>
  <div class="ai-avatar" :class="`state-${state}`">
    <svg class="avatar-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Animated gradient for flow effect - shared across all circles -->
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" class="stop-1">
            <animate attributeName="stop-color" 
                     values="#e8b4a0; #b8d4c8; #c9b8e8; #e8b4a0" 
                     dur="3s" 
                     repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" class="stop-2">
            <animate attributeName="stop-color" 
                     values="#b8d4c8; #c9b8e8; #e8b4a0; #b8d4c8" 
                     dur="3s" 
                     repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" class="stop-3">
            <animate attributeName="stop-color" 
                     values="#c9b8e8; #e8b4a0; #b8d4c8; #c9b8e8" 
                     dur="3s" 
                     repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>

      <!-- Large circle - always centered -->
      <circle 
        class="large-circle" 
        cx="100" 
        cy="100" 
        :r="largeRadius"
        fill="none"
        :stroke="useFlow ? 'url(#flowGradient)' : '#e8b4a0'"
        stroke-width="5"
        opacity="0.85"
      />

      <!-- Rotating group containing three small circles -->
      <g :transform="`rotate(${rotation} 100 100)`">
        <!-- Circle 1 - Top -->
        <circle 
          class="small-circle circle-1" 
          cx="100"
          :cy="100 - distance"
          :r="smallRadius"
          fill="none"
          :stroke="useFlow ? 'url(#flowGradient)' : '#e8b4a0'"
          stroke-width="5"
          opacity="0.9"
        >
          <animate v-if="state === 'chatting'" attributeName="r" values="20;36;20" dur="1.2s" repeatCount="indefinite" />
        </circle>
        
        <!-- Circle 2 - Bottom Right (120 degrees) -->
        <circle 
          class="small-circle circle-2" 
          :cx="100 + distance * Math.sin(60 * Math.PI / 180)"
          :cy="100 + distance * Math.cos(60 * Math.PI / 180)"
          :r="smallRadius"
          fill="none"
          :stroke="useFlow ? 'url(#flowGradient)' : '#b8d4c8'"
          stroke-width="5"
          opacity="0.9"
        >
          <animate v-if="state === 'chatting'" attributeName="r" values="20;36;20" dur="1.2s" repeatCount="indefinite" />
        </circle>
        
        <!-- Circle 3 - Bottom Left (240 degrees) -->
        <circle 
          class="small-circle circle-3" 
          :cx="100 - distance * Math.sin(60 * Math.PI / 180)"
          :cy="100 + distance * Math.cos(60 * Math.PI / 180)"
          :r="smallRadius"
          fill="none"
          :stroke="useFlow ? 'url(#flowGradient)' : '#c9b8e8'"
          stroke-width="5"
          opacity="0.9"
        >
          <animate v-if="state === 'chatting'" attributeName="r" values="20;36;20" dur="1.2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { AvatarState } from '@/types'

interface Props {
  state?: AvatarState
  useFlow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  state: 'idle',
  useFlow: true
})

const rotation = ref(0)

// IDLE: small circles at 22px distance, 24px radius (will clearly intersect each other), large at 50px
// THINKING: small circles at 12px distance, 20px radius (much tighter overlap), large at 60px (bigger outer circle)
// CHATTING: ALL circles same size (24px), small circles centered on edge of main circle (at 24px distance)

const largeRadius = computed(() => {
  if (props.state === 'idle') return 50
  if (props.state === 'thinking') return 60
  return 24 // chatting - same size as small circles
})

const smallRadius = computed(() => {
  if (props.state === 'idle') return 24
  if (props.state === 'thinking') return 20
  return 24 // chatting - same size as large circle
})

const distance = computed(() => {
  if (props.state === 'idle') return 22
  if (props.state === 'thinking') return 12
  return 24 // chatting - centers aligned on the main circle's edge
})

let animationFrame: number

const animate = () => {
  // Only rotate in idle and thinking states
  if (props.state === 'idle') {
    rotation.value += 0.6 // slower, calmer rotation for idle
    if (rotation.value >= 360) rotation.value -= 360
  } else if (props.state === 'thinking') {
    rotation.value += 2.0 // faster, more energetic rotation for thinking
    if (rotation.value >= 360) rotation.value -= 360
  }
  
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.ai-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-svg {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(42, 42, 42, 0.08));
}

/* Smooth transitions for radius and position changes */
.large-circle,
.small-circle {
  transition: r 0.6s ease-out, 
              cx 0.6s ease-out, 
              cy 0.6s ease-out;
}

/* Thinking state: add subtle pulse to all circles */
.state-thinking .large-circle {
  animation: pulseLarge 2s ease-in-out infinite;
}

.state-thinking .small-circle {
  animation: pulseSmall 2s ease-in-out infinite;
}

@keyframes pulseLarge {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

@keyframes pulseSmall {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

/* Chatting state animations handled by SVG animate elements */
</style>
