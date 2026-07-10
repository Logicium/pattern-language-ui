<template>
  <div class="stories-grid">
    <router-link
      v-for="(story, index) in stories"
      :key="story.id"
      :to="`/stories/${story.id}`"
      class="story-card"
      :data-accent="(index % 3) + 1"
    >
      <div class="story-visual" :style="{ backgroundColor: story.color }">
        <img
          v-if="story.image"
          :src="story.image"
          :alt="story.location"
          class="story-image"
          loading="lazy"
        />
        <div class="color-overlay" :style="{ backgroundColor: story.color }"></div>
        <div class="story-location">{{ story.location }}</div>
      </div>

      <div class="story-content">
        <div class="label-row">
          <span class="label-id">
            <span class="accent-mark" aria-hidden="true"></span>
            Story {{ String(story.id).padStart(2, '0') }}
          </span>
        </div>

        <h3 class="card-title">{{ story.title }}</h3>

        <p class="card-excerpt">{{ story.excerpt || story.problem }}</p>

        <div class="card-tags">
          <span
            v-for="p in story.patterns.slice(0, 2)"
            :key="p"
            class="tag-chip"
          >{{ p }}</span>
          <span v-if="story.patterns.length > 2" class="tag-more">
            +{{ story.patterns.length - 2 }}
          </span>
        </div>

        <div class="card-foot">
          <span class="foot-note">{{ story.patterns.length }} {{ story.patterns.length === 1 ? 'pattern' : 'patterns' }}</span>
          <span class="view-note">Read Story</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stories: any[]
}>()
</script>

<style scoped>
.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.story-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  border: 1px solid var(--hairline);
  text-decoration: none;
  color: var(--color-text-primary);
  overflow: hidden;
  font-variant-numeric: tabular-nums;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.story-card:hover {
  background: #ffffff;
  border-color: var(--hairline-strong);
}

/* ── Visual ── */
.story-visual {
  height: 220px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.story-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.color-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
  mix-blend-mode: multiply;
}

.story-location {
  position: relative;
  z-index: 1;
  padding: 0.45rem 0.85rem;
  background: rgba(253, 251, 247, 0.95);
  backdrop-filter: blur(10px);
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
}

/* ── Content ── */
.story-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.75rem 2rem 1.75rem;
}

.label-row {
  display: flex;
  align-items: center;
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  margin-bottom: 1rem;
}

.label-id {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.accent-mark {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
}

.story-card[data-accent="1"] .accent-mark { background: var(--color-accent-1); }
.story-card[data-accent="2"] .accent-mark { background: var(--color-accent-2); }
.story-card[data-accent="3"] .accent-mark { background: var(--color-accent-3); }

.card-title {
  font-size: 1.375rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-excerpt {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  line-height: 1.65;
  margin: 0 0 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag-chip {
  padding: 0.45rem 0.85rem;
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.story-card[data-accent="1"] .tag-chip { background: color-mix(in srgb, var(--color-accent-1) 24%, transparent); }
.story-card[data-accent="2"] .tag-chip { background: color-mix(in srgb, var(--color-accent-2) 30%, transparent); }
.story-card[data-accent="3"] .tag-chip { background: color-mix(in srgb, var(--color-accent-3) 24%, transparent); }

.tag-more {
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.card-foot {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--hairline);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.foot-note { color: var(--color-text-tertiary); }

.view-note {
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--hairline-strong);
  padding-bottom: 2px;
  white-space: nowrap;
  transition: border-color var(--transition-fast);
}

.story-card:hover .view-note { border-bottom-color: var(--color-text-primary); }

@media (max-width: 1024px) {
  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
