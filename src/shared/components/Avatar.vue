<script setup lang="ts">
interface Props {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), { size: 'md' })

function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300"
    :class="[size === 'sm' && 'h-8 w-8 text-xs', size === 'md' && 'h-10 w-10 text-sm', size === 'lg' && 'h-14 w-14 text-lg']"
  >
    <img v-if="src" :src="src" :alt="name" class="h-full w-full object-cover" />
    <span v-else>{{ initials(name) }}</span>
  </div>
</template>
