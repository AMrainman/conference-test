<script setup lang="ts">
import type { RemoteStats } from '../types'

interface Props {
  stats?: RemoteStats
}

defineProps<Props>()

function formatBitrate(bps: number): string {
  if (bps < 1000) return `${bps}bps`
  if (bps < 1000 * 1000) return `${(bps / 1000).toFixed(1)}Kbps`
  return `${(bps / 1000 / 1000).toFixed(2)}Mbps`
}
</script>

<template>
  <div
    v-if="stats"
    class="absolute bottom-2 right-2 rounded bg-overlay/70 px-2 py-1 text-[10px] leading-tight text-text"
  >
    <div>下行 {{ formatBitrate(stats.videoReceiveBitrate + stats.audioReceiveBitrate) }}</div>
    <div v-if="stats.videoReceiveResolutionWidth">
      {{ stats.videoReceiveResolutionWidth }}x{{ stats.videoReceiveResolutionHeight }} @
      {{ stats.videoReceiveFrameRate }}fps
    </div>
  </div>
</template>
