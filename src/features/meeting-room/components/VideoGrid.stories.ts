import type { Meta, StoryObj } from '@storybook/vue3'
import type { Participant } from '@/shared/types'
import VideoGrid from './VideoGrid.vue'

const meta: Meta<typeof VideoGrid> = {
  component: VideoGrid,
  title: 'Features/MeetingRoom/VideoGrid',
}

export default meta
type Story = StoryObj<typeof VideoGrid>

const twoParticipants: Participant[] = [
  { id: 'u1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
  { id: 'u2', displayName: '李四', isHost: false, isMuted: true, isVideoOff: true },
]

const fourParticipants: Participant[] = [
  { id: 'u1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
  { id: 'u2', displayName: '李四', isHost: false, isMuted: true, isVideoOff: true },
  { id: 'u3', displayName: '王五', isHost: false, isMuted: false, isVideoOff: false },
  { id: 'u4', displayName: '赵六', isHost: false, isMuted: false, isVideoOff: true },
]

export const TwoParticipants: Story = {
  args: {
    participants: twoParticipants,
  },
}

export const FourParticipants: Story = {
  args: {
    participants: fourParticipants,
  },
}
