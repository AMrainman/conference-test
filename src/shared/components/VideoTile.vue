<script setup lang="ts">
import { MicrophoneIcon } from '@heroicons/vue/24/solid'
import Avatar from './Avatar.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

interface Props {
  name: string
  avatarUrl?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isSpeaking?: boolean
}

withDefaults(defineProps<Props>(), {
  isMuted: false,
  isVideoOff: false,
  isSpeaking: false,
})
</script>

<template>
  <div
    class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-video-background"
    :class="isSpeaking && 'ring-2 ring-primary'"
  >
    <!-- 视频占位：后续通过 WebRTC srcObject 绑定真实媒体流 -->
    <video v-if="!isVideoOff" class="h-full w-full object-cover" autoplay muted playsinline />
    <Avatar v-else :name="name" :src="avatarUrl" size="lg" />

    <div class="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-overlay/50 px-2 py-1 text-xs text-text">
      <span>{{ name }}</span>
      <component :is="isMuted ? MicrophoneSlashIcon : MicrophoneIcon" class="h-3 w-3" />
    </div>
  </div>
</template>
