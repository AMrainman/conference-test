<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/shared/components/Button.vue'
import Input from '@/shared/components/Input.vue'
import type { ChatMessage } from '@/shared/types'

interface Props {
  messages: ChatMessage[]
}

defineProps<Props>()

const emit = defineEmits<{
  send: [content: string]
}>()

const draft = ref('')

function handleSend() {
  const content = draft.value.trim()
  if (!content) return

  emit('send', content)
  draft.value = ''
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex-1 space-y-3 overflow-y-auto">
      <div v-for="message in messages" :key="message.id" class="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
        <div class="mb-1 flex items-center justify-between">
          <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ message.senderName }}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatTime(message.timestamp) }}</span>
        </div>
        <p class="break-words text-sm text-slate-700 dark:text-slate-200">{{ message.content }}</p>
      </div>
    </div>

    <form class="mt-4 flex items-end gap-2" @submit.prevent="handleSend">
      <Input v-model="draft" placeholder="输入消息..." class="flex-1" />
      <Button type="submit">发送</Button>
    </form>
  </div>
</template>
