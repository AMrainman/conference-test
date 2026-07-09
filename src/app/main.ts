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

bootstrap().catch(err => {
  const message = err instanceof Error ? err.message : String(err)
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.innerHTML = `
      <div style="padding:2rem;text-align:center;font-family:sans-serif">
        <h1 style="color:#dc2626;font-size:1.25rem;margin-bottom:0.5rem">应用启动失败</h1>
        <p style="color:#4b5563;margin-bottom:1rem">请刷新页面重试，如果问题持续存在请检查控制台日志</p>
        <pre style="text-align:left;background:#f3f4f6;padding:1rem;border-radius:0.5rem;overflow:auto;font-size:0.875rem">${message.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)}</pre>
      </div>
    `
  }
})
