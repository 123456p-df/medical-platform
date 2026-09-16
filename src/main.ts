import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { i18n, t } from './i18n'
import { inheritSessionFromOpener, prepareSessionForAppBoot } from '@/api/client'

// A new frontend process invalidates sessions from earlier app launches. Page
// reloads within this process remain authenticated, and child viewers may
// inherit the current process-scoped session from their opener.
if (!inheritSessionFromOpener()) prepareSessionForAppBoot()

const app = createApp(App)

app.use(i18n)
app.config.globalProperties.$t = t
app.use(createPinia())
app.use(router)
app.mount('#app')
