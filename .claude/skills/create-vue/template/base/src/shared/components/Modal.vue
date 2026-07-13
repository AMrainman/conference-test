<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

interface Props {
  open: boolean
  title?: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Dialog :open="open" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 bg-overlay/50" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl" aria-describedby="modal-content">
        <DialogTitle v-if="title" class="mb-4 text-lg font-semibold text-text">
          {{ title }}
        </DialogTitle>
        <DialogTitle v-else class="sr-only">弹窗</DialogTitle>
        <div id="modal-content" class="text-text-secondary">
          <slot />
        </div>
        <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
