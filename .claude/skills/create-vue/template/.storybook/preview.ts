import type { Preview } from '@storybook/vue3'
import { setupWorker } from 'msw/browser'
import { handlers } from '../src/mocks/handlers'
import '../src/shared/styles/tailwind.css'

const worker = setupWorker(...handlers)
await worker.start()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
