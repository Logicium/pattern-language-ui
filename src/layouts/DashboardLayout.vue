<template>
  <div class="dashboard-layout">
    <!-- Mobile Header -->
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

    <!-- Sidebar Navigation -->
    <aside class="dashboard-sidebar" :class="{ 'is-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">PATTERN LANGUAGE</router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Chat</span>
        </router-link>

        <router-link to="/dashboard/playbooks" class="nav-item" active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Playbooks</span>
        </router-link>

        <router-link to="/dashboard/invitations" class="nav-item" active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Invitations</span>
          <span v-if="pendingInvitationsCount > 0" class="nav-badge">{{ pendingInvitationsCount }}</span>
        </router-link>

        <router-link to="/dashboard/stories" class="nav-item" active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Stories</span>
        </router-link>

        <router-link to="/dashboard/resources" class="nav-item" active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Resources</span>
        </router-link>

        <router-link to="/dashboard/settings" class="nav-item" active-class="active" @click="closeMobileMenu">
          <span class="nav-label">Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">{{ user?.name || 'User' }}</div>
            <button class="btn-text" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Menu Overlay -->
    <div 
      class="mobile-menu-overlay" 
      :class="{ 'is-visible': isMobileMenuOpen }"
      @click="closeMobileMenu"
    ></div>

    <!-- Main Content -->
    <main class="dashboard-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { invitationsApi } from '@/services/api'

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)

const pendingInvitationsCount = ref(0)
const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

const handleLogout = () => {
  authStore.logout()
  closeMobileMenu()
}

const loadPendingInvitations = async () => {
  try {
    const invitations = await invitationsApi.getPending()
    pendingInvitationsCount.value = invitations.length
  } catch (error) {
    console.error('Failed to load pending invitations:', error)
  }
}

onMounted(() => {
  loadPendingInvitations()
  // Poll every 30 seconds for new invitations
  setInterval(loadPendingInvitations, 30000)
})
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

/* Mobile Header */
.mobile-header {
  display: none;
}

/* Hamburger Menu */
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

/* Sidebar */
.dashboard-sidebar {
  background: var(--color-bg-secondary);
  border-right: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  z-index: 100;
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-sm);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

@media (max-width: 768px) {
  .sidebar-header {
    display: none;
  }
}

.logo {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.2em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 0.6;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem var(--spacing-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  transition: color var(--transition-fast);
  position: relative;
}

.nav-item:hover {
  color: var(--color-text-primary);
}

.nav-item.active {
  color: var(--color-text-primary);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-text-primary);
}

.nav-label {
  font-size: 0.875rem;
  flex: 1;
}

.nav-badge {
  background: #e8b4a0;
  color: white;
  font-size: 0.75rem;
  font-weight: 400;
  padding: 2px 8px;
  min-width: 20px;
  text-align: center;
  margin-left: auto;
}

.sidebar-footer {
  padding: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
}

.sidebar-footer .btn-text {
  font-size: 0.8125rem;
  text-transform: none;
  letter-spacing: 0.01em;
}

/* Main Content */
.dashboard-main {
  grid-column: 2;
  min-height: 100vh;
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  display: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 200px 1fr;
  }

  .dashboard-sidebar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  /* Mobile Header */
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

  /* Sidebar becomes slide-in menu */
  .dashboard-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    z-index: 999;
    padding-top: 73px;
  }

  .dashboard-sidebar.is-open {
    transform: translateX(0);
  }

  /* Increase text size for mobile readability */
  .nav-item {
    font-size: 1rem;
    padding: 1rem var(--spacing-sm);
  }

  .nav-label {
    font-size: 1rem;
  }

  .user-name {
    font-size: 0.875rem;
  }

  .sidebar-footer .btn-text {
    font-size: 0.875rem;
  }

  /* Mobile Menu Overlay */
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
