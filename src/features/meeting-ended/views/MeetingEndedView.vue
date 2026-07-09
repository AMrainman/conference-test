<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MeetingSummary from '../components/MeetingSummary.vue'

const route = useRoute()
const router = useRouter()

const meetingId = computed(() => route.params.meetingId as string)

async function backHome() {
  await router.push('/')
}
</script>

<template>
  <MeetingSummary :meeting-id="meetingId" @back="backHome" />
</template>
