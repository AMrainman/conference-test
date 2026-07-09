import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useThemeStore } from '@/shared/stores/themeStore'
import '@/shared/styles/tailwind.css'

async function enableMocking() {
  if (!import.meta.env.DEV) {
    return
  }

  const { worker } = await import('@/mocks/browser')
  await worker.start()
}

async function bootstrap() {
  await enableMocking()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const themeStore = useThemeStore()
  themeStore.initTheme()

  app.mount('#app')
}

bootstrap().catch((_err) => {
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.textContent = '应用启动失败，请刷新页面重试'
  }
})
