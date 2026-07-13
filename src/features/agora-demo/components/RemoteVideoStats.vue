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
      {{ stats.videoReceiveResolutionWidth }}x{{ stats.videoReceiveResolutionHeight }} @
      {{ stats.videoReceiveFrameRate }}fps
    </div>
  </div>
</template>
