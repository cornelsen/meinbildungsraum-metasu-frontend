import { createRouter, createWebHistory } from 'vue-router'
import Library from './views/Library.vue'
import About from './views/About.vue'
import Profile from './views/Profile.vue'
import News from './views/News.vue'
import AdminLogin from './views/Admin/Login/Login.vue'
import AdminPublishers from './views/Admin/Providers/Publishers.vue'
import AdminNews from './views/Admin/News/News.vue'
import AdminArticles from './views/Admin/Articles/Articles.vue'
import Material from './views/MaterialPreview.vue'
import Publisher from './views/Publisher.vue'
import PublisherSearch from './views/PublisherSearch.vue'

const routes = [
  {
    path: '/',
    name:'Library',
    component: Library
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/about',
    name:'About',
    component: About
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: {
      layout: 'AdminLayout'
    }
  },
  {
    path: '/admin/publishers',
    name: 'AdminPublishers',
    component: AdminPublishers
  },
  {
    path: '/admin/news',
    name: 'AdminNews',
    component: AdminNews
  },
  {
    path: '/admin/articles',
    name: 'AdminArticles',
    component: AdminArticles
  },
  {
    path: '/profile/:tab?',
    name: 'Profile',
    component: Profile,
    props: true
  },
  {
    path: '/material/:publisherId/:materialId',
    name: 'Material',
    component: Material,
    props: true
  },
  {
    path: '/publisher/:publisherId',
    name: 'Publisher',
    component: Publisher,
    props: true
  },
  {
    path: '/publisher/search/:publisherId',
    name: 'PublisherSearch',
    component: PublisherSearch,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(from, to, savedPosition) {
    if (
      from.name === 'Library' &&
      from.name === to.name &&
      JSON.stringify(from.params) === JSON.stringify(to.params)
    ) {
      if(from.query.adv === to.query.adv) {
        return savedPosition
      }
    }
    return { top: 0, behavior: 'smooth'}
  },
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login/oauth2/code/') {
    window.location = `${window.origin}/${to.fullPath}`
  }
  return next()
})

export default router