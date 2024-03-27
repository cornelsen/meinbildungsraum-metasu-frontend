import { createApp } from 'vue'
import './styles/main.scss'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'
import { createVuetify } from 'vuetify'
import {
  VBtn, VForm, VSelect, VTextField, VSnackbar, VLayout,
  VSlideYTransition, VDialog, VTextarea, VNavigationDrawer,
  VOverlay, VMenu, VIcon, VList, VListItem, VFileInput
} from 'vuetify/components'
import { register as swipperRegister } from 'swiper/element/bundle'
import { init as storageInit } from '@/stores/lastVisited'
import DefaultLayout from '@/layouts/default.vue'
import AdminLayout from '@/layouts/admin.vue'

const vuetify = createVuetify({
  components: {
    VBtn, VForm, VSelect, VTextField, VSnackbar, VLayout,
    VSlideYTransition, VDialog, VTextarea, VNavigationDrawer,
    VOverlay, VMenu, VIcon, VList, VListItem, VFileInput
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 0,
      md: 1200,
      lg: 1200,
      xl: 1200,
    },
  },
})

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'de',
  fallbackLocale: 'en',
  availableLocales: ['en', 'de'],
  messages: messages
})

swipperRegister()


const init = async () => {
  const app = createApp(App)
  app.component('DefaultLayout', DefaultLayout)
  app.component('AdminLayout', AdminLayout)
  app.use(vuetify)
  app.use(i18n)
  app.use(router)
  await router.isReady()
  app.mount('#app')

  storageInit()
}

init()

const body = document.querySelector('body')
// eslint-disable-next-line no-undef
body.setAttribute('build', __VERSION__)