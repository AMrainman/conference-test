<script setup lang="ts">
import Button from '@/shared/components/Button.vue'

interface Props {
  meetingId: string
  durationText?: string
}

withDefaults(defineProps<Props>(), {
  durationText: '00:30:00',
})

const emit = defineEmits<{
  back: []
}>()

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="@container flex min-h-screen items-center justify-center px-4 py-6">
    <div class="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">
      <div class="flex flex-col items-center text-center">
        <div class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 class="mb-2 text-xl font-bold text-text">会议已结束</h1>

        <p class="mb-6 text-text-secondary">会议号：{{ meetingId }}</p>

        <div class="mb-8 flex items-center gap-2 text-sm text-text-muted">
          <span>会议时长：</span>
          <span class="font-medium text-text-secondary">{{ durationText }}</span>
        </div>

        <Button size="lg" @click="handleBack">返回首页</Button>
      </div>
    </div>
  </div>
</template>
