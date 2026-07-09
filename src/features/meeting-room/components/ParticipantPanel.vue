<script setup lang="ts">
import { MicrophoneIcon } from '@heroicons/vue/24/solid'
import Avatar from '@/shared/components/Avatar.vue'
import MicrophoneSlashIcon from '@/shared/components/MicrophoneSlashIcon.vue'
import type { Participant } from '@/shared/types'

interface Props {
  participants: Participant[]
}

defineProps<Props>()
</script>

<template>
  <div class="flex h-full flex-col">
    <ul class="flex flex-col gap-2">
      <li
        v-for="participant in participants"
        :key="participant.id"
        class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <Avatar :name="participant.displayName" :src="participant.avatarUrl" size="sm" />

        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-center gap-2">
            <span class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {{ participant.displayName }}
            </span>
            <span
              v-if="participant.isHost"
              class="shrink-0 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700 dark:bg-primary-900 dark:text-primary-300"
            >
              主持人
            </span>
          </div>
        </div>

        <component
          :is="participant.isMuted ? MicrophoneSlashIcon : MicrophoneIcon"
          class="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
        />
      </li>
    </ul>
  </div>
</template>
