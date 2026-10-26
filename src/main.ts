import { createApp } from 'vue'
import './style.css'
import './assets/css/glass.css'

import App from './App.vue'
import router from './router'
import { createHead } from "@vueuse/head"
import {createPinia} from 'pinia'

const app = createApp(App)

const head = createHead()
const pinia = createPinia()

app.use(head)
app.use(router)
app.use(pinia)
app.mount('#app')

