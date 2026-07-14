import type { Meta, StoryObj } from '@storybook/vue3'
import type { Participant } from '@/shared/types'
import VideoGrid from './VideoGrid.vue'

const meta: Meta<typeof VideoGrid> = {
  component: VideoGrid,
  title: 'Features/MeetingRoom/VideoGrid',
}

export default meta
type Story = StoryObj<typeof VideoGrid>

function createParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `u${i + 1}`,
    displayName: `用户 ${i + 1}`,
    isHost: i === 0,
    isMuted: i % 2 === 1,
    isVideoOff: i % 3 === 2,
  }))
}

export const OneParticipant: Story = {
  args: {
    participants: createParticipants(1),
  },
}

export const TwoParticipants: Story = {
  args: {
    participants: createParticipants(2),
  },
}

export const FourParticipants: Story = {
  args: {
    participants: createParticipants(4),
  },
}

export const FiveParticipants: Story = {
  args: {
    participants: createParticipants(5),
  },
}

export const SevenParticipants: Story = {
  args: {
    participants: createParticipants(7),
  },
}

export const NineParticipants: Story = {
  args: {
    participants: createParticipants(9),
  },
}

export const TenParticipants: Story = {
  args: {
    participants: createParticipants(10),
  },
}
