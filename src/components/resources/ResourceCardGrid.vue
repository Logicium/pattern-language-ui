<template>
  <div class="resources-grid">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      :class="['resource-card', { 'link-card': type === 'links' }]"
      :data-accent="(index % 3) + 1"
    >
      <div class="card-header">
        <div class="card-number text-xs text-tertiary">
          <template v-if="type === 'patterns'">{{ String(item.id).padStart(2, '0') }}</template>
          <template v-else-if="type === 'stories'">Story {{ String(item.id).padStart(2, '0') }}</template>
          <template v-else-if="type === 'challenges'">WP{{ String(item.id).padStart(2, '0') }}</template>
          <template v-else>{{ item.category || 'Resource' }}</template>
        </div>
      </div>

      <h3 class="card-title">{{ type === 'links' ? item.name : item.title }}</h3>

      <div v-if="type === 'stories' || type === 'links'" class="card-location text-xs text-secondary">
        {{ item.location }}
      </div>

      <p class="card-description text-sm text-secondary">
        <template v-if="type === 'stories'">{{ item.solution || item.excerpt || item.problem }}</template>
        <template v-else>{{ item.description }}</template>
      </p>

      <div v-if="type === 'stories'" class="card-meta text-xs text-tertiary">
        {{ formatDate(item.publishedDate) }}
      </div>

      <div v-if="type === 'patterns' && item.addresses?.length > 0" class="card-tags">
        <div class="tags-label text-xs text-tertiary">Addresses</div>
        <div class="tags-list">
          <span v-for="addr in item.addresses.slice(0, 2)" :key="addr" class="tag text-xs">{{ addr }}</span>
        </div>
      </div>

      <div v-if="type === 'challenges' && item.relatedPatterns?.length > 0" class="card-tags">
        <div class="tags-label text-xs text-tertiary">Related Patterns</div>
        <div class="tags-list">
          <span v-for="p in item.relatedPatterns.slice(0, 2)" :key="p" class="tag text-xs">{{ p }}</span>
        </div>
      </div>

      <div v-if="type === 'links'" class="link-url text-xs text-tertiary">
        {{ getHostname(item.url) }}
      </div>

      <div class="card-actions">
        <router-link
          v-if="type === 'patterns'"
          :to="`/patterns/${item.id}`"
          class="action-btn-primary text-xs"
        >View Pattern</router-link>
        <router-link
          v-else-if="type === 'stories'"
          :to="`/stories/${item.id}`"
          class="action-btn-primary text-xs"
        >Read Story</router-link>
        <router-link
          v-else-if="type === 'challenges'"
          :to="`/challenges/${item.id}`"
          class="action-btn-primary action-btn-challenge text-xs"
        >View Challenge</router-link>
        <a
          v-else
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="action-btn-primary action-btn-link text-xs"
        >Visit Site</a>

        <button class="action-btn-secondary text-xs" @click="$emit('add', item, typeMap[type])">
          <span class="btn-icon">+</span> Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResourceTab } from '@/composables/useResourcesPage'

defineProps<{
  items: any[]
  type: ResourceTab
}>()

defineEmits<{
  add: [resource: any, type: string]
}>()

const typeMap: Record<ResourceTab, string> = {
  patterns: 'pattern',
  stories: 'story',
  challenges: 'challenge',
  links: 'link'
}

const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 2rem;
}

.resource-card {
  background: var(--color-bg-primary);
  padding: 2.5rem;
  border-left: 3px solid transparent;
  transition: all var(--transition-base);
}

.resource-card[data-accent="1"] { border-left-color: var(--color-accent-1); }
.resource-card[data-accent="2"] { border-left-color: var(--color-accent-2); }
.resource-card[data-accent="3"] { border-left-color: var(--color-accent-3); }

.resource-card:hover {
  box-shadow: 0 8px 24px rgba(42, 42, 42, 0.08);
}

.card-header { margin-bottom: 1rem; }

.card-number {
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.01em;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.card-location {
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.card-description {
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.card-tags {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tags-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.375rem 0.75rem;
  background: rgba(42, 42, 42, 0.05);
  border: 1px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}

.card-meta {
  margin-bottom: 1.5rem;
  letter-spacing: 0.05em;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn-primary {
  flex: 1;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid var(--color-text-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  position: relative;
  z-index: 1;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}

.action-btn-primary::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1));
  background-size: 300% 100%;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: -1;
  animation: borderSwirl 3s linear infinite;
}

.action-btn-primary:hover::before { opacity: 1; }

.action-btn-primary:hover {
  color: var(--color-bg-primary);
  border-color: transparent;
}

.action-btn-challenge::before,
.action-btn-link::before {
  background: var(--color-text-primary);
  animation: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-btn-challenge:hover::before,
.action-btn-link:hover::before { opacity: 1; }

.action-btn-challenge:hover,
.action-btn-link:hover {
  color: var(--color-bg-primary);
  border-color: var(--color-text-primary);
}

.action-btn-secondary {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(42, 42, 42, 0.15);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-family);
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn-secondary:hover {
  border-color: var(--color-accent-2);
  color: var(--color-text-primary);
  background: rgba(184, 212, 200, 0.05);
}

.btn-icon {
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
}

.link-card .link-url {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(42, 42, 42, 0.03);
  border-left: 2px solid rgba(42, 42, 42, 0.1);
  letter-spacing: 0.02em;
  font-family: 'Courier New', monospace;
}

@media (max-width: 1024px) {
  .resources-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .resources-grid {
    grid-template-columns: 1fr;
  }

  .resource-card {
    padding: 2rem;
  }
}
</style>
