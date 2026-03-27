<template>
  <aside class="dashboard-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <router-link to="/" class="logo">PATTERN LANGUAGE</router-link>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item" exact-active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Chat</span>
      </router-link>
      <router-link to="/dashboard/playbooks" class="nav-item" active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Playbooks</span>
      </router-link>
      <router-link to="/dashboard/invitations" class="nav-item" active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Invitations</span>
        <span v-if="pendingInvitationsCount > 0" class="nav-badge">{{ pendingInvitationsCount }}</span>
      </router-link>
      <router-link to="/dashboard/stories" class="nav-item" active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Stories</span>
      </router-link>
      <router-link to="/dashboard/resources" class="nav-item" active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Resources</span>
      </router-link>
      <router-link to="/dashboard/settings" class="nav-item" active-class="active" @click="$emit('navigate')">
        <span class="nav-label">Settings</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <button class="btn-text" @click="$emit('logout')">Logout</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  pendingInvitationsCount: number
  userName: string
}>()

defineEmits<{
  navigate: []
  logout: []
}>()
</script>

<style scoped>
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

.logo {
  font-size: 0.875rem;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.2em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.logo:hover { opacity: 0.6; }

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

.nav-item:hover { color: var(--color-text-primary); }
.nav-item.active { color: var(--color-text-primary); }

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

.user-info { display: flex; align-items: center; }

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

@media (max-width: 768px) {
  .sidebar-header { display: none; }

  .dashboard-sidebar {
    width: 280px;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
    z-index: 999;
    padding-top: 73px;
  }

  .dashboard-sidebar.is-open { transform: translateX(0); }

  .nav-item { font-size: 1rem; padding: 1rem var(--spacing-sm); }
  .nav-label { font-size: 1rem; }
  .user-name { font-size: 0.875rem; }
  .sidebar-footer .btn-text { font-size: 0.875rem; }
}

@media (max-width: 1024px) {
  .dashboard-sidebar { width: 200px; }
}
</style>
