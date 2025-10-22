<template>
  <section class="cta-section">
    <div class="cta-divider"></div>
    <div class="cta-content">
      <h2 class="cta-title">Ready to transform<br>your community?</h2>
      <button class="btn btn-lg btn-light">Create Profile</button>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cta-section {
  background: linear-gradient(135deg, var(--color-bg-dark) 0%, #3a3a3a 100%);
  padding: 12rem 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.cta-divider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--color-accent-1) 25%,
    var(--color-accent-2) 50%,
    var(--color-accent-3) 75%,
    transparent 100%);
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 3.5rem;
  color: var(--color-bg-primary);
  margin-bottom: 3rem;
  line-height: 1.2;
}

.btn-light {
  color: var(--color-bg-primary);
  border-color: var(--color-bg-primary);
}

.btn-light:hover {
  box-shadow: 0 0 30px rgba(184, 212, 200, 0.3);
}

@media (max-width: 768px) {
  .cta-section {
    padding: 8rem 2rem;
  }
  
  .cta-title {
    font-size: 2.5rem;
  }
}
</style>
