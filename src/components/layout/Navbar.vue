<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <div class="logo">PATTERN_LANGUAGE.AI</div>
      <div class="nav-links">
        <a href="#about">About</a>
        <a href="#patterns">Patterns</a>
        <a href="#case-studies">Stories</a>
        <button class="btn">Start</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(253, 251, 247, 0.8);
  backdrop-filter: blur(20px);
  z-index: 1000;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.logo {
  font-size: 0.95rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.2em;
  animation: colorShift 8s ease infinite;
}

.nav-links {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.nav-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  letter-spacing: 0.02em;
  transition: color var(--transition-base);
}

.nav-links a:hover {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .nav-links {
    gap: 1.5rem;
  }
  
  .nav-links a {
    display: none;
  }
  
  .nav-links a:last-of-type,
  .nav-links button {
    display: inline-block;
  }
}
</style>
