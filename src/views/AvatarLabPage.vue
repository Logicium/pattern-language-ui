<template>
  <div class="avatar-lab">
    <header class="lab-header">
      <p class="lab-label">PAL — Avatar System</p>
      <h1 class="lab-title">One mark, three states</h1>
      <p class="lab-subtitle">
        The PAL avatar in 3D — the brand mark's ring triad, built the way the ribbon canvas
        builds everything: bands of fine flowing lines. Every state transition glides;
        symmetry is never broken.
      </p>
    </header>

    <section class="stage-section">
      <div class="stage" :class="{ 'stage--ribbons': ribbonsOn }">
        <AiAvatar3D :key="`stage-${ribbonsOn}`" :state="activeState" :ribbons="ribbonsOn" />
      </div>

      <div class="controls">
        <div class="state-buttons">
          <button
            v-for="s in states"
            :key="s.id"
            class="btn"
            :class="activeState === s.id ? '' : 'btn-secondary'"
            @click="activeState = s.id"
          >
            {{ s.name }}
          </button>
        </div>
        <button class="btn-text ribbons-toggle" @click="ribbonsOn = !ribbonsOn">
          Ribbons {{ ribbonsOn ? 'on' : 'off' }}
        </button>
      </div>

      <p class="stage-caption">{{ activeDescription }}</p>
    </section>

    <section class="panel-section">
      <p class="panel-label">All states, side by side</p>
      <div class="panels">
        <article v-for="s in states" :key="s.id" class="panel">
          <div class="panel__stage">
            <AiAvatar3D :state="s.id" />
          </div>
          <h2 class="panel__name">{{ s.name }}</h2>
          <p class="panel__desc">{{ s.description }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from '@unhead/vue'
import { AiAvatar3D } from '@/components'
import type { AvatarState } from '@/types'

useSeoMeta({
  description: 'The PAL avatar system — the 3D mark and its animated states.'
})

const states: Array<{ id: AvatarState; name: string; description: string }> = [
  {
    id: 'idle',
    name: 'Idle',
    description:
      'Calm drift. The triad orbits the center slowly, the bands barely breathe, and the whole mark sways in one gentle 3D precession.'
  },
  {
    id: 'thinking',
    name: 'Thinking',
    description:
      'The outer ring swells while the triad tightens and spins three times faster. The gradient flows quicker, the band wave deepens, and everything pulses. With ribbons on, the strands pull inward toward the mark.'
  },
  {
    id: 'chatting',
    name: 'Chatting',
    description:
      'The orbit freezes into an equal-ring clover whose rings pulse as PAL types. With ribbons on, a ripple radiates outward from the center — the avatar speaking into the stream.'
  }
]

const activeState = ref<AvatarState>('idle')
const ribbonsOn = ref(false)

const activeDescription = computed(
  () => states.find((s) => s.id === activeState.value)?.description ?? ''
)
</script>

<style scoped>
.avatar-lab {
  min-height: 100vh;
  background: var(--color-bg-primary);
  padding: 9rem var(--container-padding) 6rem;
  max-width: var(--container-max);
  margin: 0 auto;
}

.lab-header {
  max-width: 640px;
  margin-bottom: 4rem;
}

.lab-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  margin: 0 0 1rem;
}

.lab-title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: var(--font-weight-light);
  letter-spacing: -0.03em;
  margin: 0 0 1.25rem;
}

.lab-subtitle {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ---- interactive stage ---- */

.stage-section {
  margin-bottom: 6rem;
}

.stage {
  height: clamp(320px, 48vh, 460px);
  border: 1px solid var(--hairline-strong);
  background: var(--color-bg-primary);
  transition: border-color var(--transition-base);
}

.stage--ribbons {
  border-color: var(--hairline);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.state-buttons {
  display: flex;
  gap: 0.75rem;
}

.ribbons-toggle {
  color: var(--color-text-secondary);
}

.stage-caption {
  margin: 1.5rem 0 0;
  max-width: 56ch;
  font-size: 0.9rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* ---- pinned comparison panels ---- */

.panel-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
  margin: 0 0 1.5rem;
}

.panels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
}

.panel {
  border-top: 1px solid var(--hairline-strong);
  padding-top: 1.5rem;
}

.panel__stage {
  height: 220px;
  margin-bottom: 1.25rem;
}

.panel__name {
  font-size: 1.25rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: -0.01em;
  margin: 0 0 0.5rem;
}

.panel__desc {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 900px) {
  .panels {
    grid-template-columns: 1fr;
  }
}
</style>
