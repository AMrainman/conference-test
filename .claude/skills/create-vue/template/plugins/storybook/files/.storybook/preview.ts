import type { Preview } from '@storybook/vue3'
import { onMounted, ref } from 'vue'
import { setupWorker } from 'msw/browser'
import { handlers } from '../src/mocks/handlers'
import '../src/shared/styles/tailwind.css'

const worker = setupWorker(...handlers)
const workerStarted = worker.start({ onUnhandledRequest: 'bypass' })

const preview: Preview = {
  parameters: {
    backgrounds: { disable: true },
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      return {
        components: { story },
        setup() {
          const ready = ref(false)

          onMounted(async () => {
            await workerStarted
            ready.value = true
          })

          return { ready }
        },
        template: `
          <div v-if="ready"><story /></div>
          <div v-else class="p-4 text-text-muted">加载中...</div>
        `,
      }
    },
  ],
}

export default preview
