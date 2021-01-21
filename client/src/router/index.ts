import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import Landing from '../views/landing/landing.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Landing',
    component: Landing,
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: () => import('../views/game/game.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/about/about.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
