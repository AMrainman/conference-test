<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/shared/components/Button.vue'
import Input from '@/shared/components/Input.vue'

const emit = defineEmits<{
  submit: [payload: { meetingId: string; displayName: string }]
}>()

const meetingId = ref('')
const displayName = ref('')
const meetingIdError = ref('')
const displayNameError = ref('')

function handleSubmit() {
  meetingIdError.value = meetingId.value.trim() ? '' : '请输入会议 ID'
  displayNameError.value = displayName.value.trim() ? '' : '请输入显示名称'

  if (meetingIdError.value || displayNameError.value) {
    return
  }

  emit('submit', {
    meetingId: meetingId.value.trim(),
    displayName: displayName.value.trim(),
  })
}
</script>

<template>
  <form class="@container flex flex-col gap-4" @submit.prevent="handleSubmit">
    <Input v-model="meetingId" label="会议 ID" placeholder="请输入 9 位会议 ID" :error="meetingIdError" />
    <Input v-model="displayName" label="显示名称" placeholder="请输入您的显示名称" :error="displayNameError" />
    <Button type="submit" class="w-full @md:mt-2">加入会议</Button>
  </form>
</template>
