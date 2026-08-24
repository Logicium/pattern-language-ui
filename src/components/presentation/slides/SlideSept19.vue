<template>
  <div class="slide">
    <div class="date rise" style="--d: 0.15s">
      <span class="date__month">Sep</span>
      <span class="date__day">19</span>
      <span class="date__year">2026</span>
    </div>

    <div class="body">
      <p class="pld-number rise" style="--d: 0.1s">10 &nbsp;·&nbsp; Cañon City, Colorado</p>
      <h2 class="pld-display pld-display--xl rise" style="--d: 0.25s">
        We stop pretending.
      </h2>
      <p class="pld-body rise" style="--d: 0.5s">
        Cottonwood Springs was practice. On September 19 we put <em>Cañon City's</em> real
        challenges, real assets, and real people on the table — a working session to find its
        pattern stack and sketch the first 90-day experiment.
      </p>
      <p class="url rise" style="--d: 0.75s">
        ruralpatternlanguage.com<span class="url__path">/events</span>
      </p>
      <p class="note rise" style="--d: 0.95s">Sign up today — bring your neighbors.</p>
    </div>
  </div>
</template>

<style scoped>
.slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(2.5rem, 6vw, 6rem);
}

.date {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--hairline-strong);
  border-top: 4px solid transparent;
  border-image: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2), var(--color-accent-3)) 1;
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.75rem, 3.5vw, 3rem);
}

.date__month {
  font-size: clamp(0.9rem, 1.4vw, 1.2rem);
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--color-accent-warm);
}

.date__day {
  font-weight: 200;
  font-size: clamp(4.5rem, 10vw, 9rem);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}

.date__year {
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: var(--color-text-tertiary);
  letter-spacing: 0.2em;
}

.body {
  display: flex;
  flex-direction: column;
  gap: clamp(0.9rem, 2.2vh, 1.5rem);
  max-width: 60ch;
}

.pld-body em {
  font-style: normal;
  color: var(--color-text-primary);
  font-weight: 400;
}

.url {
  margin: 0;
  font-weight: 200;
  font-size: clamp(1.6rem, 3.4vw, 3rem);
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

.url__path {
  background: linear-gradient(
    90deg,
    var(--color-accent-warm),
    var(--color-accent-1),
    var(--color-accent-3)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
}

.note {
  margin: 0;
  font-weight: 300;
  font-size: clamp(0.9rem, 1.4vw, 1.15rem);
  color: var(--color-text-secondary);
}

@media (max-aspect-ratio: 1/1) {
  .slide {
    flex-direction: column;
    text-align: center;
  }

  .body {
    align-items: center;
  }
}
</style>
