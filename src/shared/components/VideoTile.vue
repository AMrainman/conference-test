<script setup lang="ts">
import { MicrophoneIcon, SpeakerXMarkIcon } from '@heroicons/vue/24/solid'
import Avatar from './Avatar.vue'

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
    class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800"
    :class="isSpeaking && 'ring-2 ring-primary-500'"
  >
    <video v-if="!isVideoOff" class="h-full w-full object-cover" autoplay muted playsinline />
    <Avatar v-else :name="name" :src="avatarUrl" size="lg" />

    <div class="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-xs text-white">
      <span>{{ name }}</span>
      <component :is="isMuted ? SpeakerXMarkIcon : MicrophoneIcon" class="h-3 w-3" />
    </div>
  </div>
</template>
