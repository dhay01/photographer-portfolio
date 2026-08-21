import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '../pages/HomePage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/about', name: 'about', component: () => import('../pages/AboutPage.vue') },
  { path: '/work', name: 'work', component: () => import('../pages/WorkPage.vue') },
  { path: '/courses', name: 'courses', component: () => import('../pages/CoursesPage.vue') },
  {
    path: '/courses/:slug',
    name: 'course',
    component: () => import('../pages/CourseDetailPage.vue'),
  },
  { path: '/blog', name: 'blog', component: () => import('../pages/BlogPage.vue') },
  { path: '/blog/:slug', name: 'post', component: () => import('../pages/BlogPostPage.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
