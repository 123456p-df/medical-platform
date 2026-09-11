import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { i18n } from './i18n'
import { inheritSessionFromOpener } from '@/api/client'

inheritSessionFromOpener()

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(router)
app.mount('#app')
