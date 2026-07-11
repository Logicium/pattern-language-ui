import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/views/HomePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import PatternsPage from '@/views/PatternsPage.vue'
import FullPatternPage from '@/views/FullPatternPage.vue'
import FullChallengePage from '@/views/FullChallengePage.vue'
import StoriesPage from '@/views/StoriesPage.vue'
import FullStoryPage from '@/views/FullStoryPage.vue'
import AllCitiesPage from '@/views/AllCitiesPage.vue'
import FullCityPage from '@/views/FullCityPage.vue'

// Auth, dashboard, and secondary pages are lazy-loaded so public visitors
// (and crawlers) don't pay for dashboard-only dependencies like FullCalendar.
const SignupPage = () => import('@/views/SignupPage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const ChatPage = () => import('@/views/dashboard/ChatPage.vue')
const PlaybooksPage = () => import('@/views/dashboard/PlaybooksPage.vue')
const FullPlaybookPage = () => import('@/views/dashboard/FullPlaybookPage.vue')
const DashboardStoriesPage = () => import('@/views/dashboard/DashboardStoriesPage.vue')
const SuccessStoriesListPage = () => import('@/views/dashboard/SuccessStoriesListPage.vue')
const GeneratedStoryPage = () => import('@/views/dashboard/GeneratedStoryPage.vue')
const ResourcesPage = () => import('@/views/dashboard/ResourcesPage.vue')
const SettingsPage = () => import('@/views/dashboard/SettingsPage.vue')
const ProfilePageWrapper = () => import('@/views/dashboard/ProfilePageWrapper.vue')
const InvitationsPage = () => import('@/views/dashboard/InvitationsPage.vue')
const TermsPage = () => import('@/views/TermsPage.vue')
const PrivacyPage = () => import('@/views/PrivacyPage.vue')
const BetaPage = () => import('@/views/BetaPage.vue')
const ShopPage = () => import('@/views/ShopPage.vue')
const LogoutPage = () => import('@/views/LogoutPage.vue')
const NotFoundPage = () => import('@/views/NotFoundPage.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
      // No seoTitle: App.vue's titleTemplate falls back to the full branded homepage title.
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
      meta: {
        seoTitle: 'About',
        seoDescription:
          'PatternLanguage.ai is a collaborative tool that helps rural communities design, plan, and implement solutions to complex challenges using proven patterns.'
      }
    },
    {
      path: '/patterns',
      name: 'patterns',
      component: PatternsPage,
      meta: {
        seoTitle: 'Pattern Library',
        seoDescription:
          'Browse 45+ proven patterns for rural community regeneration — from community anchor points to youth return pathways — each with problem, solution, and implementation steps.'
      }
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
      path: '/cities',
      name: 'cities',
      component: AllCitiesPage,
      meta: {
        seoTitle: 'Cities & Towns',
        seoDescription:
          'Explore rural cities and towns using Pattern Language to tackle their challenges — see local problems, active patterns, and community progress.'
      }
    },
    {
      path: '/cities/:id',
      name: 'city-detail',
      component: FullCityPage
    },
    {
      path: '/stories',
      name: 'stories',
      component: StoriesPage,
      meta: {
        seoTitle: 'Success Stories',
        seoDescription:
          'Real stories of rural communities putting patterns into practice — what they tried, what worked, and what changed.'
      }
    },
    {
      path: '/stories/:id',
      name: 'story-detail',
      component: FullStoryPage
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopPage,
      meta: {
        seoTitle: 'Shop',
        seoDescription: 'Books, prints, and goods from the Pattern Language project.'
      }
    },
    {
      path: '/beta',
      name: 'beta',
      component: BetaPage,
      meta: {
        seoTitle: 'Beta Program',
        seoDescription:
          'Pattern Language is in beta. Learn what that means and how to share feedback that shapes the platform.'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      component: TermsPage,
      meta: { seoTitle: 'Terms of Service' }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyPage,
      meta: { seoTitle: 'Privacy Policy' }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupPage,
      meta: { guestOnly: true, seoTitle: 'Sign Up', noindex: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { guestOnly: true, seoTitle: 'Log In', noindex: true }
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutPage,
      meta: { noindex: true }
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true, noindex: true },
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
          path: 'invitations',
          name: 'dashboard-invitations',
          component: InvitationsPage
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: SettingsPage
        },
        {
          path: 'profile/:id',
          name: 'dashboard-profile',
          component: ProfilePageWrapper
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
      meta: { seoTitle: 'Page Not Found', noindex: true }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // Query-only navigation (tab switches) keeps the current scroll position
    if (to.path === from.path) {
      return {}
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Check token validity - this will automatically clear expired tokens
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
