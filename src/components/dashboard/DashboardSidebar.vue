<template>
  <aside class="dashboard-sidebar" :class="{ 'is-open': isOpen, 'is-collapsed': collapsed }">
    <div class="sidebar-header">
      <BrandLogo to="/" :size="65" word="PATTERN LANGUAGE" word-size="0.78rem" class="sidebar-brand" />
      <button
        type="button"
        class="collapse-toggle"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggle"
      >
        <component :is="collapsed ? ChevronRight : ChevronLeft" :size="14" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :exact-active-class="item.exact ? 'active' : undefined"
        :active-class="item.exact ? undefined : 'active'"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate')"
      >
        <component :is="item.icon" :size="18" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span
          v-if="item.badgeCount && item.badgeCount > 0"
          class="nav-badge"
          :class="{ 'nav-badge--dot': collapsed }"
        >
          <template v-if="!collapsed">{{ item.badgeCount }}</template>
        </span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <button
            type="button"
            class="logout-btn"
            :title="collapsed ? 'Logout' : undefined"
            @click="$emit('logout')"
          >
            <LogOut :size="16" />
            <span class="logout-label">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  MessageCircle,
  BookOpen,
  Mail,
  Megaphone,
  Layers,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import { useSidebarCollapsed } from '@/composables/useSidebarCollapsed'

const props = defineProps<{
  isOpen: boolean
  pendingInvitationsCount: number
  userName: string
}>()

defineEmits<{
  navigate: []
  logout: []
}>()

const { collapsed, toggle } = useSidebarCollapsed()

const navItems = computed(() => [
  { to: '/dashboard', label: 'Chat', icon: MessageCircle, exact: true, badgeCount: 0 },
  { to: '/dashboard/playbooks', label: 'Playbooks', icon: BookOpen, exact: false, badgeCount: 0 },
  { to: '/dashboard/invitations', label: 'Invitations', icon: Mail, exact: false, badgeCount: props.pendingInvitationsCount },
  { to: '/dashboard/stories', label: 'Stories', icon: Megaphone, exact: false, badgeCount: 0 },
  { to: '/dashboard/resources', label: 'Resources', icon: Layers, exact: false, badgeCount: 0 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false, badgeCount: 0 },
])
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
  transition: width var(--transition-base);
}

.dashboard-sidebar.is-collapsed { width: 72px; }

.sidebar-header {
  padding: 1.25rem 1rem 1rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 90px;
  position: relative;
  overflow: hidden;
}

.dashboard-sidebar.is-collapsed .sidebar-header {
  padding: 1.25rem 0.5rem 1rem;
  justify-content: center;
}

/* Brand: BrandLogo lays out as inline-flex mark + word. We allow the word to wrap to two lines so it never overflows the 220px sidebar. */
.sidebar-brand {
  min-width: 0;
  align-items: center;
  max-width: 100%;
}

.sidebar-brand :deep(.brand-word) {
  white-space: normal;
  word-spacing: 100vw; /* forces each space to break onto a new line */
  line-height: 1.15;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  transition: opacity 220ms ease, max-width 320ms ease, margin-left 320ms ease;
  opacity: 1;
  max-width: 180px;
  overflow: hidden;
}

.dashboard-sidebar.is-collapsed .sidebar-brand :deep(.brand-word) {
  opacity: 0;
  max-width: 0;
  margin-left: -0.625rem; /* cancels BrandLogo's gap so the mark sits centered */
}

/* Toggle: pinned to the top-right corner of the sidebar in BOTH states. */
.collapse-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--color-bg-secondary);
  border: 1px solid rgba(42, 42, 42, 0.12);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast), background var(--transition-fast), transform var(--transition-base);
  z-index: 2;
}

.collapse-toggle:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
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
  gap: 0.75rem;
  padding: 0.75rem var(--spacing-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  transition: color var(--transition-fast), background var(--transition-fast);
  position: relative;
  white-space: nowrap;
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

.nav-icon {
  flex-shrink: 0;
  stroke-width: 1.5;
}

.dashboard-sidebar.is-collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem 0;
}

.dashboard-sidebar.is-collapsed .nav-label {
  opacity: 0;
  max-width: 0;
  margin-left: -0.75rem;
}

.nav-label {
  font-size: 0.875rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 1;
  max-width: 180px;
  transition: opacity 220ms ease, max-width 320ms ease, margin-left 320ms ease;
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

.nav-badge--dot {
  position: absolute;
  top: 6px;
  right: 14px;
  padding: 0;
  width: 8px;
  height: 8px;
  min-width: 0;
  border-radius: 50%;
}

.sidebar-footer {
  padding: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
}

.dashboard-sidebar.is-collapsed .sidebar-footer {
  padding: var(--spacing-sm) 0.5rem;
  display: flex;
  justify-content: center;
}

.user-info { display: flex; align-items: center; width: 100%; }

.dashboard-sidebar.is-collapsed .user-info {
  width: auto;
  justify-content: center;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.dashboard-sidebar.is-collapsed .user-details {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.5rem;
  transition: opacity 220ms ease, max-height 320ms ease, margin-bottom 320ms ease;
  opacity: 1;
  max-height: 2rem;
}

.dashboard-sidebar.is-collapsed .user-name {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  pointer-events: none;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast);
}

.logout-label {
  transition: opacity 220ms ease, max-width 320ms ease;
  opacity: 1;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
}

.dashboard-sidebar.is-collapsed .logout-label {
  opacity: 0;
  max-width: 0;
}

.logout-btn:hover { color: var(--color-text-primary); }

.dashboard-sidebar.is-collapsed .logout-btn {
  justify-content: center;
  padding: 0.5rem;
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
  .dashboard-sidebar.is-collapsed { width: 280px; }
  .dashboard-sidebar.is-collapsed .nav-label,
  .dashboard-sidebar.is-collapsed .user-name { display: block; }
  .dashboard-sidebar.is-collapsed .nav-item { justify-content: flex-start; padding: 1rem var(--spacing-sm); }
  .dashboard-sidebar.is-collapsed .sidebar-footer { padding: var(--spacing-sm); justify-content: flex-start; }
  .dashboard-sidebar.is-collapsed .logout-btn { justify-content: flex-start; padding: 0; }

  .nav-item { font-size: 1rem; padding: 1rem var(--spacing-sm); }
  .nav-label { font-size: 1rem; }
  .user-name { font-size: 0.875rem; }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .dashboard-sidebar { width: 200px; }
}
</style>

