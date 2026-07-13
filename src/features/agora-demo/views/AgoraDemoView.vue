<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MeetingHeader from '@/shared/components/MeetingHeader.vue'
import MeetingToolbar from '@/features/meeting-room/components/MeetingToolbar.vue'
import VideoGrid from '@/features/meeting-room/components/VideoGrid.vue'
import { useAgoraChannel } from '../composables/useAgoraChannel'
import { useAgoraBeautyEffect } from '../composables/useAgoraBeautyEffect'
import { useAgoraVirtualBackground } from '../composables/useAgoraVirtualBackground'
import RemoteVideoStats from '../components/RemoteVideoStats.vue'
import { formatBitrate } from '../utils/formatBitrate'

const route = useRoute()
const router = useRouter()

const channelId = computed(() => {
  const raw = route.params.channelId
  return Array.isArray(raw) ? raw[0] : (raw ?? '')
})

const {
  localUser,
  remoteUsers,
  remoteStats,
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

const {
  beautyLevel,
  setBeautyLevel,
  processor: beautyProcessor,
  applyOptions: applyBeautyOptions,
  cleanup: cleanupBeautyProcessor,
} = useAgoraBeautyEffect()

const {
  blurLevel,
  setBlurLevel,
  processor: blurProcessor,
  applyOptions: applyBlurOptions,
  isSupported: isBlurSupported,
  cleanup: cleanupBlurProcessor,
} = useAgoraVirtualBackground()

// pipeline 组装过程中产生的错误；与扩展自身错误分开，避免互相覆盖。
const pipelineError = ref<string | null>(null)

// 汇总扩展兼容性错误、扩展内部错误以及 pipeline 组装错误，统一显示在界面上。
const effectError = computed(() => {
  if (!isBlurSupported) return '当前浏览器不支持背景模糊'
  return pipelineError.value || null
})

/**
 * 统一组装美颜和背景模糊的视频处理链。
 *
 * 声网每个扩展都通过 processor 注入 SDK 的媒体处理管线；当多个扩展同时启用时，
 * 需要按顺序 pipe。这里选择美颜在前、背景模糊在后，避免背景模糊把美颜细节再次虚化。
 *
 * enable 必须在 pipe 之后调用，processor 才开始实际处理帧。
 * 虚拟背景扩展依赖 WASM 资源，必须在 pipe 之前完成初始化。
 */
const isAssemblingPipeline = ref(false)
const isBlurProcessorInitialized = ref(false)

async function assemblePipeline() {
  const track = localVideoTrack.value
  if (!track || isAssemblingPipeline.value) return

  const expectedBeauty = beautyLevel.value
  const expectedBlur = blurLevel.value
  const enableBeauty = expectedBeauty !== 'off'
  const enableBlur = expectedBlur !== 'off'

  // 先解绑当前处理链，避免旧 processor 与新轨道产生冲突。
  track.unpipe()

  if (!enableBeauty && !enableBlur) {
    // 两个效果都关闭时，显式禁用 processor 以释放 GPU/CPU 资源。
    await Promise.all([cleanupBeautyProcessor(), cleanupBlurProcessor()])
    return
  }

  isAssemblingPipeline.value = true
  try {
    if (enableBeauty) {
      applyBeautyOptions()
    }
    if (enableBlur) {
      // 虚拟背景扩展依赖 WASM 资源，必须在 pipe 之前完成初始化；
      // 新轨道绑定时需要重新 init，因此由 localVideoTrack watch 重置该标志。
      if (!isBlurProcessorInitialized.value) {
        const wasmDir = `${import.meta.env.BASE_URL}assets/wasms`.replace(/\/+$/, '')
        await blurProcessor.init(wasmDir)
        isBlurProcessorInitialized.value = true
      }
      applyBlurOptions()
    }

    if (enableBeauty && enableBlur) {
      track.pipe(beautyProcessor).pipe(blurProcessor).pipe(track.processorDestination)
    } else if (enableBeauty) {
      track.pipe(beautyProcessor).pipe(track.processorDestination)
    } else {
      track.pipe(blurProcessor).pipe(track.processorDestination)
    }

    if (enableBeauty && !beautyProcessor.enabled) {
      await beautyProcessor.enable()
    }
    if (enableBlur && !blurProcessor.enabled) {
      await blurProcessor.enable()
    }
  } catch (err) {
    pipelineError.value = err instanceof Error ? err.message : '视频效果开启失败'
  } finally {
    isAssemblingPipeline.value = false
    // 组装期间用户如果切换了档位，需要再组装一次以保证 UI 与真实状态一致。
    if (beautyLevel.value !== expectedBeauty || blurLevel.value !== expectedBlur) {
      void assemblePipeline()
    }
  }
}

// 视频轨道变化时必须先解绑旧 track 上的 processor，再组装新 pipeline。
watch(localVideoTrack, (newTrack, oldTrack) => {
  oldTrack?.unpipe()
  // 新轨道需要重新初始化虚拟背景扩展。
  if (newTrack) {
    isBlurProcessorInitialized.value = false
  }
  void assemblePipeline()
})

// 档位变化时，仅在开关状态跨越 off/on 边界时重新组装；否则只更新参数。
watch([beautyLevel, blurLevel], ([newBeauty, newBlur], [oldBeauty, oldBlur]) => {
  const beautyEnabled = newBeauty !== 'off'
  const blurEnabled = newBlur !== 'off'
  const beautyWasEnabled = oldBeauty !== 'off'
  const blurWasEnabled = oldBlur !== 'off'

  if (beautyEnabled !== beautyWasEnabled || blurEnabled !== blurWasEnabled) {
    void assemblePipeline()
    return
  }

  if (beautyEnabled) applyBeautyOptions()
  if (blurEnabled) applyBlurOptions()
})

onMounted(() => {
  if (channelId.value) {
    void join()
  }
})

watch(
  channelId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await leave()
      await join()
    }
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  localVideoTrack.value?.unpipe()
  void cleanupBeautyProcessor()
  void cleanupBlurProcessor()
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
  if (level <= 3) return 'bg-warning'
  return 'bg-danger'
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
        <span class="text-text-muted">|</span>
        <span>下行 {{ qualityText(networkQuality.downlink) }}</span>
      </div>
    </MeetingHeader>

    <div v-if="error" class="mx-4 mt-4 rounded-lg bg-danger-subtle px-4 py-3 text-sm text-danger-text">
      {{ error }}
      <button type="button" class="ml-2 font-medium underline" @click="join">重试</button>
    </div>

    <div v-else-if="effectError" class="mx-4 mt-4 rounded-lg bg-warning-subtle px-4 py-3 text-sm text-warning-text">
      {{ effectError }}
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
      >
        <template #remoteTile="{ user }">
          <RemoteVideoStats :stats="remoteStats[String(user.uid)]" />
        </template>
      </VideoGrid>

      <div
        v-if="localStats"
        class="flex items-center justify-center gap-4 bg-surface px-4 py-1 text-xs text-text-secondary"
      >
        <span>上行视频 {{ formatBitrate(localStats.videoSendBitrate) }}</span>
        <span>上行音频 {{ formatBitrate(localStats.audioSendBitrate) }}</span>
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
        :beauty-level="beautyLevel"
        :blur-level="blurLevel"
        @toggle-mic="toggleMic"
        @toggle-video="toggleCamera"
        @leave="handleLeave"
        @update:beauty-level="setBeautyLevel"
        @update:blur-level="setBlurLevel"
      />
    </main>
  </div>
</template>
