import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy load views for optimization
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')

// Admin views
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const Overview = () => import('../views/admin/Overview.vue')
const InfaqMgmt = () => import('../views/admin/InfaqMgmt.vue')
const ZakatMgmt = () => import('../views/admin/ZakatMgmt.vue')
const KurbanMgmt = () => import('../views/admin/KurbanMgmt.vue')
const RekapInfaq = () => import('../views/admin/RekapInfaq.vue')

// Jamaah views
const Portal = () => import('../views/jamaah/Portal.vue')
const InfaqForm = () => import('../views/jamaah/InfaqForm.vue')
const ZakatForm = () => import('../views/jamaah/ZakatForm.vue')
const KurbanForm = () => import('../views/jamaah/KurbanForm.vue')

const routes = [
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        return auth.isAdmin ? '/admin/overview' : '/jamaah/portal'
      }
      return '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/overview' },
      { path: 'overview', name: 'AdminOverview', component: Overview },
      { path: 'infaq', name: 'AdminInfaq', component: InfaqMgmt },
      { path: 'zakat', name: 'AdminZakat', component: ZakatMgmt },
      { path: 'kurban', name: 'AdminKurban', component: KurbanMgmt },
      { path: 'rekap-infaq', name: 'AdminRekapInfaq', component: RekapInfaq }
    ]
  },
  {
    path: '/jamaah',
    meta: { requiresAuth: true, requiresJamaah: true },
    children: [
      { path: '', redirect: '/jamaah/portal' },
      { path: 'portal', name: 'JamaahPortal', component: Portal },
      { path: 'infaq', name: 'JamaahInfaq', component: InfaqForm },
      { path: 'zakat', name: 'JamaahZakat', component: ZakatForm },
      { path: 'kurban', name: 'JamaahKurban', component: KurbanForm }
    ]
  },
  // Public/Anonymous Infaq bypass route
  {
    path: '/infaq-publik',
    name: 'PublicInfaq',
    component: InfaqForm,
    meta: { publicOnly: true }
  },
  // Catch-all fallback
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route Guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  
  // Wait for auth initialization if user is null on first render
  if (auth.loading) {
    // A simple interval to wait for auth check
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!auth.loading) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  const isAuth = auth.isAuthenticated
  const isAdmin = auth.isAdmin
  const isJamaah = auth.isJamaah

  if (to.meta.requiresAuth && !isAuth) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/jamaah/portal')
  } else if (to.meta.requiresJamaah && !isJamaah) {
    next('/admin/overview')
  } else if (to.meta.guestOnly && isAuth) {
    next(isAdmin ? '/admin/overview' : '/jamaah/portal')
  } else {
    next()
  }
})

export default router
