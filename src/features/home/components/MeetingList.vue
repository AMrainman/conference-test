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
    <h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">会议列表</h2>

    <div
      v-if="isLoading"
      class="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    >
      加载中…
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
    >
      {{ errorMessage }}
    </div>

    <ul v-else-if="meetings.length > 0" class="flex flex-col gap-3">
      <MeetingListItem v-for="meeting in meetings" :key="meeting.id" :meeting="meeting" @join="emit('join', $event)" />
    </ul>

    <div
      v-else
      class="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    >
      暂无会议
    </div>
  </section>
</template>
