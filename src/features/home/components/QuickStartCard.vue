<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/shared/components/Button.vue'
import Input from '@/shared/components/Input.vue'

const meetingId = ref('')

const emit = defineEmits<{
  join: [id: string]
  create: []
}>()

function handleJoin() {
  const id = meetingId.value.trim()
  if (id) {
    emit('join', id)
  }
}
</script>

<template>
  <section
    class="@container rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
  >
    <h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">快速开始</h2>

    <form class="flex flex-col gap-4 @md:flex-row @md:items-end" @submit.prevent="handleJoin">
      <Input v-model="meetingId" label="加入会议" placeholder="输入会议 ID" class="flex-1" />
      <div class="flex shrink-0 gap-3">
        <Button type="submit" :disabled="!meetingId.trim()">加入会议</Button>
        <Button variant="secondary" type="button" @click="emit('create')">新建会议</Button>
      </div>
    </form>
  </section>
</template>
