import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      redirect: '/auth/login',
    },
    {
      path: '/auth/login',
      component: () => import('@/views/AuthView.vue'),
    },
    {
      path: '/auth/register',
      component: () => import('@/views/RegisterView.vue'),
    },
     {
      path: '/@:username',
      component: () => import('@/views/ProfileView.vue'),
    },

     {
      path: '/c',
      component: () => import('@/views/app/TectaView.vue'),
    },
      {
      path: '/c/:chatId',
      component: () => import('@/views/app/TectaView.vue'),
    },
     {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue'),
    },
   {
      path: '/terms',
      component: () => import('@/views/legal/TermsView.vue'),
    },
   {
      path: '/privacy',
      component: () => import('@/views/legal/PrivacyView.vue'),
    },
   {
      path: '/settings',
      component: () => import('@/views/app/SettingsView.vue'),
    },
     {
      path: '/auth/logout',
      component: () => import('@/views/LogoutView.vue'),
    },

  
  ],
})

export default router
