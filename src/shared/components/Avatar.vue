<script setup lang="ts">
import { ref } from 'vue'

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
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
    :class="[size === 'sm' && 'h-8 w-8 text-xs', size === 'md' && 'h-10 w-10 text-sm', size === 'lg' && 'h-14 w-14 text-lg']"
  >
    <img
      v-if="props.src && !imgError"
      :src="props.src"
      :alt="name"
      loading="lazy"
      class="h-full w-full object-cover"
      @error="imgError = true"
    />
    <span v-else>{{ initials(name) }}</span>
  </div>
</template>
