import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/page/:pageId',
      name: 'audit',
      component: () => import('@/views/AuditView.vue'),
      props: true,
    },
    {
      path: '/synthese',
      name: 'summary',
      component: () => import('@/views/SummaryView.vue'),
    },
  ],
})

export default router

