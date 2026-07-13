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
