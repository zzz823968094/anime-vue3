import { createRouter, createWebHistory } from 'vue-router'
import { visitApi } from '@/api/anime.js'

const routes = [
  { path: '/',           name: 'Home',   component: () => import('@/views/HomeView.vue') },
  { path: '/search',     name: 'Search', component: () => import('@/views/SearchView.vue') },
  { path: '/detail/:id', name: 'Detail', component: () => import('@/views/DetailView.vue') },
  { path: '/player',     name: 'Player', component: () => import('@/views/PlayerView.vue') },
  { path: '/login',      name: 'Login',  component: () => import('@/views/LoginView.vue') },
  { path: '/user',       name: 'User',   component: () => import('@/views/UserView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 鉴权
router.beforeEach(to => {
  if (to.meta.requiresAuth && !localStorage.getItem('ms_token')) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

// 访问上报：每次路由跳转后上报当前页面，Login/User 页不统计
router.afterEach(to => {
  if (to.name === 'Login' || to.name === 'User') return
  visitApi.report(to.fullPath)
})

export default router