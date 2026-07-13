# 声网多人视频性能测试 Demo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有会议系统骨架上实现一个无需登录、打开链接自动入会、可开关音视频、并实时展示性能指标的声网多人视频测试 Demo。

**Architecture:** 新增独立功能域 `src/features/agora-demo/`，通过 `useAgoraChannel` composable 封装声网 Web SDK 的客户端、轨道、订阅、stats 轮询和错误处理；复用现有 `MeetingHeader`、`VideoGrid`、`MeetingToolbar` 组件并做最小扩展；新增 `/demo/:channelId` 路由承载 demo 页面。

**Tech Stack:** Vue 3 + TypeScript + Pinia + Vite + Tailwind CSS + agora-rtc-sdk-ng

---

## 文件清单

### 新增文件
- `src/features/agora-demo/config.ts` — 声网 AppID/Token 配置
- `src/features/agora-demo/composables/useAgoraChannel.ts` — 声网频道状态与操作
- `src/features/agora-demo/views/AgoraDemoView.vue` — Demo 页面
- `src/features/agora-demo/types.ts` — Demo 相关类型

### 修改文件
- `package.json` — 新增 `agora-rtc-sdk-ng` 依赖
- `src/app/router.ts` — 新增 `/demo/:channelId` 路由
- `src/shared/components/VideoTile.vue` — 支持真实 video track 播放
- `src/features/meeting-room/components/VideoGrid.vue` — 支持远端用户列表和本地视频

---

## Task 1: 安装声网 SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

运行：
```bash
npm install agora-rtc-sdk-ng
```

- [ ] **Step 2: 验证安装**

运行：
```bash
npm ls agora-rtc-sdk-ng
```

预期输出包含 `agora-rtc-sdk-ng@` 版本号。

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
npm ls agora-rtc-sdk-ng > /tmp/sdk-version.txt
git commit -m "chore: 安装 agora-rtc-sdk-ng 依赖"
```

---

## Task 2: 创建声网配置

**Files:**
- Create: `src/features/agora-demo/config.ts`

- [ ] **Step 1: 写入配置常量**

创建 `src/features/agora-demo/config.ts`：

```ts
/**
 * 声网性能测试 Demo 配置
 * 测试阶段直接写死，生产环境应改为后端签发 Token 或环境变量注入。
 */
export const AGORA_APP_ID = '你的 AppID'

// 无证书项目填 null；有证书项目填临时 Token
export const AGORA_TOKEN: string | null = null
```

- [ ] **Step 2: 提交**

```bash
git add src/features/agora-demo/config.ts
git commit -m "feat(agora-demo): 添加声网 AppID/Token 配置"
```

---

## Task 3: 创建 Demo 类型定义

**Files:**
- Create: `src/features/agora-demo/types.ts`

- [ ] **Step 1: 写入类型**

创建 `src/features/agora-demo/types.ts`：

```ts
import type { IRemoteVideoTrack, IRemoteAudioTrack, UID } from 'agora-rtc-sdk-ng'

export interface AgoraLocalUser {
  uid: UID
  displayName: string
}

export interface AgoraRemoteUser {
  uid: UID
  displayName: string
  videoTrack?: IRemoteVideoTrack
  audioTrack?: IRemoteAudioTrack
  hasVideo: boolean
  hasAudio: boolean
}

export interface LocalStats {
  audioSendBytes: number
  audioSendPackets: number
  audioSendPacketsLost: number
  videoSendBytes: number
  videoSendPackets: number
  videoSendPacketsLost: number
  videoSendFrameRate?: number
  videoSendResolutionWidth?: number
  videoSendResolutionHeight?: number
}

export interface RemoteStats {
  uid: UID
  audioReceiveBytes: number
  audioReceivePackets: number
  audioReceivePacketsLost: number
  videoReceiveBytes: number
  videoReceivePackets: number
  videoReceivePacketsLost: number
  videoReceiveFrameRate?: number
  videoReceiveResolutionWidth?: number
  videoReceiveResolutionHeight?: number
}

export interface NetworkQualitySnapshot {
  uplink: number
  downlink: number
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/agora-demo/types.ts
git commit -m "feat(agora-demo): 添加声网 Demo 类型定义"
```

---

## Task 4: 实现 useAgoraChannel Composable

**Files:**
- Create: `src/features/agora-demo/composables/useAgoraChannel.ts`

- [ ] **Step 1: 写入 composable 实现**

创建 `src/features/agora-demo/composables/useAgoraChannel.ts`：

```ts
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
  type UID,
} from 'agora-rtc-sdk-ng'

import { AGORA_APP_ID, AGORA_TOKEN } from '../config'
import type { AgoraLocalUser, AgoraRemoteUser, LocalStats, NetworkQualitySnapshot, RemoteStats } from '../types'

const STATS_INTERVAL = 2000

function generateDisplayName(): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `用户 ${suffix}`
}

function useStats(client: IAgoraRTCClient | null) {
  const localStats = ref<LocalStats | null>(null)
  const remoteStats = ref<Record<string, RemoteStats>>({})
  const networkQuality = ref<NetworkQualitySnapshot>({ uplink: 0, downlink: 0 })

  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (!client || timer) return

    timer = setInterval(() => {
      if (!client) return

      const localAudio = client.getLocalAudioStats()
      const localVideo = client.getLocalVideoStats()
      const remoteAudio = client.getRemoteAudioStats()
      const remoteVideo = client.getRemoteVideoStats()
      const rtcStats = client.getRTCStats()
      const quality = client.getNetworkQuality()

      // 取第一个本地音频/视频轨道 stats（单主播场景）
      const audioTrackStats = Object.values(localAudio)[0]
      const videoTrackStats = Object.values(localVideo)[0]

      localStats.value = {
        audioSendBytes: audioTrackStats?.sendBytes ?? 0,
        audioSendPackets: audioTrackStats?.sendPackets ?? 0,
        audioSendPacketsLost: audioTrackStats?.sendPacketsLost ?? 0,
        videoSendBytes: videoTrackStats?.sendBytes ?? 0,
        videoSendPackets: videoTrackStats?.sendPackets ?? 0,
        videoSendPacketsLost: videoTrackStats?.sendPacketsLost ?? 0,
        videoSendFrameRate: videoTrackStats?.sendFrameRate,
        videoSendResolutionWidth: videoTrackStats?.sendResolutionWidth,
        videoSendResolutionHeight: videoTrackStats?.sendResolutionHeight,
      }

      networkQuality.value = {
        uplink: quality.uplinkNetworkQuality,
        downlink: quality.downlinkNetworkQuality,
      }

      const nextRemoteStats: Record<string, RemoteStats> = {}
      for (const [uid, audio] of Object.entries(remoteAudio)) {
        const video = remoteVideo[uid]
        nextRemoteStats[uid] = {
          uid,
          audioReceiveBytes: audio.receiveBytes ?? 0,
          audioReceivePackets: audio.receivePackets ?? 0,
          audioReceivePacketsLost: audio.receivePacketsLost ?? 0,
          videoReceiveBytes: video?.receiveBytes ?? 0,
          videoReceivePackets: video?.receivePackets ?? 0,
          videoReceivePacketsLost: video?.receivePacketsLost ?? 0,
          videoReceiveFrameRate: video?.receiveFrameRate,
          videoReceiveResolutionWidth: video?.receiveResolutionWidth,
          videoReceiveResolutionHeight: video?.receiveResolutionHeight,
        }
      }
      remoteStats.value = nextRemoteStats
    }, STATS_INTERVAL)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return { localStats, remoteStats, networkQuality, start, stop }
}

export function useAgoraChannel(channelId: Ref<string>) {
  const client = ref<IAgoraRTCClient | null>(null)
  const localAudioTrack = ref<IMicrophoneAudioTrack | null>(null)
  const localVideoTrack = ref<ICameraVideoTrack | null>(null)
  const localUser = ref<AgoraLocalUser | null>(null)
  const remoteUsers = ref<AgoraRemoteUser[]>([])
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const joined = ref(false)
  const error = ref<string | null>(null)
  const isJoining = ref(false)

  const { localStats, remoteStats, networkQuality, start: startStats, stop: stopStats } = useStats(client.value)

  async function join() {
    if (isJoining.value || joined.value) return
    isJoining.value = true
    error.value = null

    try {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      client.value = agoraClient

      const uid = await agoraClient.join(AGORA_APP_ID, channelId.value, AGORA_TOKEN, null)
      localUser.value = { uid, displayName: generateDisplayName() }

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      localAudioTrack.value = audioTrack
      localVideoTrack.value = videoTrack

      await agoraClient.publish([audioTrack, videoTrack])
      joined.value = true

      agoraClient.on('user-published', handleUserPublished)
      agoraClient.on('user-unpublished', handleUserUnpublished)
      agoraClient.on('user-left', handleUserLeft)

      startStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加入频道失败'
      await cleanup()
    } finally {
      isJoining.value = false
    }
  }

  async function handleUserPublished(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') {
    if (!client.value) return
    await client.value.subscribe(user, mediaType)

    let remoteUser = remoteUsers.value.find((u) => u.uid === user.uid)
    if (!remoteUser) {
      remoteUser = {
        uid: user.uid,
        displayName: `用户 ${String(user.uid).slice(-4)}`,
        hasVideo: false,
        hasAudio: false,
      }
      remoteUsers.value.push(remoteUser)
    }

    if (mediaType === 'video') {
      remoteUser.videoTrack = user.videoTrack
      remoteUser.hasVideo = true
    } else {
      remoteUser.audioTrack = user.audioTrack
      remoteUser.hasAudio = true
    }
  }

  function handleUserUnpublished(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') {
    const remoteUser = remoteUsers.value.find((u) => u.uid === user.uid)
    if (!remoteUser) return

    if (mediaType === 'video') {
      remoteUser.videoTrack = undefined
      remoteUser.hasVideo = false
    } else {
      remoteUser.audioTrack = undefined
      remoteUser.hasAudio = false
    }
  }

  function handleUserLeft(user: IAgoraRTCRemoteUser) {
    remoteUsers.value = remoteUsers.value.filter((u) => u.uid !== user.uid)
  }

  function toggleMic() {
    if (!localAudioTrack.value) return
    isMuted.value = !isMuted.value
    localAudioTrack.value.setMuted(isMuted.value)
  }

  function toggleCamera() {
    if (!localVideoTrack.value) return
    isVideoOff.value = !isVideoOff.value
    localVideoTrack.value.setMuted(isVideoOff.value)
  }

  async function leave() {
    await cleanup()
  }

  async function cleanup() {
    stopStats()

    if (client.value) {
      client.value.off('user-published', handleUserPublished)
      client.value.off('user-unpublished', handleUserUnpublished)
      client.value.off('user-left', handleUserLeft)

      localAudioTrack.value?.close()
      localVideoTrack.value?.close()
      localAudioTrack.value = null
      localVideoTrack.value = null

      await client.value.leave()
      client.value = null
    }

    joined.value = false
    remoteUsers.value = []
    localUser.value = null
    isMuted.value = false
    isVideoOff.value = false
  }

  onMounted(() => {
    window.addEventListener('beforeunload', cleanup)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', cleanup)
    cleanup()
  })

  return {
    client,
    localAudioTrack,
    localVideoTrack,
    localUser,
    remoteUsers,
    isMuted,
    isVideoOff,
    joined,
    isJoining,
    error,
    localStats,
    remoteStats,
    networkQuality,
    join,
    leave,
    toggleMic,
    toggleCamera,
  }
}
```

- [ ] **Step 2: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误（此时 config.ts 里的 AppID 还是占位字符串，不影响类型检查）。

- [ ] **Step 3: 提交**

```bash
git add src/features/agora-demo/composables/useAgoraChannel.ts
git commit -m "feat(agora-demo): 实现声网频道状态管理 composable"
```

---

## Task 5: 扩展 VideoTile 支持真实视频轨道

**Files:**
- Modify: `src/shared/components/VideoTile.vue`

- [ ] **Step 1: 修改组件代码**

完整替换 `src/shared/components/VideoTile.vue` 为：

```vue
<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'
import { MicrophoneIcon } from '@heroicons/vue/24/solid'

import type { IVideoTrack } from 'agora-rtc-sdk-ng'
import Avatar from './Avatar.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

interface Props {
  name: string
  avatarUrl?: string
  isMuted?: boolean
  isVideoOff?: boolean
  isSpeaking?: boolean
  videoTrack?: IVideoTrack
}

const props = withDefaults(defineProps<Props>(), {
  isMuted: false,
  isVideoOff: false,
  isSpeaking: false,
})

const videoRef = ref<HTMLVideoElement | null>(null)

const showAvatar = computed(() => props.isVideoOff || !props.videoTrack)

function playTrack() {
  const el = videoRef.value
  const track = props.videoTrack
  if (!el || !track || props.isVideoOff) return
  track.play(el)
}

onMounted(playTrack)
onUpdated(playTrack)
</script>

<template>
  <div
    class="@container relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-video-background"
    :class="isSpeaking && 'ring-2 ring-primary'"
  >
    <video
      v-show="!showAvatar"
      ref="videoRef"
      class="h-full w-full object-cover"
      autoplay
      muted
      playsinline
    />
    <Avatar v-if="showAvatar" :name="name" :src="avatarUrl" size="lg" />

    <div class="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-overlay/50 px-2 py-1 text-xs text-text">
      <span>{{ name }}</span>
      <component :is="isMuted ? MicrophoneSlashIcon : MicrophoneIcon" class="h-3 w-3" />
    </div>

    <slot />
  </div>
</template>
```

- [ ] **Step 2: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/shared/components/VideoTile.vue
git commit -m "feat(VideoTile): 支持绑定真实声网视频轨道"
```

---

## Task 6: 扩展 VideoGrid 支持本地和远端视频

**Files:**
- Modify: `src/features/meeting-room/components/VideoGrid.vue`

- [ ] **Step 1: 修改组件代码**

完整替换 `src/features/meeting-room/components/VideoGrid.vue` 为：

```vue
<script setup lang="ts">
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

withDefaults(defineProps<Props>(), {
  participants: () => [],
  remoteUsers: () => [],
  isLocalVideoOff: false,
  isLocalMuted: false,
})
</script>

<template>
  <div class="@container h-full w-full overflow-y-auto p-4">
    <div class="grid grid-cols-1 gap-4 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @2xl:grid-cols-5">
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
        v-for="user in remoteUsers"
        :key="user.uid"
        :name="user.displayName"
        :is-muted="!user.hasAudio"
        :is-video-off="!user.hasVideo"
        :video-track="user.videoTrack"
      />

      <!-- 原有 participants 回退（兼容旧用法） -->
      <VideoTile
        v-for="participant in participants"
        :key="participant.id"
        :name="participant.displayName"
        :avatar-url="participant.avatarUrl"
        :is-muted="participant.isMuted"
        :is-video-off="participant.isVideoOff"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 2: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/features/meeting-room/components/VideoGrid.vue
git commit -m "feat(VideoGrid): 支持本地和远端声网用户视频渲染"
```

---

## Task 7: 创建 AgoraDemoView 页面

**Files:**
- Create: `src/features/agora-demo/views/AgoraDemoView.vue`

- [ ] **Step 1: 写入页面组件**

创建 `src/features/agora-demo/views/AgoraDemoView.vue`：

```vue
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
  return Array.isArray(raw) ? raw[0] : raw ?? ''
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
    join()
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
    remoteUsers: remoteUsers.value.map((u) => ({
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
        <span
          class="inline-block h-2.5 w-2.5 rounded-full"
          :class="qualityColor(networkQuality.uplink)"
        />
        <span>上行 {{ qualityText(networkQuality.uplink) }}</span>
        <span class="text-text-tertiary">|</span>
        <span>下行 {{ qualityText(networkQuality.downlink) }}</span>
      </div>
    </MeetingHeader>

    <div
      v-if="error"
      class="mx-4 mt-4 rounded-lg bg-danger-subtle px-4 py-3 text-sm text-danger-text"
    >
      {{ error }}
      <button
        type="button"
        class="ml-2 font-medium underline"
        @click="join"
      >
        重试
      </button>
    </div>

    <div
      v-else-if="isJoining && !joined"
      class="flex flex-1 items-center justify-center text-text-secondary"
    >
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
        <button
          type="button"
          class="rounded px-2 py-0.5 hover:bg-surface-secondary"
          @click="copyStats"
        >
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
```

- [ ] **Step 2: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/features/agora-demo/views/AgoraDemoView.vue
git commit -m "feat(agora-demo): 添加声网性能测试 Demo 页面"
```

---

## Task 8: 注册 Demo 路由

**Files:**
- Modify: `src/app/router.ts`

- [ ] **Step 1: 添加路由**

在 `src/app/router.ts` 的 `routes` 数组中新增一项：

```ts
{
  path: '/demo/:channelId',
  component: () => import('@/features/agora-demo/views/AgoraDemoView.vue'),
},
```

完整文件应类似：

```ts
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/features/home/views/HomeView.vue'),
    },
    {
      path: '/join',
      component: () => import('@/features/join/views/JoinView.vue'),
    },
    {
      path: '/pre-meeting/:meetingId',
      component: () => import('@/features/pre-meeting/views/PreMeetingView.vue'),
    },
    {
      path: '/waiting/:meetingId',
      component: () => import('@/features/waiting-room/views/WaitingRoomView.vue'),
    },
    {
      path: '/meeting/:meetingId',
      component: () => import('@/features/meeting-room/views/MeetingRoomView.vue'),
    },
    {
      path: '/ended/:meetingId',
      component: () => import('@/features/meeting-ended/views/MeetingEndedView.vue'),
    },
    {
      path: '/demo/:channelId',
      component: () => import('@/features/agora-demo/views/AgoraDemoView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/features/home/views/NotFoundView.vue'),
    },
  ],
})
```

- [ ] **Step 2: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/app/router.ts
git commit -m "feat(router): 注册声网性能测试 Demo 路由"
```

---

## Task 9: 远端 VideoTile Stats 覆盖层

**Files:**
- Create: `src/features/agora-demo/components/RemoteVideoStats.vue`
- Modify: `src/features/meeting-room/components/VideoGrid.vue`

- [ ] **Step 1: 创建 RemoteVideoStats 组件**

创建 `src/features/agora-demo/components/RemoteVideoStats.vue`：

```vue
<script setup lang="ts">
import type { RemoteStats } from '../types'

interface Props {
  stats?: RemoteStats
}

defineProps<Props>()

function formatBitrate(bytes: number): string {
  const bits = bytes * 8
  if (bits < 1024) return `${bits}bps`
  if (bits < 1024 * 1024) return `${(bits / 1024).toFixed(1)}Kbps`
  return `${(bits / 1024 / 1024).toFixed(2)}Mbps`
}
</script>

<template>
  <div
    v-if="stats"
    class="absolute bottom-2 right-2 rounded bg-overlay/70 px-2 py-1 text-[10px] leading-tight text-text"
  >
    <div>下行 {{ formatBitrate(stats.videoReceiveBytes + stats.audioReceiveBytes) }}</div>
    <div v-if="stats.videoReceiveResolutionWidth">
      {{ stats.videoReceiveResolutionWidth }}x{{ stats.videoReceiveResolutionHeight }} @ {{ stats.videoReceiveFrameRate }}fps
    </div>
  </div>
</template>
```

- [ ] **Step 2: 修改 VideoGrid 传入 stats**

修改 `src/features/meeting-room/components/VideoGrid.vue`，接收 `remoteStats` 并传给 `RemoteVideoStats`：

```vue
<script setup lang="ts">
import type { ICameraVideoTrack } from 'agora-rtc-sdk-ng'
import VideoTile from '@/shared/components/VideoTile.vue'
import type { Participant } from '@/shared/types'
import type { AgoraRemoteUser, RemoteStats } from '@/features/agora-demo/types'
import RemoteVideoStats from '@/features/agora-demo/components/RemoteVideoStats.vue'

interface Props {
  participants?: Participant[]
  remoteUsers?: AgoraRemoteUser[]
  remoteStats?: Record<string, RemoteStats>
  localVideoTrack?: ICameraVideoTrack
  localUser?: { uid: string | number; displayName: string }
  isLocalVideoOff?: boolean
  isLocalMuted?: boolean
}

withDefaults(defineProps<Props>(), {
  participants: () => [],
  remoteUsers: () => [],
  remoteStats: () => ({}),
  isLocalVideoOff: false,
  isLocalMuted: false,
})
</script>

<template>
  <div class="@container h-full w-full overflow-y-auto p-4">
    <div class="grid grid-cols-1 gap-4 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @2xl:grid-cols-5">
      <VideoTile
        v-if="localUser"
        :key="localUser.uid"
        :name="localUser.displayName"
        :is-muted="isLocalMuted"
        :is-video-off="isLocalVideoOff"
        :video-track="localVideoTrack"
      />

      <VideoTile
        v-for="user in remoteUsers"
        :key="user.uid"
        :name="user.displayName"
        :is-muted="!user.hasAudio"
        :is-video-off="!user.hasVideo"
        :video-track="user.videoTrack"
      >
        <RemoteVideoStats :stats="remoteStats[String(user.uid)]" />
      </VideoTile>

      <VideoTile
        v-for="participant in participants"
        :key="participant.id"
        :name="participant.displayName"
        :avatar-url="participant.avatarUrl"
        :is-muted="participant.isMuted"
        :is-video-off="participant.isVideoOff"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 3: 在 AgoraDemoView 中传入 remoteStats**

修改 `src/features/agora-demo/views/AgoraDemoView.vue` 的 `<VideoGrid>` 调用，新增 `:remote-stats="remoteStats"`：

```vue
<VideoGrid
  :local-user="localUser ?? undefined"
  :local-video-track="localVideoTrack ?? undefined"
  :remote-users="remoteUsers"
  :remote-stats="remoteStats"
  :is-local-video-off="isVideoOff"
  :is-local-muted="isMuted"
  class="flex-1"
/>
```

- [ ] **Step 4: 运行类型检查**

运行：
```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 5: 提交**

```bash
git add src/features/agora-demo/components/RemoteVideoStats.vue src/features/meeting-room/components/VideoGrid.vue src/features/agora-demo/views/AgoraDemoView.vue
git commit -m "feat(agora-demo): 在远端视频格子上叠加性能指标"
```

---

## Task 10: 运行验证与清理

- [ ] **Step 1: 运行类型检查**

```bash
npm run type-check
```

预期：无错误。

- [ ] **Step 2: 运行 Linter**

```bash
npm run lint
```

预期：无错误，或仅存在与本任务无关的已有问题。

- [ ] **Step 3: 运行单元测试**

```bash
npm run test
```

预期：全部通过（本 Demo 以集成测试为主，单元测试覆盖 stats 格式化等纯函数）。

- [ ] **Step 4: 填写真实 AppID/Token**

修改 `src/features/agora-demo/config.ts`，将 `AGORA_APP_ID` 替换为真实值，根据声网项目是否开启证书设置 `AGORA_TOKEN`。

- [ ] **Step 5: 本地启动并手动验证**

```bash
npm run dev
```

打开两个浏览器标签，分别访问：
```text
http://localhost:5173/demo/test-room
```

验证：
- 两个标签都自动弹出摄像头/麦克风权限申请。
- 允许后双方都能看到对方视频。
- 点击麦克风/摄像头按钮能正常开关。
- 页面上显示网络质量和 stats 数据。
- 关闭标签后，另一端的用户消失（无幽灵用户）。

- [ ] **Step 6: 最终提交（如需）**

如果验证后有修改（例如修复 lint 问题），提交：

```bash
git add .
git commit -m "fix(agora-demo): 验证修复"
```

---

## 自我审查

### Spec 覆盖检查

| Spec 要求 | 对应 Task |
|---|---|
| URL 带 channelId | Task 8 |
| 自动打开摄像头/麦克风 | Task 4、Task 7 |
| 自动订阅所有远端流 | Task 4 |
| 可关闭音视频 | Task 4、Task 7 |
| 实时展示性能指标 | Task 4、Task 7、Task 9 |
| 界面参考 MeetingRoomView.vue | Task 7 |
| 随机昵称 | Task 4 |
| 离开清理资源 | Task 4、Task 7 |

### Placeholder 检查

- 无 TBD/TODO。
- `AGORA_APP_ID` 为占位字符串，但这是用户明确要求写死的配置，已在 Task 10 Step 4 说明替换为真实值。
- 所有步骤包含具体代码或命令。

### 类型一致性检查

- `useAgoraChannel` 返回的 `remoteUsers` 类型与 `VideoGrid` 的 `remoteUsers` prop 一致。
- `RemoteStats` 类型在 `types.ts`、composable、`RemoteVideoStats` 中一致。
- `IVideoTrack` 在 `VideoTile` 中作为本地/远端视频的通用类型使用。

---

## 执行方式选择

**Plan complete and saved to `docs/superpowers/plans/2026-07-13-agora-performance-demo-implementation-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
