import { createApp } from 'vue'
import App from './App.vue'
import '@/shared/styles/tailwind.css'

async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('@/mocks/browser')
  await worker.start()
}

enableMocking().then(() => {
  const app = createApp(App)
  app.mount('#app')
})
