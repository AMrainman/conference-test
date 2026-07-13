<script setup lang="ts">
import { formatBitrate } from '../utils/formatBitrate'
import type { RemoteStats } from '../types'

interface Props {
  stats?: RemoteStats
}

defineProps<Props>()
</script>

<template>
  <div
    v-if="stats"
    class="absolute bottom-2 right-2 rounded bg-overlay/70 px-2 py-1 text-[10px] leading-tight text-text"
  >
    <div>下行 {{ formatBitrate(stats.videoReceiveBitrate + stats.audioReceiveBitrate) }}</div>
    <div v-if="stats.videoReceiveResolutionWidth && stats.videoReceiveFrameRate != null">
      {{ stats.videoReceiveResolutionWidth }}x{{ stats.videoReceiveResolutionHeight }} @
      {{ stats.videoReceiveFrameRate }}fps
    </div>
  </div>
</template>
