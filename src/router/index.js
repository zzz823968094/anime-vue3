import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',           name: 'Home',   component: () => import('@/views/HomeView.vue') },
  { path: '/search',     name: 'Search', component: () => import('@/views/SearchView.vue') },
  { path: '/detail/:id', name: 'Detail', component: () => import('@/views/DetailView.vue') },
  { path: '/player',     name: 'Player', component: () => import('@/views/PlayerView.vue') },
  { path: '/login',      name: 'Login',  component: () => import('@/views/LoginView.vue') },
  { path: '/user',       name: 'User',   component: () => import('@/views/UserView.vue'), meta: { requiresAuth: true } },
  { path: '/download',   name: 'Download', component: () => import('@/views/DownloadView.vue') },
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

export default router