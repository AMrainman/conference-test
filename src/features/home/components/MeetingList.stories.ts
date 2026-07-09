import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse } from 'msw'
import MeetingList from './MeetingList.vue'

const meta: Meta<typeof MeetingList> = {
  component: MeetingList,
  title: 'Features/Home/MeetingList',
}

export default meta
type Story = StoryObj<typeof MeetingList>

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/meetings', () => {
          return HttpResponse.json({
            data: [
              {
                id: '111-222-333',
                title: '产品周会',
                hostId: 'u1',
                startTime: '2024-01-01T10:00:00.000Z',
                status: 'live',
              },
              {
                id: '444-555-666',
                title: '技术评审',
                hostId: 'u2',
                startTime: '2024-01-02T14:00:00.000Z',
                status: 'live',
              },
            ],
          })
        }),
      ],
    },
  },
}
