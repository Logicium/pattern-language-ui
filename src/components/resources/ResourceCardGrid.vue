<template>
  <div class="resources-grid">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      :class="['resource-card', { 'link-card': isLinkTab, clickable: !isLinkTab }]"
      :data-accent="(index % 3) + 1"
      @click="onCardClick(item)"
    >
      <div class="label-row">
        <span class="label-id">
          <span class="accent-mark" aria-hidden="true"></span>
          <template v-if="type === 'patterns'">Pattern {{ String(item.id).padStart(2, '0') }}</template>
          <template v-else-if="type === 'stories'">Story {{ String(item.id).padStart(2, '0') }}</template>
          <template v-else-if="type === 'challenges'">WP {{ String(item.id).padStart(2, '0') }}</template>
          <template v-else>{{ item.category || 'Resource' }}</template>
        </span>
        <span v-if="type === 'stories' && item.publishedDate" class="label-meta">{{ formatDate(item.publishedDate) }}</span>
        <span v-else-if="isLinkTab && item.scope" class="label-meta">{{ item.scope }}</span>
      </div>

      <h3 class="card-title">{{ isLinkTab ? item.name : item.title }}</h3>

      <p v-if="(type === 'stories' || isLinkTab) && item.location" class="card-provenance">
        {{ item.location }}
      </p>

      <p class="card-description">
        <template v-if="type === 'stories'">{{ item.solution || item.excerpt || item.problem }}</template>
        <template v-else>{{ item.description }}</template>
      </p>

      <div v-if="type === 'patterns' && item.addresses?.length > 0" class="card-tags">
        <span v-for="addr in item.addresses.slice(0, 2)" :key="addr" class="tag-chip">{{ addr }}</span>
      </div>

      <div v-if="type === 'challenges' && item.relatedPatterns?.length > 0" class="card-tags">
        <span v-for="p in item.relatedPatterns.slice(0, 2)" :key="p" class="tag-chip">{{ p }}</span>
      </div>

      <div v-if="isLinkTab" class="link-url">
        {{ getHostname(item.url) }}
      </div>

      <div class="card-actions" @click.stop>
        <button
          v-if="type === 'patterns'"
          type="button"
          class="action-link action-primary"
          @click="$emit('view', item, type)"
        >View Pattern</button>
        <button
          v-else-if="type === 'stories'"
          type="button"
          class="action-link action-primary"
          @click="$emit('view', item, type)"
        >Read Story</button>
        <button
          v-else-if="type === 'challenges'"
          type="button"
          class="action-link action-primary"
          @click="$emit('view', item, type)"
        >View Challenge</button>
        <a
          v-else
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="action-link action-primary"
        >Visit Site</a>

        <button class="action-link action-muted" @click="$emit('add', item, resourceType)">
          + Add to Playbook
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LINK_TABS, type ResourceTab, type ResourceType } from '@/composables/useResourcesPage'

const props = defineProps<{
  items: any[]
  type: ResourceTab
}>()

const emit = defineEmits<{
  add: [resource: any, type: ResourceType]
  view: [resource: any, type: ResourceTab]
}>()

// Local / National / All tabs all show link-type resources
const isLinkTab = computed(() => LINK_TABS.includes(props.type))

function onCardClick(item: any) {
  if (isLinkTab.value) return
  emit('view', item, props.type)
}

const resourceType = computed<ResourceType>(() => {
  switch (props.type) {
    case 'patterns': return 'pattern'
    case 'stories': return 'story'
    case 'challenges': return 'challenge'
    default: return 'link'
  }
})

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
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  padding: 2.75rem 2.5rem 2.25rem;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.resource-card.clickable {
  cursor: pointer;
}

.resource-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 1.75rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.label-meta { white-space: nowrap; }

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.resource-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.resource-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.resource-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.card-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 0.85rem;
}

.card-provenance {
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin: 0 0 0.85rem;
}

.card-description {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 1.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
}

.tag-chip {
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

.resource-card[data-accent="1"] .tag-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.resource-card[data-accent="2"] .tag-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.resource-card[data-accent="3"] .tag-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.link-url {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
  padding-left: 1rem;
  border-left: 1px solid var(--hairline-strong);
  margin-bottom: 1.75rem;
}

.card-actions {
  display: flex;
  gap: 2.5rem;
  align-items: baseline;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--hairline);
}

.action-link {
  background: none;
  border: none;
  padding: 0 0 2px;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.action-primary {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-text-primary);
}

.action-muted {
  color: var(--color-text-tertiary);
  border-bottom: 1px solid transparent;
}

.action-muted:hover {
  color: var(--color-text-primary);
  border-bottom-color: var(--hairline-strong);
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
    padding: 2.25rem 1.75rem 2rem;
  }

  .card-actions {
    gap: 1.75rem;
    flex-wrap: wrap;
  }
}
</style>
