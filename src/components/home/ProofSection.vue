<template>
  <section class="panel proof" aria-labelledby="proof-title">
    <div class="panel__in" v-reveal>
      <div class="proof__head">
        <h2 id="proof-title" class="panel__title">It is already happening.</h2>
        <p class="panel__lede fade" style="--i: 0">
          Every pattern in the library comes from somewhere it worked. These are a few of the towns, and the first one
          to run the whole method in a day.
        </p>
      </div>
      <ol class="ledger">
        <li v-for="(s, i) in stories" :key="s.id" class="fade" :style="{ '--i': i + 1 }">
          <router-link :to="`/stories/${s.id}`" class="row">
            <span class="row__place">{{ s.location }}</span>
            <span class="row__title">{{ s.title }}</span>
            <span class="row__arrow" aria-hidden="true">→</span>
          </router-link>
        </li>
        <li class="fade" :style="{ '--i': stories.length + 1 }">
          <router-link to="/hackathon" class="row row--next">
            <span class="row__place">Cañon City, Colorado</span>
            <span class="row__title">Community Solution Sprint <span class="row__when">Nov 7, 2026</span></span>
            <span class="row__arrow" aria-hidden="true">→</span>
          </router-link>
        </li>
      </ol>
      <router-link to="/stories" class="proof__all fade" :style="{ '--i': stories.length + 2 }">All the stories</router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { vReveal } from '@/directives/reveal'
import { useStories } from '@/composables/useStories'
import { allStories } from '@/utils/data/stories'

/** The home page's fourth panel: the evidence, as a short ledger of towns. */
const { stories: loaded } = useStories()
// the service's stories when they have arrived, the bundled copy until then
const stories = computed(() => (loaded.value.length ? loaded.value : allStories).slice(0, 4))
</script>

<style scoped>
.panel {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 9rem var(--container-padding);
}
.panel__in {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.proof__head {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
  gap: 2rem 6rem;
  align-items: end;
  margin-bottom: 3.5rem;
}
.panel__title {
  margin: 0;
  font-size: clamp(2.4rem, 1rem + 3.8vw, 4.6rem);
  font-weight: var(--font-weight-light);
  line-height: 1.02;
  letter-spacing: -0.04em;
}
.panel__lede {
  margin: 0;
  font-size: 1.1rem;
  font-weight: var(--font-weight-normal);
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.ledger {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--hairline-strong);
}
.row {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 7fr) 2rem;
  gap: 2rem;
  align-items: baseline;
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--hairline-strong);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: padding-left 0.4s cubic-bezier(0.2, 0.75, 0.15, 1);
}
.row:hover {
  padding-left: 0.6rem;
}
.row__place {
  font-size: 0.86rem;
  color: var(--color-text-secondary);
}
.row__title {
  font-size: 1.3rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.015em;
  line-height: 1.3;
}
.row__when {
  margin-left: 0.8rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent-warm);
}
.row__arrow {
  justify-self: end;
  color: var(--color-text-tertiary);
  transition: transform 0.4s cubic-bezier(0.2, 0.75, 0.15, 1), color 0.3s ease;
}
.row:hover .row__arrow {
  transform: translateX(4px);
  color: var(--color-text-primary);
}
.row--next .row__place {
  color: var(--color-accent-warm);
}
.proof__all {
  display: inline-block;
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  text-decoration: none;
  border-bottom: 1px solid var(--hairline-strong);
  transition: border-color 0.3s ease;
}
.proof__all:hover {
  border-color: var(--color-text-primary);
}
@media (max-width: 900px) {
  .proof__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }
  .row {
    grid-template-columns: minmax(0, 1fr) 2rem;
    gap: 0.3rem 1rem;
  }
  .row__place {
    grid-column: 1;
  }
  .row__title {
    grid-column: 1;
    font-size: 1.15rem;
  }
  .row__arrow {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
  }
}
@media (max-width: 767px) {
  .panel {
    min-height: 0;
    padding: 6rem var(--container-padding);
  }
  .proof__head {
    margin-bottom: 2.5rem;
  }
}
</style>
