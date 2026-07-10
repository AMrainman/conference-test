<script setup lang="ts">
import type { Meeting } from '@/shared/types'
import Button from '@/shared/components/Button.vue'

interface Props {
  meeting: Meeting
}

defineProps<Props>()

const emit = defineEmits<{
  join: [id: string]
}>()
</script>

<template>
  <li class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
    <div class="flex min-w-0 flex-col gap-1">
      <h3 class="truncate text-base font-semibold text-text">
        {{ meeting.title }}
      </h3>
      <p class="text-sm text-text-muted">会议 ID：{{ meeting.id }}</p>
    </div>
    <Button class="shrink-0" @click="emit('join', meeting.id)">加入</Button>
  </li>
</template>
