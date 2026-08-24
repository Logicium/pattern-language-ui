<script setup lang="ts">
const winners = [
  {
    place: '1st',
    prize: '$700',
    name: 'Stories of Trinidad',
    desc: 'QR-coded historical audio tour of downtown — scan a plaque, hear the town speak.',
    hl: 'htf-hl'
  },
  {
    place: '2nd',
    prize: '$300',
    name: 'Local Resources App',
    desc: 'One place to find every service, program, and helping hand in Las Animas County.',
    hl: 'htf-hl htf-hl--pink'
  },
  {
    place: '3rd',
    prize: '$200',
    name: 'Adopt a Pocket',
    desc: 'Neighbors adopting neglected pockets of public space, one block at a time.',
    hl: 'htf-hl htf-hl--yellow'
  },
  {
    place: '3rd',
    prize: '$200',
    name: 'The Tool Library',
    desc: 'A lending library for tools — buy nothing, build everything.',
    hl: 'htf-hl htf-hl--yellow'
  }
]
</script>

<template>
  <div class="slide">
    <h2 class="htf-display htf-display--lg rise" style="--d: 0.1s">
      What they<br />
      built_
    </h2>

    <div class="grid">
      <article
        v-for="(w, i) in winners"
        :key="w.name"
        class="win-card rise"
        :style="{ '--d': `${0.3 + i * 0.12}s` }"
      >
        <p class="htf-label win-card__place">
          <span :class="w.hl">{{ w.place }} — {{ w.prize }}</span>
        </p>
        <h3 class="htf-display htf-display--md">{{ w.name }}</h3>
        <p class="htf-body win-card__desc">{{ w.desc }}</p>
      </article>
    </div>

    <p class="htf-body foot rise" style="--d: 0.85s">
      Every single project pointed at a real local problem. Judged on innovation, execution,
      design, presentation — and above all, <span class="htf-hl">civic impact</span>.
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
