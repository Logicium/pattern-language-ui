<script setup lang="ts">
import { content } from '@/data/site'

const s = content.presentation.winners
const winners = s.winners
</script>

<template>
  <div class="slide">
    <h2 class="htf-display htf-display--lg rise" style="--d: 0.1s">
      <span>{{ s.headLine1 }}</span><br />
      <span>{{ s.headLine2 }}</span>
    </h2>

    <div class="grid">
      <article
        v-for="(w, i) in winners"
        :key="w.name"
        class="win-card rise"
        :style="{ '--d': `${0.3 + i * 0.12}s` }"
      >
        <p class="htf-label win-card__place">
          <span :class="w.swatch"><span>{{ w.place }}</span> — <span>{{ w.prize }}</span></span>
        </p>
        <h3 class="htf-display htf-display--md">{{ w.name }}</h3>
        <p class="htf-body win-card__desc">{{ w.desc }}</p>
      </article>
    </div>

    <p class="htf-body foot rise" style="--d: 0.85s">
      <span>{{ s.footLead }}</span> <span class="htf-hl">{{ s.footHl }}</span
      >.
    </p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 2.75rem);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
}

.win-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: clamp(1rem, 2.5vh, 1.75rem) clamp(1rem, 2vw, 1.75rem);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.win-card__place {
  margin: 0;
}

.win-card__desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: clamp(0.8rem, 1.2vw, 1.05rem);
  max-width: none;
}

.foot {
  max-width: 70ch;
  color: rgba(255, 255, 255, 0.75);
}
</style>
