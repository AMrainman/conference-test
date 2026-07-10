<script setup lang="ts">
import { useRouter } from 'vue-router'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import MeetingList from '../components/MeetingList.vue'
import QuickStartCard from '../components/QuickStartCard.vue'

const router = useRouter()

function goJoin(id?: string) {
  if (id) {
    router.push(`/pre-meeting/${id}`)
  } else {
    router.push('/join')
  }
}

function createMeeting() {
  router.push('/join?new=1')
}
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col px-4 py-6">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text">视频会议</h1>
      <ThemeToggle />
    </header>

    <main class="flex flex-col gap-8">
      <QuickStartCard @join="goJoin" @create="createMeeting" />
      <MeetingList @join="goJoin" />
    </main>
  </div>
</template>
