<template>
  <div class="main-content">
    <div v-if="story.story" class="content-block story-body">
      <VueMarkdownRender :source="story.story" />
      <div v-if="story.publishedDate" class="published-date text-xs text-tertiary">
        Published {{ formatDate(story.publishedDate) }}
      </div>
    </div>

    <div v-else class="content-block">
      <h2 class="section-subtitle">Problem</h2>
      <p class="text-secondary">{{ story.problem }}</p>
      <h2 class="section-subtitle" style="margin-top: 3rem;">Solution</h2>
      <p class="text-secondary">{{ story.solution }}</p>
    </div>

    <div v-if="story.references && story.references.length > 0" class="content-block references-block">
      <h2 class="section-subtitle">References & Resources</h2>
      <div class="references-list">
        <a
          v-for="(url, index) in story.references"
          :key="index"
          :href="url"
          target="_blank"
          rel="noopener noreferrer"
          class="reference-link"
        >
          <div class="reference-content">
            <span class="reference-name text-sm">{{ extractDomain(url) }}</span>
            <p class="reference-description text-xs text-secondary">{{ url }}</p>
          </div>
          <span class="reference-arrow">↗</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueMarkdownRender from 'vue-markdown-render'

defineProps<{
  story: any
  extractDomain: (url: string) => string
  formatDate: (dateString: string) => string
}>()
</script>

<style scoped>
.main-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.content-block {
  background: var(--color-bg-primary);
  padding: 4rem;
}

.story-body {
  font-size: 1.125rem;
  line-height: 1.9;
  letter-spacing: -0.01em;
}

.story-body :deep(h2) {
  font-size: 2rem;
  font-weight: var(--font-weight-light);
  margin: 3rem 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.story-body :deep(h3) {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin: 2.5rem 0 1rem 0;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
}

.story-body :deep(p) {
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

.story-body :deep(strong) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.story-body :deep(em) {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.story-body :deep(a) {
  color: var(--color-accent-1);
  text-decoration: none;
  border-bottom: 1px solid var(--color-accent-1);
  transition: all var(--transition-base);
}

.story-body :deep(a:hover) {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-text-primary);
}

.story-body :deep(hr) {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.published-date {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.section-subtitle {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.content-block p { line-height: 1.8; }

.references-block {
  margin-top: 4rem;
  border-top: 2px solid var(--color-border);
  padding-top: 3rem;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reference-link {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
  border-left: 3px solid transparent;
}

.reference-link:hover {
  background: var(--color-bg-primary);
  border-left-color: var(--color-accent-1);
  transform: translateX(4px);
}

.reference-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reference-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.reference-description {
  line-height: 1.6;
  margin-top: 0.25rem;
}

.reference-arrow {
  font-size: 1.25rem;
  color: var(--color-text-tertiary);
  transition: all var(--transition-base);
}

.reference-link:hover .reference-arrow {
  color: var(--color-accent-1);
  transform: translate(4px, -4px);
}

@media (max-width: 768px) {
  .content-block { padding: 2rem; }
  .story-body { font-size: 1rem; }
}
</style>
