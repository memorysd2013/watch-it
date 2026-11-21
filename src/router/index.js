import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/rates'
    },
    {
      path: '/rates',
      name: 'rates',
      component: () => import('../views/ExchangeRateView.vue'),
      meta: { title: '匯率資訊' }
    },
    {
      path: '/add',
      name: 'add',
      component: () => import('../views/AddWatchView.vue'),
      meta: { title: '新增監控' }
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('../views/WatchlistView.vue'),
      meta: { title: '監控清單' }
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('../views/AssetAllocationView.vue'),
      meta: { title: '資產配置' }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { title: '推播設定' }
    }
  ]
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Watch It` : 'Watch It'
})

export default router
