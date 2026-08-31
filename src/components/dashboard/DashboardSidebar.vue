<template>
  <aside class="dashboard-sidebar" :class="{ 'is-open': isOpen, 'is-collapsed': collapsed }">
    <div class="sidebar-header">
      <BrandLogo to="/" :size="48" word="PATTERN LANGUAGE" word-size="0.78rem" class="sidebar-brand" />
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="(item, i) in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :style="{ '--i': i }"
        :exact-active-class="item.exact ? 'active' : undefined"
        :active-class="item.exact ? undefined : 'active'"
        :title="collapsed ? item.label : undefined"
        @click="$emit('navigate')"
      >
        <span class="nav-index" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        <component :is="item.icon" :size="18" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span
          v-if="item.badgeCount && item.badgeCount > 0"
          class="nav-badge"
          :class="{ 'nav-badge--dot': collapsed }"
        >
          <template v-if="!collapsed">{{ item.badgeCount }}</template>
        </span>
        <span class="nav-chevron chevron" aria-hidden="true" />
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-ident">
        <span class="user-ident__label">Signed in as</span>
        <div class="user-name">{{ userName }}</div>
      </div>
      <div class="footer-actions">
        <button
          type="button"
          class="footer-btn logout-btn"
          :title="collapsed ? 'Logout' : undefined"
          @click="$emit('logout')"
        >
          <LogOut :size="16" />
          <span class="logout-label">Logout</span>
        </button>
        <button
          type="button"
          class="footer-btn collapse-toggle"
          :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggle"
        >
          <component :is="collapsed ? ChevronsRight : ChevronsLeft" :size="16" />
        </button>
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
  ChevronsLeft,
  ChevronsRight,
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
/* Translucent over the page-header gradient that extends beneath it,
   blurred like the public navbar. */
.dashboard-sidebar {
  background: color-mix(in srgb, var(--color-bg-secondary) 62%, transparent);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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

/* Same height as the dashboard page headers so the bottom rules align. */
.sidebar-header {
  height: var(--dash-header-height);
  flex-shrink: 0;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(42, 42, 42, 0.08);
  display: flex;
  align-items: center;
  overflow: hidden;
  transition: padding var(--transition-base);
}

/* Center the 48px mark inside 72px without a layout-mode jump */
.dashboard-sidebar.is-collapsed .sidebar-header {
  padding: 0 0.75rem;
}

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

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Padding animates instead of switching justify-content, so icons glide
   to their collapsed position rather than jumping. */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem var(--spacing-sm);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  letter-spacing: 0.01em;
  transition: color var(--transition-fast), background var(--transition-fast), padding var(--transition-base);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.dashboard-sidebar.is-collapsed .nav-item {
  padding: 0.75rem 0 0.75rem 27px; /* (72px - 18px icon) / 2 */
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
  stroke-width: 1.25;
}

/* Editorial index number + chevron exist for the phone takeover only. */
.nav-index,
.nav-chevron {
  display: none;
}

.user-ident__label {
  display: none;
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

.dashboard-sidebar.is-collapsed .nav-label {
  opacity: 0;
  max-width: 0;
  margin-left: -0.75rem;
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

/* ── Footer: logout + collapse toggle live together at the bottom ── */
.sidebar-footer {
  padding: var(--spacing-sm);
  border-top: 1px solid rgba(42, 42, 42, 0.08);
  transition: padding var(--transition-base);
}

.dashboard-sidebar.is-collapsed .sidebar-footer {
  padding: var(--spacing-sm) 0.5rem;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.65rem;
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

/* One row in both states — buttons never wrap or jump, labels collapse away */
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-family);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0.4rem;
  margin: -0.4rem 0;
  transition: color var(--transition-fast);
  min-width: 0;
}

/* Icons keep their size no matter how tight the collapsed rail gets —
   without this, flex squeezes the SVGs when the row runs out of room. */
.footer-btn svg {
  flex-shrink: 0;
}

.dashboard-sidebar.is-collapsed .footer-btn {
  padding: 0.4rem 0.3rem;
}

.footer-btn:hover { color: var(--color-text-primary); }

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

@media (max-width: 768px) {
  .sidebar-header { display: none; }

  /* ---- Phone: the drawer becomes the same full-screen editorial takeover
     as the public site's menu — numbered index rows in display type,
     hairline separators, staggered rise-out-of-blur, identity colophon. ---- */
  .dashboard-sidebar {
    inset: 0;
    width: 100%;
    background: var(--color-bg-primary);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-right: none;
    /* A quiet lateral entrance — kin to the public menu, not a clone of it. */
    transform: translateX(-2.5rem);
    opacity: 0;
    visibility: hidden;
    transition:
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 0.35s ease,
      visibility 0s linear 0.4s;
    z-index: 999;
    padding: 6rem var(--container-padding) calc(1.1rem + env(safe-area-inset-bottom, 0px));
    overflow-y: auto;
  }

  .dashboard-sidebar.is-open {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
    transition:
      transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 0.35s ease;
  }

  /* Desktop collapse state is meaningless in the takeover. */
  .dashboard-sidebar.is-collapsed { width: 100%; }
  .dashboard-sidebar.is-collapsed .nav-label,
  .dashboard-sidebar.is-collapsed .user-name { display: block; opacity: 1; max-width: none; max-height: none; }
  .dashboard-sidebar.is-collapsed .sidebar-footer { padding: 0; }
  .dashboard-sidebar.is-collapsed .logout-label { opacity: 1; max-width: none; }
  .collapse-toggle { display: none; }

  .sidebar-nav {
    padding: 0;
    gap: 0;
    flex: none;
  }

  .nav-item,
  .dashboard-sidebar.is-collapsed .nav-item {
    align-items: center;
    gap: 1.1rem;
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--hairline);
    color: var(--color-text-primary);
    overflow: visible;
  }

  .nav-item:first-child {
    border-top: 1px solid var(--hairline-strong);
  }

  .nav-item.active::before { display: none; }

  .nav-icon {
    width: 22px;
    height: 22px;
    color: var(--color-text-tertiary);
    transition: color var(--transition-fast);
  }

  .nav-item.active .nav-icon {
    color: var(--color-text-primary);
  }

  .nav-index {
    display: inline;
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    color: var(--color-text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .nav-item.active .nav-index {
    color: var(--color-accent-warm);
  }

  .nav-label,
  .dashboard-sidebar.is-collapsed .nav-label {
    font-size: 1.9rem;
    font-weight: var(--font-weight-light);
    letter-spacing: -0.02em;
    line-height: 1.1;
    flex: none;
    max-width: none;
  }

  .nav-badge {
    align-self: center;
    margin-left: 0.25rem;
  }

  .nav-chevron {
    display: inline-block;
    margin-left: auto;
    color: var(--color-text-tertiary);
    opacity: 0;
    transform: translateX(-0.4rem);
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }

  .nav-item.active .nav-chevron,
  .nav-item:active .nav-chevron {
    opacity: 1;
    transform: translateX(0);
  }

  /* Identity colophon + logout anchor the bottom, like the site menu's foot. */
  .sidebar-footer {
    margin-top: auto;
    padding: 2.5rem 0 0;
    border-top: none;
  }

  .user-ident {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 1rem;
  }

  .user-ident__label {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--color-text-tertiary);
  }

  .user-name {
    font-size: 1.05rem;
    font-weight: var(--font-weight-normal);
    margin-bottom: 0;
  }

  .logout-btn {
    padding: 0;
    margin: 0;
    gap: 0.5rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  /* Staggered entrance, matching the public menu's choreography. */
  .nav-item,
  .sidebar-footer {
    opacity: 0;
  }

  .dashboard-sidebar.is-open .nav-item,
  .dashboard-sidebar.is-open .sidebar-footer {
    animation: dashMenuSlide 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
    animation-delay: calc(0.08s + var(--i, 6) * 0.05s);
  }

  @keyframes dashMenuSlide {
    from {
      opacity: 0;
      transform: translateX(-1.4rem);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
      filter: blur(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-sidebar,
    .dashboard-sidebar.is-open .nav-item,
    .dashboard-sidebar.is-open .sidebar-footer {
      transition-duration: 0.01ms;
      animation-duration: 0.01ms;
      animation-delay: 0s;
    }
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .dashboard-sidebar { width: 200px; }
}
</style>
