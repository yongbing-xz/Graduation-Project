import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/compatibility-check',
    name: 'CompatibilityCheck',
    component: () => import('@/views/CompatibilityCheck.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/component-management',
    name: 'ComponentManagement',
    component: () => import('@/views/ComponentManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rule-management',
    name: 'RuleManagement',
    component: () => import('@/views/RuleManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }
  
  // 如果已登录，不允许访问登录页
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router