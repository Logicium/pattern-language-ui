<template>
  <div class="sidebar">
    <div class="info-card">
      <h3>What Happens Next?</h3>
      <ol class="steps-list">
        <li class="text-sm text-secondary">
          <span class="step-number text-xs">1</span>
          We'll analyze your community's context and challenges
        </li>
        <li class="text-sm text-secondary">
          <span class="step-number text-xs">2</span>
          Our AI suggests relevant patterns tailored to your needs
        </li>
        <li class="text-sm text-secondary">
          <span class="step-number text-xs">3</span>
          You explore playbooks and connect with similar communities
        </li>
        <li class="text-sm text-secondary">
          <span class="step-number text-xs">4</span>
          Start building with a 90-day sprint and track progress
        </li>
      </ol>
    </div>

    <div class="testimonial-card">
      <p class="testimonial-text text-sm">
        "PatternLanguage.ai helped us see connections we'd missed and gave 
        us a clear starting point. Within 3 months we had our first win."
      </p>
      <div class="testimonial-author">
        <span class="text-xs text-tertiary">— Community Leader</span>
        <span class="text-xs text-tertiary">Rural Nebraska</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card,
.testimonial-card {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.info-card h3 {
  font-size: 1.25rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

.steps-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.steps-list li {
  display: flex;
  gap: 1rem;
  line-height: 1.7;
}

.steps-list .step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-accent-1);
  color: var(--color-bg-primary);
  border-radius: 50%;
  flex-shrink: 0;
  letter-spacing: 0;
  border: none;
}

.testimonial-card {
  border-left: 3px solid var(--color-accent-2);
}

.testimonial-text {
  line-height: 1.8;
  font-style: italic;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.testimonial-author {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .info-card,
  .testimonial-card {
    padding: 2rem;
  }
}
</style>
