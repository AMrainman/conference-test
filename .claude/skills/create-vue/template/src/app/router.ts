import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
    {
      path: '/about',
      component: () => import('@/features/about/views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
  ],
})
