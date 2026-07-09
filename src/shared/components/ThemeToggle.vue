<script setup lang="ts">
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/vue/24/outline'
import { useTheme } from '@/shared/composables/useTheme'
import type { Theme } from '@/shared/types'

const { theme, setTheme } = useTheme()

const options: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'system', label: '跟随系统', icon: ComputerDesktopIcon },
]
</script>

<template>
  <div class="@container flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
    <button
      v-for="opt in options"
      :key="opt.value"
      :aria-label="opt.label"
      :aria-pressed="theme === opt.value"
      class="flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors"
      :class="theme === opt.value ? 'bg-white text-primary-600 shadow dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'"
      @click="setTheme(opt.value)"
    >
      <component :is="opt.icon" class="h-4 w-4" />
      <span class="hidden @md:inline">{{ opt.label }}</span>
    </button>
  </div>
</template>
