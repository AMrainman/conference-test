<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Meeting } from '@/shared/types'
import MeetingListItem from './MeetingListItem.vue'

const meetings = ref<Meeting[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const emit = defineEmits<{
  join: [id: string]
}>()

async function fetchMeetings() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/meetings')
    if (!response.ok) {
      throw new Error('获取会议列表失败')
    }

    const result = (await response.json()) as { data: Meeting[] }
    meetings.value = result.data
  } catch {
    errorMessage.value = '加载会议列表失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMeetings)
</script>

<template>
  <section>
    <h2 class="mb-4 text-lg font-semibold text-text">会议列表</h2>

    <div v-if="isLoading" class="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-muted">
      加载中…
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-danger-subtle bg-danger-subtle p-4 text-sm text-danger-text"
    >
      {{ errorMessage }}
    </div>

    <ul v-else-if="meetings.length > 0" class="flex flex-col gap-3">
      <MeetingListItem v-for="meeting in meetings" :key="meeting.id" :meeting="meeting" @join="emit('join', $event)" />
    </ul>

    <div v-else class="rounded-lg border border-border bg-surface p-8 text-center text-sm text-text-muted">
      暂无会议
    </div>
  </section>
</template>
