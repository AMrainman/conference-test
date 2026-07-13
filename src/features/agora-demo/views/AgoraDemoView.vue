<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MeetingHeader from '@/shared/components/MeetingHeader.vue'
import MeetingToolbar from '@/features/meeting-room/components/MeetingToolbar.vue'
import VideoGrid from '@/features/meeting-room/components/VideoGrid.vue'
import { useAgoraChannel } from '../composables/useAgoraChannel'

const route = useRoute()
const router = useRouter()

const channelId = computed(() => {
  const raw = route.params.channelId
  return Array.isArray(raw) ? raw[0] : (raw ?? '')
})

const {
  localUser,
  remoteUsers,
  localVideoTrack,
  isMuted,
  isVideoOff,
  joined,
  isJoining,
  error,
  localStats,
  networkQuality,
  join,
  leave,
  toggleMic,
  toggleCamera,
} = useAgoraChannel(channelId)

onMounted(() => {
  if (channelId.value) {
    void join()
  }
})

async function handleLeave() {
  await leave()
  await router.replace('/')
}

function qualityText(level: number): string {
  if (level <= 1) return '优'
  if (level <= 2) return '良'
  if (level <= 3) return '一般'
  if (level <= 4) return '差'
  return '极差'
}

function qualityColor(level: number): string {
  if (level <= 1) return 'bg-success'
  if (level <= 2) return 'bg-warning'
  return 'bg-danger'
}

function formatBitrate(bytes: number): string {
  const bits = bytes * 8
  if (bits < 1024) return `${bits}bps`
  if (bits < 1024 * 1024) return `${(bits / 1024).toFixed(1)}Kbps`
  return `${(bits / 1024 / 1024).toFixed(2)}Mbps`
}

async function copyStats() {
  const payload = {
    channelId: channelId.value,
    local: {
      user: localUser.value,
      stats: localStats.value,
      networkQuality: networkQuality.value,
    },
    remoteUsers: remoteUsers.value.map(u => ({
      uid: u.uid,
      displayName: u.displayName,
      hasAudio: u.hasAudio,
      hasVideo: u.hasVideo,
    })),
  }
  try {
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    alert('Stats 已复制到剪贴板')
  } catch {
    alert('复制失败')
  }
}
</script>

<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-background">
    <MeetingHeader title="性能测试" :meeting-id="channelId">
      <div class="flex items-center gap-2 text-sm text-text-secondary">
        <span class="inline-block h-2.5 w-2.5 rounded-full" :class="qualityColor(networkQuality.uplink)" />
        <span>上行 {{ qualityText(networkQuality.uplink) }}</span>
        <span class="text-text-tertiary">|</span>
        <span>下行 {{ qualityText(networkQuality.downlink) }}</span>
      </div>
    </MeetingHeader>

    <div v-if="error" class="mx-4 mt-4 rounded-lg bg-danger-subtle px-4 py-3 text-sm text-danger-text">
      {{ error }}
      <button type="button" class="ml-2 font-medium underline" @click="join">重试</button>
    </div>

    <div v-else-if="isJoining && !joined" class="flex flex-1 items-center justify-center text-text-secondary">
      正在加入频道…
    </div>

    <main class="flex min-h-0 flex-1 flex-col">
      <VideoGrid
        :local-user="localUser ?? undefined"
        :local-video-track="localVideoTrack ?? undefined"
        :remote-users="remoteUsers"
        :is-local-video-off="isVideoOff"
        :is-local-muted="isMuted"
        class="flex-1"
      />

      <div
        v-if="localStats"
        class="flex items-center justify-center gap-4 bg-surface px-4 py-1 text-xs text-text-secondary"
      >
        <span>上行视频 {{ formatBitrate(localStats.videoSendBytes) }}</span>
        <span>上行音频 {{ formatBitrate(localStats.audioSendBytes) }}</span>
        <span v-if="localStats.videoSendFrameRate">{{ localStats.videoSendFrameRate }}fps</span>
        <span v-if="localStats.videoSendResolutionWidth">
          {{ localStats.videoSendResolutionWidth }}x{{ localStats.videoSendResolutionHeight }}
        </span>
        <button type="button" class="rounded px-2 py-0.5 hover:bg-surface-secondary" @click="copyStats">
          复制 Stats
        </button>
      </div>

      <MeetingToolbar
        :mic-on="!isMuted"
        :video-on="!isVideoOff"
        @toggle-mic="toggleMic"
        @toggle-video="toggleCamera"
        @leave="handleLeave"
      />
    </main>
  </div>
</template>
