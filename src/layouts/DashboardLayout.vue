<template>
  <div class="dashboard-layout">
    <!-- Sidebar Navigation -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="logo">Pattern Language</router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" exact-active-class="active">
          <span class="nav-label">Chat</span>
        </router-link>

        <router-link to="/dashboard/playbooks" class="nav-item" active-class="active">
          <span class="nav-label">Playbooks</span>
        </router-link>

        <router-link to="/dashboard/stories" class="nav-item" active-class="active">
          <span class="nav-label">Stories</span>
        </router-link>

        <router-link to="/dashboard/resources" class="nav-item" active-class="active">
          <span class="nav-label">Resources</span>
        </router-link>

        <router-link to="/dashboard/settings" class="nav-item" active-class="active">
          <span class="nav-label">Settings</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-details">
            <div class="user-name">{{ user?.name || 'User' }}</div>
            <div class="user-location text-xs text-tertiary">{{ user?.location || 'Location' }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: var(--color-bg-primary);
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
}

.sidebar-header {
  padding: var(--spacing-md) var(--spacing-sm);
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
}

.logo {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.02em;
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
  margin-bottom: 0.125rem;
}

/* Main Content */
.dashboard-main {
  grid-column: 2;
  min-height: 100vh;
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

  .dashboard-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: auto;
    width: 100%;
    height: auto;
    flex-direction: row;
    z-index: 100;
  }

  .sidebar-header {
    padding: var(--spacing-sm);
    border-right: 1px solid rgba(42, 42, 42, 0.08);
    border-bottom: none;
  }

  .sidebar-nav {
    flex-direction: row;
    padding: var(--spacing-sm);
    overflow-x: auto;
    flex: 1;
  }

  .sidebar-footer {
    padding: var(--spacing-sm);
    border-top: none;
    border-left: 1px solid rgba(42, 42, 42, 0.08);
  }

  .user-name {
    display: none;
  }

  .dashboard-main {
    padding-top: 60px;
  }

  .nav-item.active::before {
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;
    width: auto;
    height: 2px;
  }
}
</style>
