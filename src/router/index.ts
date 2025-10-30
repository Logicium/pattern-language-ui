import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/views/HomePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import PatternsPage from '@/views/PatternsPage.vue'
import FullPatternPage from '@/views/FullPatternPage.vue'
import FullChallengePage from '@/views/FullChallengePage.vue'
import StoriesPage from '@/views/StoriesPage.vue'
import FullStoryPage from '@/views/FullStoryPage.vue'
import SignupPage from '@/views/SignupPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ChatPage from '@/views/dashboard/ChatPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage
    },
    {
      path: '/patterns',
      name: 'patterns',
      component: PatternsPage
    },
    {
      path: '/patterns/:id',
      name: 'pattern-detail',
      component: FullPatternPage
    },
    {
      path: '/challenges/:id',
      name: 'challenge-detail',
      component: FullChallengePage
    },
    {
      path: '/stories',
      name: 'stories',
      component: StoriesPage
    },
    {
      path: '/stories/:id',
      name: 'story-detail',
      component: FullStoryPage
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupPage,
      meta: { guestOnly: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard-chat',
          component: ChatPage
        },
        {
          path: 'playbooks',
          name: 'dashboard-playbooks',
          component: () => import('@/views/dashboard/PlaybooksPage.vue')
        },
        {
          path: 'playbooks/:id',
          name: 'dashboard-playbook-detail',
          component: () => import('@/views/dashboard/FullPlaybookPage.vue')
        },
        {
          path: 'stories',
          name: 'dashboard-stories',
          component: () => import('@/views/dashboard/DashboardStoriesPage.vue')
        },
        {
          path: 'resources',
          name: 'dashboard-resources',
          component: () => import('@/views/dashboard/ResourcesPage.vue')
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: () => import('@/views/dashboard/SettingsPage.vue')
        }
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  // Routes that are only for guests (login, signup)
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'dashboard-chat' })
    return
  }

  next()
})

export default router
