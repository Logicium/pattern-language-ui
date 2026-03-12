<template>
  <nav class="navbar">
    <div class="container navbar-container">
      <router-link to="/" class="logo">PATTERN_LANGUAGE.AI</router-link>
      
      <!-- Desktop Nav Links -->
      <div class="nav-links">
        <router-link to="/about">About</router-link>
        <router-link to="/patterns">Patterns</router-link>
        <router-link to="/stories">Stories</router-link>
        <router-link to="/cities">Cities</router-link>
        <router-link v-if="isAuthenticated" to="/dashboard" class="btn">Dashboard</router-link>
        <router-link v-else to="/signup" class="btn">Start</router-link>
      </div>

      <!-- Mobile Hamburger -->
      <button 
        class="hamburger" 
        :class="{ 'is-active': isMobileMenuOpen }"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <!-- Mobile Menu Drawer -->
  <div class="mobile-menu" :class="{ 'is-open': isMobileMenuOpen }">
    <div class="mobile-menu-links">
      <router-link to="/about" @click="closeMobileMenu">About</router-link>
      <router-link to="/patterns" @click="closeMobileMenu">Patterns</router-link>
      <router-link to="/stories" @click="closeMobileMenu">Stories</router-link>
      <router-link to="/cities" @click="closeMobileMenu">Cities</router-link>
      <router-link v-if="isAuthenticated" to="/dashboard" class="btn" @click="closeMobileMenu">Dashboard</router-link>
      <router-link v-else to="/signup" class="btn" @click="closeMobileMenu">Start</router-link>
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  <div 
    class="mobile-menu-overlay" 
    :class="{ 'is-visible': isMobileMenuOpen }"
    @click="closeMobileMenu"
  ></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAuthenticated = authStore.isAuthenticated

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}
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
  text-decoration: none;
  color: var(--color-text-primary);
  z-index: 1001;
  position: relative;
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

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--color-text-primary);
}

.nav-links a.btn {
  text-decoration: none;
}

.nav-links a.btn:hover {
  color: var(--color-bg-primary);
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  width: 28px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  position: relative;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 1px;
  background: var(--color-text-primary);
  transition: all var(--transition-base);
  transform-origin: center;
}

.hamburger span:nth-child(2) {
  width: 20px;
  margin: 6px 0;
}

/* Hamburger to X Animation */
.hamburger.is-active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.is-active span:nth-child(2) {
  opacity: 0;
  width: 100%;
}

.hamburger.is-active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile Menu - Drop down from top */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-primary);
  transform: translateY(-100%);
  transition: transform var(--transition-base);
  z-index: 999;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.mobile-menu.is-open {
  transform: translateY(0);
}

.mobile-menu-links {
  display: flex;
  flex-direction: column;
  padding: 5.5rem 2rem 2rem;
  gap: 2rem;
}

.mobile-menu-links a {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 1.125rem;
  letter-spacing: 0.02em;
  transition: color var(--transition-base);
  font-weight: var(--font-weight-light);
}

.mobile-menu-links a:hover,
.mobile-menu-links a.router-link-active {
  color: var(--color-text-primary);
}

.mobile-menu-links a.btn {
  text-decoration: none;
  display: inline-block;
  width: fit-content;
  margin-top: 1rem;
}

.mobile-menu-links a.btn:hover {
  color: var(--color-bg-primary);
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(106, 106, 106, 0.15);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-base);
  z-index: 998;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mobile-menu-overlay.is-visible {
  opacity: 1;
  pointer-events: all;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hamburger {
    display: flex;
  }
  
  /* Ensure overlay is visible on mobile */
  .mobile-menu-overlay {
    display: block;
  }
}
</style>
