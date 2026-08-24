<script setup lang="ts">
import PixelMosaic from '../PixelMosaic.vue'
import { content } from '@/data/site'

const s = content.presentation.host
</script>

<template>
  <div class="slide">
    <div class="text">
      <p class="htf-label rise" style="--d: 0.1s">{{ s.eyebrow }}</p>
      <h2 class="htf-display htf-display--lg">
        <span class="rise line" style="--d: 0.2s"><span class="htf-hl htf-hl--white">{{ s.headLine1 }}</span></span>
        <span class="rise line" style="--d: 0.35s"><span class="htf-hl htf-hl--white">{{ s.headLine2 }}</span></span>
      </h2>
      <p class="htf-body rise" style="--d: 0.55s">
        <!-- one line: Vue drops a newline between two elements, which would
             swallow the space between a name and the sentence after it -->
        <strong>{{ s.bodyName1 }}</strong> <span>{{ s.bodyPart1 }}</span> <strong>{{ s.bodyName2 }}</strong> <span>{{ s.bodyPart2 }}</span> <strong>{{ s.bodyName3 }}</strong><span>{{ s.bodyPart3 }}</span>
      </p>
    </div>

    <div class="portraits rise" style="--d: 0.45s">
      <PixelMosaic class="portraits__mosaic" :rows="5" :cols="3" :seed="13" :weights="[0.45, 0.2, 0.35]" />
      <figure class="portrait portrait--kisora">
        <img src="/presentation/kisora.jpeg" alt="Kisora Thomas" class="portrait__img" />
        <figcaption class="htf-label portrait__name">
          <span class="htf-hl htf-hl--white">{{ s.captionKisora }}</span>
        </figcaption>
      </figure>
      <figure class="portrait portrait--joze">
        <img src="/presentation/joze-cube.jpg" alt="Joze Petrich" class="portrait__img" />
        <figcaption class="htf-label portrait__name">
          <span class="htf-hl htf-hl--pink">{{ s.captionJoze }}</span>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5rem);
}

.text {
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 3vh, 2rem);
}

.text .htf-label {
  color: var(--htf-green);
}

.line {
  display: block;
  margin-bottom: 0.12em;
}

.htf-body strong {
  color: #fff;
  font-weight: 700;
}

.portraits {
  position: relative;
  justify-self: end;
  display: flex;
  align-items: flex-start;
  gap: clamp(1rem, 2vw, 2rem);
}

.portrait {
  position: relative;
  margin: 0;
}

.portrait--joze {
  margin-top: clamp(2.5rem, 6vh, 5rem);
}

.portrait__img {
  width: clamp(9.5rem, 19vw, 17rem);
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.portrait__name {
  position: absolute;
  left: 0;
  bottom: clamp(0.6rem, 1.5vh, 1.1rem);
  transform: translateX(-0.6rem);
}

.portraits__mosaic {
  position: absolute;
  top: clamp(-2rem, -3vw, -3rem);
  left: clamp(-3rem, -5vw, -5rem);
}

@media (max-aspect-ratio: 1/1) {
  .slide {
    grid-template-columns: 1fr;
    align-content: center;
  }

  .portraits {
    justify-self: start;
  }
}
</style>
