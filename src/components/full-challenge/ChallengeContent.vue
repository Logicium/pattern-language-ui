<template>
  <div class="content-sections">
    <section class="content-section">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">Context</h2>
          <p class="body-text">{{ challenge.context }}</p>
        </div>
      </div>
    </section>

    <section class="content-section alt-bg">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">How This Shows Up</h2>
          <ul class="manifestation-list">
            <li
              v-for="(manifestation, index) in challenge.manifestations"
              :key="index"
              class="manifestation-item text-sm"
            >
              {{ manifestation }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="content-block">
          <h2 class="section-title">Patterns That Address This Challenge</h2>
          <div class="related-patterns-grid">
            <div
              v-for="(patternTitle, index) in challenge.relatedPatterns"
              :key="index"
              class="pattern-card"
              :data-accent="(index % 3) + 1"
              @click="$emit('navigatePattern', patternTitle)"
            >
              <div class="pattern-number text-xs text-tertiary">
                {{ String(getPatternId(patternTitle)).padStart(2, '0') }}
              </div>
              <h3 class="pattern-title text-sm">{{ patternTitle }}</h3>
              <div class="pattern-arrow">→</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  challenge: any
  getPatternId: (title: string) => number
}>()

defineEmits<{
  navigatePattern: [title: string]
}>()
</script>

<style scoped>
.content-section {
  padding: 4rem var(--container-padding);
  background: var(--color-bg-primary);
}

.content-section.alt-bg {
  background: var(--color-bg-secondary);
}

.content-section .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

.content-block { margin-bottom: 2rem; }

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 1.5rem;
}

.body-text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.manifestation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manifestation-item {
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-primary);
  border-left: 3px solid var(--color-accent-2);
  line-height: 1.7;
  transition: all var(--transition-base);
}

.manifestation-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(42, 42, 42, 0.05);
}

.related-patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.pattern-card {
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pattern-card[data-accent="1"] { border-left-color: var(--color-accent-1); }
.pattern-card[data-accent="2"] { border-left-color: var(--color-accent-2); }
.pattern-card[data-accent="3"] { border-left-color: var(--color-accent-3); }

.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.pattern-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pattern-title {
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  flex: 1;
}

.pattern-arrow {
  font-size: 1.25rem;
  color: var(--color-text-tertiary);
  align-self: flex-end;
  transition: all var(--transition-base);
}

.pattern-card:hover .pattern-arrow {
  color: var(--color-text-primary);
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .content-section { padding: 3rem var(--container-padding); }
  .section-title { font-size: 1.25rem; }
  .related-patterns-grid { grid-template-columns: 1fr; }
}
</style>
