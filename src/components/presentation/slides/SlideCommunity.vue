<script setup lang="ts">
import { content } from '@/data/site'

/* `c`, not `s`: the sponsor v-for already binds `s` as its item */
const c = content.presentation.community
const sponsors = c.sponsors
</script>

<template>
  <div class="slide">
    <div class="slide__bg" aria-hidden="true" />
    <div class="lede">
      <h2 class="htf-display htf-display--lg htf-display--boxed rise" style="--d: 0.1s">
        <span class="htf-hl htf-hl--black">{{ c.headLine1 }}</span><br />
        <span class="htf-hl htf-hl--black">{{ c.headLine2 }}</span><br />
        <span class="htf-hl htf-hl--black">{{ c.headLine3 }}</span>
      </h2>
      <p class="htf-body rise" style="--d: 0.4s">
        {{ c.lede }}
      </p>
    </div>

    <ul class="wall">
      <li
        v-for="(s, i) in sponsors"
        :key="s"
        class="wall__item htf-label pop"
        :class="{ 'wall__item--alt': i % 3 === 1 }"
        :style="{ '--d': `${0.35 + i * 0.05}s` }"
      >
        {{ s }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5rem);
  position: relative;
}

/* the one green-canvas slide, mirroring the deck's sponsor page */
.slide__bg {
  position: fixed;
  inset: 0;
  background: var(--htf-green);
}

.lede,
.wall {
  position: relative;
  min-width: 0;
  min-height: 0;
}

/* The authored line breaks only hold if the type fits the left column. At the
   shared --lg size this headline re-wrapped to seven lines and pushed the lede
   off the bottom of the slide, so it gets its own smaller scale. */
.lede .htf-display {
  font-size: clamp(1.25rem, 2.5vw, 2.75rem);
}

.lede {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3.5vh, 2.5rem);
}

.lede .htf-body {
  color: rgba(0, 0, 0, 0.75);
  font-weight: 500;
}

.wall {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-content: center;
}

.wall__item {
  background: #000;
  color: #fff;
  padding: 0.55em 0.9em;
}

.wall__item--alt {
  background: var(--htf-gray);
  color: #000;
}
</style>
