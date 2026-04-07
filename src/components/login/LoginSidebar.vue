<template>
  <div class="sidebar">
    <div class="info-card">
      <h3>Designing Thriving Rural Communities</h3>
      <p class="text-sm text-secondary info-description">
        50 patterns for community-led regeneration, powered by proven 
        strategies and AI-guided implementation.
      </p>
      
      <div class="features-list">
        <div class="feature-item">
          <h4 class="text-sm">AI Chat Guidance</h4>
          <p class="text-xs text-tertiary">Get personalized support for your patterns</p>
        </div>
        <div class="feature-item">
          <h4 class="text-sm">Step-by-Step Playbooks</h4>
          <p class="text-xs text-tertiary">Track implementation with clear milestones</p>
        </div>
        <div class="feature-item">
          <h4 class="text-sm">Share Your Stories</h4>
          <p class="text-xs text-tertiary">Inspire others with your success</p>
        </div>
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

.info-card {
  background: var(--color-bg-primary);
  padding: 3rem;
}

.info-card h3 {
  font-size: 1.5rem;
  font-weight: var(--font-weight-normal);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.info-description {
  line-height: 1.7;
  margin-bottom: 2.5rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feature-item {
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.06);
}

.feature-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.feature-item h4 {
  font-weight: 500;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.feature-item p {
  line-height: 1.6;
}

@media (max-width: 768px) {
  .info-card {
    padding: 2rem;
  }
}
</style>
