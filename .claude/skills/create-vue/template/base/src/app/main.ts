import { createApp } from 'vue'
import App from './App.vue'
import { initTheme } from '@/shared/stores/themeStore'
import '@/shared/styles/tailwind.css'

initTheme()

const app = createApp(App)
app.mount('#app')
