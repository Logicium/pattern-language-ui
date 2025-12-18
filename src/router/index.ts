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
import PlaybooksPage from '@/views/dashboard/PlaybooksPage.vue'
import FullPlaybookPage from '@/views/dashboard/FullPlaybookPage.vue'
import DashboardStoriesPage from '@/views/dashboard/DashboardStoriesPage.vue'
import SuccessStoriesListPage from '@/views/dashboard/SuccessStoriesListPage.vue'
import GeneratedStoryPage from '@/views/dashboard/GeneratedStoryPage.vue'
import ResourcesPage from '@/views/dashboard/ResourcesPage.vue'
import SettingsPage from '@/views/dashboard/SettingsPage.vue'

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
          component: PlaybooksPage
        },
        {
          path: 'playbooks/:id',
          name: 'dashboard-playbook-detail',
          component: FullPlaybookPage
        },
        {
          path: 'stories',
          name: 'dashboard-stories',
          component: DashboardStoriesPage
        },
        {
          path: 'success-stories',
          name: 'dashboard-success-stories',
          component: SuccessStoriesListPage
        },
        {
          path: 'success-stories/:id',
          name: 'dashboard-success-story-detail',
          component: GeneratedStoryPage
        },
        {
          path: 'resources',
          name: 'dashboard-resources',
          component: ResourcesPage
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: SettingsPage
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
