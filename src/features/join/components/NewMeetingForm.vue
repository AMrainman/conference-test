<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/shared/components/Button.vue'
import Input from '@/shared/components/Input.vue'

const emit = defineEmits<{
  submit: [payload: { displayName: string }]
}>()

const displayName = ref('')
const displayNameError = ref('')

function handleSubmit() {
  displayNameError.value = displayName.value.trim() ? '' : '请输入显示名称'

  if (displayNameError.value) {
    return
  }

  emit('submit', { displayName: displayName.value.trim() })
}
</script>

<template>
  <form class="@container flex flex-col gap-4" @submit.prevent="handleSubmit">
    <Input v-model="displayName" label="显示名称" placeholder="请输入您的显示名称" :error="displayNameError" />
    <Button type="submit" class="w-full @md:mt-2">新建会议</Button>
  </form>
</template>
