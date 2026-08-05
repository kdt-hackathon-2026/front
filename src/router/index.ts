import { createRouter, createWebHistory } from 'vue-router';

import { ROUTE_NAMES } from '@/constants/routes';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: ROUTE_NAMES.HOME,
      component: HomeView,
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
