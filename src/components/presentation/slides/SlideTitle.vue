<script setup lang="ts">
import PixelMosaic from '../PixelMosaic.vue'
import { content } from '@/data/site'

const s = content.presentation.title
</script>

<template>
  <div class="slide">
    <PixelMosaic class="corner corner--tr" :rows="3" :cols="6" :seed="7" />
    <PixelMosaic class="corner corner--bl" :rows="2" :cols="9" :seed="21" :weights="[0.2, 0.3, 0.5]" />

    <img src="/presentation/htf-logo.png" alt="" class="logo pop" style="--d: 0.9s" />

    <div class="content">
      <h1 class="htf-display htf-display--xl">
        <span class="rise line" style="--d: 0.1s">{{ s.line1 }}</span>
        <span class="rise line" style="--d: 0.25s">{{ s.line2 }}</span>
        <span class="rise line" style="--d: 0.4s">{{ s.line3 }}</span>
      </h1>

      <p class="tags">
        <span class="htf-label htf-hl rise" style="--d: 0.7s">{{ s.tagPrimary }}</span>
        <br />
        <span class="htf-label htf-hl htf-hl--pink rise" style="--d: 0.85s">{{
          s.tagSecondary
        }}</span>
      </p>

      <p class="htf-label byline rise" style="--d: 1.1s">
        {{ s.byline }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.slide {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.corner {
  position: absolute;
}

.corner--tr {
  top: 0;
  right: 0;
}

.corner--bl {
  bottom: 0;
  left: 0;
}

/* Bottom-right: the only corner free of the mosaics and the headline. */
.logo {
  position: absolute;
  right: 0;
  bottom: clamp(0.5rem, 2vh, 1.5rem);
  width: clamp(3.5rem, 7vw, 6.5rem);
  image-rendering: pixelated;
}

.content {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3.5vh, 3rem);
}

.line {
  display: block;
}

.tags {
  margin: 0;
  line-height: 2.3;
}

.byline {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}
</style>
