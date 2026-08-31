<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="container navbar-container">
      <span class="brand">
        <BrandLogo to="/" word="PATTERN LANGUAGE.AI" :size="65" word-size="1rem" class="logo" />
        <router-link to="/beta" class="beta-chip" title="Pattern Language is in beta">beta</router-link>
      </span>

      <!-- Desktop Nav Links -->
      <div class="nav-links">
        <router-link to="/about">About</router-link>
        <router-link to="/patterns">Patterns</router-link>
        <router-link to="/stories">Stories</router-link>
        <router-link to="/cities">Cities</router-link>
        <router-link to="/shop">Shop</router-link>
        <router-link v-if="!isAuthenticated" to="/demo" class="btn btn-try">Try PAL</router-link>
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

  <!-- Mobile Menu: full-screen editorial index -->
  <div class="mobile-menu" :class="{ 'is-open': isMobileMenuOpen }">
    <nav class="menu-index" aria-label="Site">
      <router-link
        v-for="(item, i) in menuItems"
        :key="item.to"
        :to="item.to"
        class="menu-row"
        :style="{ '--i': i }"
        @click="closeMobileMenu"
      >
        <span class="menu-row__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <span class="menu-row__label">{{ item.label }}</span>
        <span class="menu-row__arrow chevron" aria-hidden="true" />
      </router-link>
    </nav>

    <div class="menu-actions" :style="{ '--i': menuItems.length }">
      <template v-if="!isAuthenticated">
        <router-link to="/demo" class="btn btn-try menu-btn" @click="closeMobileMenu">Try PAL</router-link>
        <router-link to="/signup" class="btn menu-btn" @click="closeMobileMenu">Start</router-link>
        <router-link to="/login" class="menu-login" @click="closeMobileMenu">Log in</router-link>
      </template>
      <router-link v-else to="/dashboard" class="btn menu-btn" @click="closeMobileMenu">Dashboard</router-link>
    </div>

    <div class="menu-foot" :style="{ '--i': menuItems.length + 1 }">
      <span class="menu-foot__word">Rural Pattern Language</span>
      <a href="mailto:hello@ruralpatternlanguage.com" class="menu-foot__link">hello@ruralpatternlanguage.com</a>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BrandLogo from '@/components/layout/BrandLogo.vue'

const authStore = useAuthStore()
// Computed (not unwrapped at setup) so the navbar reacts to login/logout
// without needing a remount.
const isAuthenticated = computed(() => authStore.isAuthenticated)

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const onScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

const menuItems = [
  { to: '/about', label: 'About' },
  { to: '/patterns', label: 'Patterns' },
  { to: '/stories', label: 'Stories' },
  { to: '/cities', label: 'Cities' },
  { to: '/events', label: 'Events' },
  { to: '/shop', label: 'Shop' },
]

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
  background: transparent;
  backdrop-filter: none;
  z-index: 1110;
  border-bottom: 1px solid transparent;
  transition: background 0.4s ease, backdrop-filter 0.4s ease, border-bottom-color 0.4s ease;
}

.navbar--scrolled {
  background: rgba(253, 251, 247, 0.8);
  backdrop-filter: blur(20px);
  border-bottom-color: rgba(42, 42, 42, 0.08);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 1001;
  position: relative;
  /* Let the brand give way on narrow screens instead of shoving the
     hamburger and beta chip past the right edge (min-width:auto would
     otherwise make it unshrinkable). */
  min-width: 0;
  flex-shrink: 1;
}

/* Always-visible beta marker; the dismissible BetaBanner handles the details */
.beta-chip {
  flex: none;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--color-accent-warm);
  border: 1px solid rgba(212, 123, 95, 0.4);
  padding: 0.15rem 0.4rem;
  text-decoration: none;
  line-height: 1;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.beta-chip:hover {
  border-color: var(--color-accent-warm);
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

/* Try PAL sits next to Start, so it carries a tint instead of a second
   identical outline — an invitation rather than a competing primary. */
.btn-try {
  background: color-mix(in srgb, var(--color-accent-2) 30%, transparent);
  border-color: transparent;
  color: var(--color-text-primary);
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex: none;
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
/* ---- Mobile menu: full-screen editorial index -------------------------
   A takeover in the site's paper, not a dropdown. Numbered rows in display
   type with hairline separators, a tri-accent CTA block, and a small
   colophon — the deck's language, folded into the phone. */
.mobile-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary);
  padding: 6rem var(--container-padding) calc(1.1rem + env(safe-area-inset-bottom, 0px));
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.35s ease, visibility 0s linear 0.35s;
  /* Above the floating beta pill (1100); the navbar rides higher still so the
     brand and the close button stay visible over the takeover. */
  z-index: 1105;
  overflow-y: auto;
}

.mobile-menu.is-open {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.35s ease;
}

.menu-index {
  display: flex;
  flex-direction: column;
}

.menu-row {
  display: flex;
  align-items: baseline;
  gap: 1.1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--hairline);
  text-decoration: none;
  color: var(--color-text-primary);
}

.menu-row:first-child {
  border-top: 1px solid var(--hairline-strong);
}

.menu-row__num {
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-fast);
}

.menu-row__label {
  font-size: 1.9rem;
  font-weight: var(--font-weight-light);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.menu-row__arrow {
  margin-left: auto;
  color: var(--color-text-tertiary);
  opacity: 0;
  transform: translateX(-0.4rem);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.menu-row.router-link-active .menu-row__num {
  color: var(--color-accent-warm);
}

.menu-row.router-link-active .menu-row__arrow,
.menu-row:active .menu-row__arrow {
  opacity: 1;
  transform: translateX(0);
}

.menu-actions {
  margin-top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.menu-btn {
  flex: none;
  padding: 0.6rem 1.5rem;
  text-decoration: none;
}

.menu-login {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text-secondary);
  text-decoration: none;
}

.menu-foot {
  margin-top: auto;
  padding-top: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.menu-foot__word {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-text-tertiary);
}

.menu-foot__link {
  font-size: 0.85rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  text-decoration: none;
}

/* Staggered entrance: rows drift up out of a blur, one after another. */
.menu-row,
.menu-actions,
.menu-foot {
  opacity: 0;
}

.mobile-menu.is-open .menu-row,
.mobile-menu.is-open .menu-actions,
.mobile-menu.is-open .menu-foot {
  animation: menuRise 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: calc(0.06s + var(--i, 0) * 0.055s);
}

@keyframes menuRise {
  from {
    opacity: 0;
    transform: translateY(0.9rem);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu,
  .mobile-menu.is-open .menu-row,
  .mobile-menu.is-open .menu-actions,
  .mobile-menu.is-open .menu-foot {
    transition-duration: 0.01ms;
    animation-duration: 0.01ms;
    animation-delay: 0s;
  }
}

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

  /* The full wordmark + chip + hamburger can't share 390px. The mark and
     chip carry the identity; the word returns at tablet width. */
  .logo :deep(.brand-word) {
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
