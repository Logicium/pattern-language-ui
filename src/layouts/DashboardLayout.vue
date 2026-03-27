<template>
  <div class="dashboard-layout">
    <header class="mobile-header">
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
      <router-link to="/" class="mobile-logo">PATTERN LANGUAGE</router-link>
    </header>

    <DashboardSidebar
      :is-open="isMobileMenuOpen"
      :pending-invitations-count="pendingInvitationsCount"
      :user-name="user?.name || 'User'"
      @navigate="closeMobileMenu"
      @logout="handleLogout"
    />

    <div
      class="mobile-menu-overlay"
      :class="{ 'is-visible': isMobileMenuOpen }"
      @click="closeMobileMenu"
    ></div>

    <main class="dashboard-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import { useDashboardLayout } from '@/composables/useDashboardLayout'

const {
  user, pendingInvitationsCount, isMobileMenuOpen,
  toggleMobileMenu, closeMobileMenu, handleLogout
} = useDashboardLayout()
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.mobile-header { display: none; }

.hamburger {
  display: flex;
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

.hamburger.is-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.is-active span:nth-child(2) { opacity: 0; width: 100%; }
.hamburger.is-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.dashboard-main {
  grid-column: 2;
  min-height: 100vh;
}

.mobile-menu-overlay { display: none; }

@media (max-width: 1024px) {
  .dashboard-layout { grid-template-columns: 200px 1fr; }
}

@media (max-width: 768px) {
  .dashboard-layout { grid-template-columns: 1fr; }

  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 1.5rem var(--spacing-md);
    background: rgba(253, 251, 247, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(42, 42, 42, 0.08);
    z-index: 1000;
  }

  .mobile-header .hamburger {
    position: absolute;
    left: var(--spacing-md);
  }

  .mobile-logo {
    font-size: 0.875rem;
    font-weight: var(--font-weight-normal);
    letter-spacing: 0.2em;
    color: var(--color-text-primary);
    text-decoration: none;
  }

  .mobile-menu-overlay {
    display: block;
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
  }

  .mobile-menu-overlay.is-visible {
    opacity: 1;
    pointer-events: all;
  }

  .dashboard-main {
    padding-top: 71px;
    grid-column: 1;
  }
}
</style>
