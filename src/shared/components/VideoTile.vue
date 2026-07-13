<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MicrophoneIcon } from '@heroicons/vue/24/solid'

import type { ILocalVideoTrack, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng'
import Avatar from './Avatar.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

interface Props {
  name: string
  avatarUrl?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isSpeaking?: boolean
  videoTrack?: ILocalVideoTrack | IRemoteVideoTrack
  audioTrack?: IRemoteAudioTrack
}

const props = withDefaults(defineProps<Props>(), {
  isMuted: false,
  isVideoOff: false,
  isSpeaking: false,
})

const videoRef = ref<HTMLVideoElement | null>(null)
const currentVideoTrack = ref<ILocalVideoTrack | IRemoteVideoTrack | null>(null)
const currentAudioTrack = ref<IRemoteAudioTrack | null>(null)

const showAvatar = computed(() => props.isVideoOff || !props.videoTrack)

function playVideoTrack(track: ILocalVideoTrack | IRemoteVideoTrack | undefined) {
  const el = videoRef.value
  if (!el || !track || props.isVideoOff) {
    currentVideoTrack.value?.stop()
    currentVideoTrack.value = null
    return
  }
  currentVideoTrack.value?.stop()
  currentVideoTrack.value = track
  try {
    track.play(el)
  } catch (err) {
    console.error('播放视频轨道失败', err)
  }
}

function playAudioTrack(track: IRemoteAudioTrack | undefined) {
  currentAudioTrack.value?.stop()
  currentAudioTrack.value = null
  if (!track) return
  currentAudioTrack.value = track
  try {
    track.play()
  } catch (err) {
    console.error('播放音频轨道失败', err)
  }
}

onMounted(() => {
  playVideoTrack(props.videoTrack)
  playAudioTrack(props.audioTrack)
})
onBeforeUnmount(() => {
  currentVideoTrack.value?.stop()
  currentVideoTrack.value = null
  currentAudioTrack.value?.stop()
  currentAudioTrack.value = null
})

watch(
  () => props.videoTrack,
  track => playVideoTrack(track)
)
watch(
  () => props.audioTrack,
  track => playAudioTrack(track)
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
