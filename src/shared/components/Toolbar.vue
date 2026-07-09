<script setup lang="ts">
import {
  MicrophoneIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  PhoneXMarkIcon,
} from '@heroicons/vue/24/outline'
import IconButton from './IconButton.vue'

interface Props {
  micOn?: boolean
  videoOn?: boolean
}

withDefaults(defineProps<Props>(), { micOn: true, videoOn: true })

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
}>()
</script>

<template>
  <div class="@container flex items-center justify-center gap-2 bg-white p-3 shadow-lg dark:bg-slate-900">
    <IconButton
      :label="micOn ? '静音' : '解除静音'"
      :active="!micOn"
      @click="emit('toggleMic')"
    >
      <component :is="micOn ? MicrophoneIcon : SpeakerXMarkIcon" class="h-5 w-5" />
    </IconButton>
    <IconButton
      :label="videoOn ? '停止视频' : '开启视频'"
      :active="!videoOn"
      @click="emit('toggleVideo')"
    >
      <component :is="videoOn ? VideoCameraIcon : VideoCameraSlashIcon" class="h-5 w-5" />
    </IconButton>
    <IconButton label="参会者" @click="emit('toggleSidebar')">
      <UsersIcon class="h-5 w-5" />
    </IconButton>
    <IconButton label="离开会议" danger @click="emit('leave')">
      <PhoneXMarkIcon class="h-5 w-5" />
    </IconButton>
  </div>
</template>
