<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WaitingRoomCard from '../components/WaitingRoomCard.vue'

const WAITING_DURATION = 2500

const route = useRoute()
const router = useRouter()

const meetingId = computed(() => route.params.meetingId as string)
const displayName = computed(() => {
  const name = route.query.displayName
  return typeof name === 'string' && name.trim() ? name.trim() : '访客'
})
const meetingTitle = computed(() => `会议 ${meetingId.value}`)

const timerId = ref<ReturnType<typeof setTimeout> | null>(null)

onMounted(() => {
  timerId.value = setTimeout(async () => {
    try {
      await router.replace(`/meeting/${meetingId.value}`)
    } catch {
      // 导航失败时静默处理，避免未捕获的 Promise 拒绝
    }
  }, WAITING_DURATION)
})

onUnmounted(() => {
  if (timerId.value !== null) {
    clearTimeout(timerId.value)
    timerId.value = null
  }
})
</script>

<template>
  <WaitingRoomCard
    :meeting-title="meetingTitle"
    :display-name="displayName"
  />
</template>
