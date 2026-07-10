<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'
import DevicePreview from '../components/DevicePreview.vue'
import DeviceSelector from '../components/DeviceSelector.vue'

const route = useRoute()
const router = useRouter()

const meetingId = computed(() => route.params.meetingId as string)
const displayName = computed(() => {
  const name = route.query.displayName
  return typeof name === 'string' && name.trim() ? name.trim() : '访客'
})

async function enter() {
  await router.push(`/meeting/${meetingId.value}`)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 py-6">
    <div class="@container w-full max-w-4xl rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 class="mb-6 text-center text-xl font-bold text-text">会前设置</h1>

      <div class="grid grid-cols-1 gap-6 @lg:grid-cols-2">
        <DevicePreview :display-name="displayName" />

        <div class="flex flex-col justify-center gap-4">
          <DeviceSelector />
          <Button size="lg" class="w-full" @click="enter">进入会议</Button>
        </div>
      </div>
    </div>
  </div>
</template>
