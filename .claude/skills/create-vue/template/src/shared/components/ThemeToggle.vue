<script setup lang="ts">
import { computed } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useTheme } from '@/shared/composables/useTheme'

const { resolvedTheme, toggleTheme } = useTheme()

const isDark = computed(() => resolvedTheme.value === 'dark')
const label = computed(() => (isDark.value ? '切换到浅色模式' : '切换到深色模式'))
</script>

<template>
  <button
    type="button"
    class="rounded-lg p-2 transition-colors"
    :class="[
      'bg-surface-secondary text-text-muted hover:text-text',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    ]"
    :aria-label="label"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <SunIcon v-if="isDark" class="h-5 w-5" />
    <MoonIcon v-else class="h-5 w-5" />
  </button>
</template>
