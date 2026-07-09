<script setup lang="ts">
import VideoTile from '@/shared/components/VideoTile.vue'
import type { Participant } from '@/shared/types'

interface Props {
  participants: Participant[]
}

defineProps<Props>()
</script>

<template>
  <div class="@container h-full w-full overflow-y-auto p-4">
    <div class="grid grid-cols-1 gap-4 @xs:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @2xl:grid-cols-5">
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
