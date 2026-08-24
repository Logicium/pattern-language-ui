<template>
  <div class="slide">
    <h2 class="htf-display htf-display--lg htf-display--boxed rise" style="--d: 0.1s">
      Trinidad's first<br />
      <span class="htf-hl">hackathon_</span>
    </h2>

    <p class="htf-body wide rise" style="--d: 0.3s">
      Focused on civic innovation — inspiring and amplifying the voices of our residents to
      create real impact in a town of 8,000 people.
    </p>

    <div class="stats">
      <div class="stat rise" style="--d: 0.45s">
        <span class="stat__value">48</span>
        <span class="htf-label stat__label">hours of hacking</span>
      </div>
      <div class="stat rise" style="--d: 0.55s">
        <span class="stat__value">16</span>
        <span class="htf-label stat__label">sponsors &amp; partners</span>
      </div>
      <div class="stat rise" style="--d: 0.65s">
        <span class="stat__value">$1.6K</span>
        <span class="htf-label stat__label">in prizes awarded</span>
      </div>
      <div class="stat rise" style="--d: 0.75s">
        <span class="stat__value">6</span>
        <span class="htf-label stat__label">projects took home prizes</span>
      </div>
    </div>

    <p class="htf-label footer rise" style="--d: 0.9s">
      <span class="htf-hl htf-hl--yellow">November 14–16, 2025</span>&nbsp;&nbsp;
      <span class="htf-hl htf-hl--gray">Emergent Campus · Trinidad, CO</span>
    </p>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 3rem);
}

.wide {
  max-width: 60ch;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: rgba(255, 255, 255, 0.18);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.stat {
  background: #000;
  padding: clamp(1.2rem, 3vh, 2.5rem) clamp(1rem, 2vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat__value {
  font-family: var(--htf-font);
  font-weight: 900;
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  line-height: 1;
  color: var(--htf-green);
}

.stat__label {
  color: rgba(255, 255, 255, 0.7);
}

.footer {
  line-height: 2.2;
}

@media (max-aspect-ratio: 1/1) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
  }
}
</style>
