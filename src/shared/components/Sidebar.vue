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
    class="absolute inset-y-0 right-0 z-40 w-80 transform bg-surface shadow-xl transition-transform"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
    :aria-hidden="!open"
    :inert="!open"
  >
    <div class="flex h-full flex-col">
      <div class="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 class="font-semibold">{{ title }}</h2>
        <button
          type="button"
          aria-label="关闭"
          class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-secondary"
          @click="emit('close')"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="@container flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </aside>
</template>
