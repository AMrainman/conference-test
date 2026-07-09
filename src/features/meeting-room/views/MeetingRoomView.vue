<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useMeetingStore } from '@/shared/stores/meetingStore'
import { useUiStore } from '@/shared/stores/uiStore'
import MeetingHeader from '@/shared/components/MeetingHeader.vue'
import Sidebar from '@/shared/components/Sidebar.vue'
import VideoGrid from '../components/VideoGrid.vue'
import MeetingToolbar from '../components/MeetingToolbar.vue'
import ParticipantPanel from '../components/ParticipantPanel.vue'
import ChatPanel from '../components/ChatPanel.vue'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const uiStore = useUiStore()

const { currentMeeting, participants, localUser, messages, isMuted, isVideoOff } = storeToRefs(meetingStore)
const { sidebarOpen, activeSidebarTab } = storeToRefs(uiStore)

const meetingId = computed(() => {
  const raw = route.params.meetingId
  const id = Array.isArray(raw) ? raw[0] : raw
  return id ?? ''
})
const meetingTitle = computed(() => currentMeeting.value?.title ?? '会议中')

const isLeaving = ref(false)

onMounted(async () => {
  if (!meetingId.value) {
    return
  }
  await meetingStore.join(meetingId.value, '我')
})

onUnmounted(() => {
  meetingStore.leave()
})

watch(
  () => localUser.value,
  (user) => {
    if (user === null && !isLeaving.value) {
      router.replace('/')
    }
  },
)

async function leave() {
  isLeaving.value = true
  const id = meetingId.value
  meetingStore.leave()
  if (id) {
    await router.push(`/ended/${id}`)
  } else {
    await router.replace('/')
  }
}
</script>

<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-900">
    <MeetingHeader :title="meetingTitle" :meeting-id="meetingId">
      <button
        type="button"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="uiStore.toggleSidebar"
      >
        侧边栏
      </button>
    </MeetingHeader>

    <div
      v-if="meetingStore.error && !currentMeeting"
      class="mx-4 mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-100"
    >
      {{ meetingStore.error }}
    </div>

    <div class="relative flex flex-1 overflow-hidden">
      <main class="flex min-w-0 flex-1 flex-col">
        <VideoGrid :participants="participants" class="flex-1" />
        <MeetingToolbar
          :mic-on="!isMuted"
          :video-on="!isVideoOff"
          @toggle-mic="meetingStore.toggleMute"
          @toggle-video="meetingStore.toggleVideo"
          @toggle-sidebar="uiStore.toggleSidebar"
          @leave="leave"
        />
      </main>

      <Sidebar :open="sidebarOpen" title="会议信息" @close="uiStore.closeSidebar">
        <div class="flex h-full flex-col gap-4">
          <div class="flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="activeSidebarTab === 'participants'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'"
              @click="uiStore.setActiveTab('participants')"
            >
              参会者
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              :class="activeSidebarTab === 'chat'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'"
              @click="uiStore.setActiveTab('chat')"
            >
              聊天
            </button>
          </div>

          <ParticipantPanel
            v-if="activeSidebarTab === 'participants'"
            :participants="participants"
          />
          <ChatPanel
            v-else
            :messages="messages"
            @send="meetingStore.sendMessage"
          />
        </div>
      </Sidebar>
    </div>
  </div>
</template>
