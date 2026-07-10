<template>
  <section class="playbook-hero gradient-bg">
    <div class="container">
      <div class="hero-meta">
        <span class="pattern-number text-xs text-tertiary">
          Pattern {{ String(playbook.patternId).padStart(2, '0') }} — {{ playbook.patternTitle }}
        </span>
        <span
          class="status-badge text-xs"
          :class="`status-${playbook.status}`"
        >
          {{ playbook.status }}
        </span>
      </div>
      <h1
        ref="titleEl"
        class="hero-title"
        :class="{ editable: canEdit }"
        :contenteditable="canEdit ? 'plaintext-only' : false"
        spellcheck="false"
        :title="canEdit ? 'Click to edit the title' : undefined"
        @keydown="onTitleKeydown"
        @blur="commitTitle"
      >{{ playbookTitle(playbook) }}</h1>
      <p class="hero-location text-secondary">
        {{ playbook.location }}
      </p>
      <div class="hero-progress">
        <div class="progress-info">
          <span class="progress-percentage">{{ playbook.progress }}%</span>
          <span class="text-xs text-tertiary">Complete</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :class="{ 'progress-complete': playbook.progress >= 100 }"
            :style="{
              width: `${playbook.progress}%`,
              backgroundSize: playbook.progress >= 100 ? '200% 100%' : `${100 / (playbook.progress || 1) * 100}% 100%`
            }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { playbookTitle } from '@/utils/formatters'

const props = defineProps<{
  playbook: any
  canEdit?: boolean
}>()

const emit = defineEmits<{
  updateTitle: [title: string]
}>()

const titleEl = ref<HTMLElement | null>(null)

const onTitleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    titleEl.value?.blur()
  } else if (e.key === 'Escape') {
    // Revert to the current title and exit editing
    if (titleEl.value) titleEl.value.textContent = playbookTitle(props.playbook)
    titleEl.value?.blur()
  }
}

const commitTitle = () => {
  if (!props.canEdit || !titleEl.value) return
  const next = (titleEl.value.textContent || '').replace(/\s+/g, ' ').trim()
  const current = playbookTitle(props.playbook)

  if (!next) {
    // Empty titles revert to what was there before
    titleEl.value.textContent = current
    return
  }
  if (next === current) {
    titleEl.value.textContent = current
    return
  }
  titleEl.value.textContent = next
  emit('updateTitle', next)
}
</script>

<style scoped>
.playbook-hero {
  padding: 4rem 0;
}

.hero-meta {
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.hero-title {
  font-size: 4rem;
  font-weight: var(--font-weight-light);
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

/* Editing must not change how the title looks — only the caret appears. */
.hero-title.editable {
  cursor: text;
  outline: none;
  caret-color: var(--color-text-primary);
}

.hero-location {
  font-size: 1.25rem;
  line-height: 1.7;
  margin-bottom: 3rem;
}

.hero-progress {
  max-width: 600px;
}

@media (max-width: 768px) {
  .playbook-hero {
    padding: 3rem 0;
  }
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-location {
    font-size: 1rem;
  }
}
</style>
