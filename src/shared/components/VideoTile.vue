<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MicrophoneIcon } from '@heroicons/vue/24/solid'

import type { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng'
import Avatar from './Avatar.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

interface Props {
  name: string
  avatarUrl?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isSpeaking?: boolean
  videoTrack?: ILocalVideoTrack | IRemoteVideoTrack
}

const props = withDefaults(defineProps<Props>(), {
  isMuted: false,
  isVideoOff: false,
  isSpeaking: false,
})

const videoRef = ref<HTMLVideoElement | null>(null)
const currentTrack = ref<ILocalVideoTrack | IRemoteVideoTrack | null>(null)

const showAvatar = computed(() => props.isVideoOff || !props.videoTrack)

function playTrack(track: ILocalVideoTrack | IRemoteVideoTrack | undefined) {
  const el = videoRef.value
  if (!el || !track || props.isVideoOff) {
    currentTrack.value?.stop()
    currentTrack.value = null
    return
  }
  currentTrack.value?.stop()
  currentTrack.value = track
  track.play(el)
}

onMounted(() => playTrack(props.videoTrack))
onBeforeUnmount(() => {
  currentTrack.value?.stop()
  currentTrack.value = null
})

watch(
  () => props.videoTrack,
  track => playTrack(track)
)
</script>

<template>
  <div
    class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-video-background"
    :class="isSpeaking && 'ring-2 ring-primary'"
  >
    <video v-show="!showAvatar" ref="videoRef" class="h-full w-full object-cover" autoplay muted playsinline />
    <Avatar v-if="showAvatar" :name="name" :src="avatarUrl" size="lg" />

    <div class="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-overlay/50 px-2 py-1 text-xs text-text">
      <span>{{ name }}</span>
      <component :is="isMuted ? MicrophoneSlashIcon : MicrophoneIcon" class="h-3 w-3" />
    </div>

    <slot />
  </div>
</template>
