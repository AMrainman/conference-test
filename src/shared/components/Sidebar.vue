<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <aside
    class="fixed inset-y-0 right-0 z-40 w-80 transform bg-white shadow-xl transition-transform dark:bg-slate-800"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 class="font-semibold">{{ title }}</h2>
        <button aria-label="关闭" class="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700" @click="emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="@container flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </aside>
</template>
