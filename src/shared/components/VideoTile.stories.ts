import type { Meta, StoryObj } from '@storybook/vue3'
import VideoTile from './VideoTile.vue'

const meta: Meta<typeof VideoTile> = {
  component: VideoTile,
  title: 'Shared/VideoTile',
}

export default meta
type Story = StoryObj<typeof VideoTile>

export const CameraOn: Story = {
  args: {
    name: '张三',
    isMuted: false,
    isVideoOff: false,
  },
}

export const CameraOff: Story = {
  args: {
    name: '李四',
    isMuted: true,
    isVideoOff: true,
  },
}

export const Speaking: Story = {
  args: {
    name: '王五',
    isSpeaking: true,
  },
}
