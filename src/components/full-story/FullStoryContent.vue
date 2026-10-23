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

    <div v-if="evidence" class="content-block evidence-block">
      <div class="evidence-head">
        <h2 class="section-subtitle">What the evidence shows</h2>
        <span class="evidence-status text-xs" :class="`evidence-status--${evidence.status}`">
          {{ statusLabel(evidence.status) }}
        </span>
      </div>
      <p v-if="evidence.researchedAt" class="evidence-meta text-xs text-tertiary">
        {{ evidence.facts.length }} sourced facts from {{ evidence.sources.length }} sources, checked {{ formatDate(evidence.researchedAt) }}
      </p>

      <ol v-if="evidence.facts.length" class="fact-list">
        <li v-for="fact in evidence.facts" :key="fact.id" class="fact">
          <span class="fact-claim text-secondary">{{ fact.claim }}</span>
          <span class="fact-refs text-xs text-tertiary">
            <span v-if="fact.year" class="fact-year">{{ fact.year }}</span>
            <a
              v-for="sid in fact.sources"
              :key="sid"
              :href="sourceUrl(sid)"
              target="_blank"
              rel="noopener noreferrer"
              class="fact-source"
            >{{ sid }}</a>
          </span>
        </li>
      </ol>

      <div v-if="evidence.doNotInfer && evidence.doNotInfer.length" class="evidence-section">
        <h3 class="evidence-subtitle">What this story does not show</h3>
        <ul class="evidence-list evidence-list--caution">
          <li v-for="(item, i) in evidence.doNotInfer" :key="i" class="text-secondary">{{ item }}</li>
        </ul>
      </div>

      <div v-if="evidence.openQuestions && evidence.openQuestions.length" class="evidence-section">
        <h3 class="evidence-subtitle">Still unconfirmed</h3>
        <ul class="evidence-list">
          <li v-for="(item, i) in evidence.openQuestions" :key="i" class="text-secondary">{{ item }}</li>
        </ul>
      </div>

      <div v-if="evidence.sources.length" class="evidence-section">
        <h3 class="evidence-subtitle">Sources</h3>
        <ul class="source-list">
          <li v-for="src in evidence.sources" :key="src.id" class="source">
            <span class="source-id text-xs text-tertiary">{{ src.id }}</span>
            <span class="source-body">
              <a :href="src.url" target="_blank" rel="noopener noreferrer" class="source-title">{{ src.title }}</a>
              <span class="source-meta text-xs text-tertiary">
                {{ [src.publisher, src.publishedDate, src.independence].filter(Boolean).join(' · ') }}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="!evidence && story.references && story.references.length > 0" class="content-block references-block">
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
          <span class="reference-arrow chevron"></span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueMarkdownRender from 'vue-markdown-render'
import type { StoryEvidence, StoryEvidenceStatus } from '@/types'

const props = defineProps<{
  story: any
  extractDomain: (url: string) => string
  formatDate: (dateString: string) => string
}>()

// Evidence is optional on the API response; older stories and staged deploys have none.
const evidence = computed<StoryEvidence | null>(() => {
  const ev = props.story?.evidence
  return ev && Array.isArray(ev.facts) && Array.isArray(ev.sources) ? ev : null
})

const statusLabels: Record<StoryEvidenceStatus, string> = {
  verified: 'Verified',
  partial: 'Partly verified',
  thin: 'Thin evidence',
  'not-located': 'Could not be located',
}

function statusLabel(status: StoryEvidenceStatus): string {
  return statusLabels[status] ?? status
}

function sourceUrl(sourceId: string): string {
  return evidence.value?.sources.find(s => s.id === sourceId)?.url ?? '#'
}
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

/* Evidence block */
.evidence-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.evidence-head .section-subtitle { margin-bottom: 0.5rem; }

.evidence-status {
  font-family: var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.02em;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.evidence-status--verified { border-color: var(--color-accent-1); color: var(--color-accent-1); }
.evidence-status--partial { color: var(--color-text-primary); }
.evidence-status--thin,
.evidence-status--not-located { color: var(--color-text-tertiary); }

.evidence-meta { margin: 0 0 2rem; }

.fact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: fact;
}

.fact {
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
  counter-increment: fact;
}

.fact::before {
  content: counter(fact);
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  padding-top: 0.2rem;
}

.fact-claim { grid-column: 2; line-height: 1.7; }

.fact-refs {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  margin-top: 0.35rem;
}

.fact-year { color: var(--color-text-secondary); }

.fact-source {
  color: var(--color-text-tertiary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
}

.fact-source:hover { color: var(--color-text-primary); border-bottom-color: var(--color-text-primary); }

.evidence-section { margin-top: 3rem; }

.evidence-subtitle {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  margin: 0 0 1rem;
}

.evidence-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  line-height: 1.7;
}

.evidence-list--caution li::marker { color: var(--color-text-tertiary); }

.source-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.source {
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--color-border);
}

.source-id { padding-top: 0.2rem; font-family: var(--font-mono, ui-monospace, monospace); }

.source-body { display: flex; flex-direction: column; gap: 0.25rem; }

.source-title {
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
  width: fit-content;
}

.source-title:hover { border-bottom-color: var(--color-text-primary); }

@media (max-width: 640px) {
  .content-block { padding: 2rem 1.25rem; }
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
