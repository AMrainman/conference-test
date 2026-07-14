<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ICameraVideoTrack } from 'agora-rtc-sdk-ng'
import VideoTile from '@/shared/components/VideoTile.vue'
import type { Participant } from '@/shared/types'
import type { AgoraRemoteUser } from '@/features/agora-demo/types'

interface Props {
  participants?: Participant[]
  remoteUsers?: AgoraRemoteUser[]
  localVideoTrack?: ICameraVideoTrack
  localUser?: { uid: string | number; displayName: string }
  isLocalVideoOff?: boolean
  isLocalMuted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  participants: () => [],
  remoteUsers: () => [],
  isLocalVideoOff: false,
  isLocalMuted: false,
})

const MOBILE_BREAKPOINT = 768
const MOBILE_MAX_TILES = 9

const gridRef = ref<HTMLDivElement | null>(null)
const isNarrow = ref(false)

function updateNarrow() {
  if (!gridRef.value) return
  isNarrow.value = gridRef.value.clientWidth < MOBILE_BREAKPOINT
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !gridRef.value) return
  updateNarrow()
  resizeObserver = new ResizeObserver(updateNarrow)
  resizeObserver.observe(gridRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

const maxTileCount = computed(() => (isNarrow.value ? MOBILE_MAX_TILES : Infinity))

const localSlotCount = computed(() => (props.localUser ? 1 : 0))
const maxRemoteCount = computed(() => Math.max(0, maxTileCount.value - localSlotCount.value))
const displayedRemoteUsers = computed(() => props.remoteUsers.slice(0, maxRemoteCount.value))

const remainingParticipantSlots = computed(() => Math.max(0, maxRemoteCount.value - props.remoteUsers.length))
const displayedParticipants = computed(() => props.participants.slice(0, remainingParticipantSlots.value))

const totalTileCount = computed(
  () => localSlotCount.value + displayedRemoteUsers.value.length + displayedParticipants.value.length
)

const gridClass = computed(() => {
  if (totalTileCount.value <= 1) return 'grid-cols-1'
  if (totalTileCount.value <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
})
</script>

<template>
  <div ref="gridRef" class="@container h-full w-full overflow-y-auto p-4">
    <div
      class="video-grid grid h-full gap-4 place-content-center @3xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] @3xl:content-start"
      :class="gridClass"
    >
      <!-- 本地视频 -->
      <VideoTile
        v-if="localUser"
        :key="localUser.uid"
        :name="localUser.displayName"
        :is-muted="isLocalMuted"
        :is-video-off="isLocalVideoOff"
        :video-track="localVideoTrack"
      />

      <!-- 远端视频 -->
      <VideoTile
        v-for="user in displayedRemoteUsers"
        :key="user.uid"
        :name="user.displayName"
        :is-muted="!user.hasAudio"
        :is-video-off="!user.hasVideo"
        :video-track="user.videoTrack"
        :audio-track="user.audioTrack"
      >
        <slot name="remoteTile" :user="user" />
      </VideoTile>

      <!-- 原有 participants 回退（兼容旧用法） -->
      <VideoTile
        v-for="participant in displayedParticipants"
        :key="participant.id"
        :name="participant.displayName"
        :avatar-url="participant.avatarUrl"
        :is-muted="participant.isMuted"
        :is-video-off="participant.isVideoOff"
      />
    </div>
  </div>
</template>
