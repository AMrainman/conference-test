<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JoinMeetingForm from '../components/JoinMeetingForm.vue'
import NewMeetingForm from '../components/NewMeetingForm.vue'

const route = useRoute()
const router = useRouter()

const isNew = computed(() => route.query.new === '1')
const pageTitle = computed(() => (isNew.value ? '新建会议' : '加入会议'))

function joinMeeting(payload: { meetingId: string; displayName: string }) {
  router.push({
    path: `/pre-meeting/${payload.meetingId}`,
    query: { displayName: payload.displayName },
  })
}

function createMeeting(payload: { displayName: string }) {
  const meetingId = Math.floor(100_000_000 + Math.random() * 900_000_000).toString()
  router.push({
    path: `/pre-meeting/${meetingId}`,
    query: { displayName: payload.displayName },
  })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-6">
    <div
      class="@container w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <h1 class="mb-6 text-center text-xl font-bold text-slate-900 dark:text-slate-100">
        {{ pageTitle }}
      </h1>

      <JoinMeetingForm v-if="!isNew" @submit="joinMeeting" />
      <NewMeetingForm v-else @submit="createMeeting" />
    </div>
  </div>
</template>
