import type { Meta, StoryObj } from '@storybook/vue3'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggle from './ThemeToggle.vue'

const meta: Meta<typeof ThemeToggle> = {
  component: ThemeToggle,
  title: 'Shared/ThemeToggle',
  decorators: [
    story => ({
      components: { story },
      setup() {
        setActivePinia(createPinia())
        return {}
      },
      template: '<story />',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const Default: Story = {}
