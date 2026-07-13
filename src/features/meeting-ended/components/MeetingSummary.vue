<script setup lang="ts">
import Button from '@/shared/components/Button.vue'
import StatusPage from '@/shared/components/StatusPage.vue'

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
</script>

<template>
  <StatusPage title="会议已结束" :description="`会议号：${meetingId}`">
    <template #icon>
      <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle">
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
    </template>

    <div class="flex items-center justify-center gap-2 text-sm text-text-muted">
      <span>会议时长：</span>
      <span class="font-medium text-text-secondary">{{ durationText }}</span>
    </div>

    <template #actions>
      <Button size="lg" @click="emit('back')">返回首页</Button>
    </template>
  </StatusPage>
</template>
