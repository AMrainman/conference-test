import { onBeforeUnmount, onMounted, ref, shallowRef, type Ref } from 'vue'

import AgoraRTC, {
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng'

import { AGORA_APP_ID, AGORA_TOKEN } from '../config'
import type { AgoraLocalUser, AgoraRemoteUser, LocalStats, NetworkQualitySnapshot, RemoteStats } from '../types'

const STATS_INTERVAL = 2000

function generateDisplayName(): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `用户 ${suffix}`
}

function useStats(clientRef: Ref<IAgoraRTCClient | null>) {
  const localStats = ref<LocalStats | null>(null)
  const remoteStats = ref<Record<string, RemoteStats>>({})
  const networkQuality = ref<NetworkQualitySnapshot>({ uplink: 0, downlink: 0 })

  let timer: ReturnType<typeof setInterval> | null = null

  function start() {
    if (timer) return

    timer = setInterval(() => {
      const client = clientRef.value
      if (!client) return

      const localAudio = client.getLocalAudioStats()
      const localVideo = client.getLocalVideoStats()
      const remoteAudio = client.getRemoteAudioStats()
      const remoteVideo = client.getRemoteVideoStats()
      const quality = client.getNetworkQuality()

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
      const allUids = new Set([
        ...Object.keys(remoteAudio),
        ...Object.keys(remoteVideo),
      ])
      for (const uid of allUids) {
        const audio = remoteAudio[uid]
        const video = remoteVideo[uid]
        nextRemoteStats[uid] = {
          uid,
          audioReceiveBytes: audio?.receiveBytes ?? 0,
          audioReceivePackets: audio?.receivePackets ?? 0,
          audioReceivePacketsLost: audio?.receivePacketsLost ?? 0,
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
  const client = shallowRef<IAgoraRTCClient | null>(null)
  const localAudioTrack = shallowRef<IMicrophoneAudioTrack | null>(null)
  const localVideoTrack = shallowRef<ICameraVideoTrack | null>(null)
  const localUser = ref<AgoraLocalUser | null>(null)
  const remoteUsers = shallowRef<AgoraRemoteUser[]>([])
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  const joined = ref(false)
  const error = ref<string | null>(null)
  const isJoining = ref(false)

  const { localStats, remoteStats, networkQuality, start: startStats, stop: stopStats } = useStats(client)

  async function join() {
    if (isJoining.value || joined.value) return
    isJoining.value = true
    error.value = null

    try {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      client.value = agoraClient

      agoraClient.on('user-published', handleUserPublished)
      agoraClient.on('user-unpublished', handleUserUnpublished)
      agoraClient.on('user-left', handleUserLeft)

      const uid = await agoraClient.join(AGORA_APP_ID, channelId.value, AGORA_TOKEN, null)
      localUser.value = { uid, displayName: generateDisplayName() }

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      localAudioTrack.value = audioTrack
      localVideoTrack.value = videoTrack

      await agoraClient.publish([audioTrack, videoTrack])
      joined.value = true

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

    const existing = remoteUsers.value.find((u) => u.uid === user.uid)
    const base: AgoraRemoteUser = existing ?? {
      uid: user.uid,
      displayName: `用户 ${String(user.uid).slice(-4)}`,
      hasVideo: false,
      hasAudio: false,
    }

    const next: AgoraRemoteUser =
      mediaType === 'video'
        ? { ...base, videoTrack: user.videoTrack, hasVideo: true }
        : { ...base, audioTrack: user.audioTrack, hasAudio: true }

    remoteUsers.value = existing
      ? remoteUsers.value.map((u) => (u.uid === user.uid ? next : u))
      : [...remoteUsers.value, next]
  }

  function handleUserUnpublished(user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') {
    remoteUsers.value = remoteUsers.value.map((u) => {
      if (u.uid !== user.uid) return u
      return mediaType === 'video'
        ? { ...u, videoTrack: undefined, hasVideo: false }
        : { ...u, audioTrack: undefined, hasAudio: false }
    })
  }

  function handleUserLeft(user: IAgoraRTCRemoteUser) {
    remoteUsers.value = remoteUsers.value.filter((u) => u.uid !== user.uid)
  }

  function toggleMic() {
    if (!localAudioTrack.value) return
    isMuted.value = !isMuted.value
    void localAudioTrack.value.setEnabled(!isMuted.value)
  }

  function toggleCamera() {
    if (!localVideoTrack.value) return
    isVideoOff.value = !isVideoOff.value
    void localVideoTrack.value.setEnabled(!isVideoOff.value)
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

      try {
        await client.value.leave()
      } catch {
        // 清理阶段忽略 leave 错误，避免吞掉原始错误
      }
      client.value = null
    }

    joined.value = false
    remoteUsers.value = []
    localUser.value = null
    isMuted.value = false
    isVideoOff.value = false
  }

  function handleBeforeUnload() {
    void cleanup()
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    void cleanup()
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
