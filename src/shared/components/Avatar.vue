<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const imgError = ref(false)

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// 仅允许安全协议，防止 javascript: 等危险 URL 通过 img src 执行脚本
// 允许的源：http://、https://、data:、以单斜杠开头的相对路径（排除协议相对 URL //...）
const SAFE_URL_RE = /^(https?:|data:|\/[^/])/i
const safeSrc = computed(() => {
  if (!props.src) return undefined
  const trimmed = props.src.trim()
  return SAFE_URL_RE.test(trimmed) ? trimmed : undefined
})
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
    :class="[
      size === 'sm' && 'h-8 w-8 text-xs',
      size === 'md' && 'h-10 w-10 text-sm',
      size === 'lg' && 'h-14 w-14 text-lg',
    ]"
  >
    <img
      v-if="safeSrc && !imgError"
      :src="safeSrc"
      :alt="name"
      loading="lazy"
      class="h-full w-full object-cover"
      @error="imgError = true"
    />
    <span v-else>{{ initials(name) }}</span>
  </div>
</template>
