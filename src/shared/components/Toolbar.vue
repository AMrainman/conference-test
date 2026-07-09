<script setup lang="ts">
import { ref } from 'vue'
import {
  MicrophoneIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  PhoneXMarkIcon,
} from '@heroicons/vue/24/outline'
import IconButton from './IconButton.vue'

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
}>()

const micOn = ref(true)
const videoOn = ref(true)

function toggleMic() {
  micOn.value = !micOn.value
  emit('toggleMic')
}

function toggleVideo() {
  videoOn.value = !videoOn.value
  emit('toggleVideo')
}
</script>

<template>
  <div class="@container flex items-center justify-center gap-2 bg-white p-3 shadow-lg dark:bg-slate-900">
    <IconButton
      :label="micOn ? '静音' : '解除静音'"
      :active="!micOn"
      @click="toggleMic"
    >
      <component :is="micOn ? MicrophoneIcon : SpeakerXMarkIcon" class="h-5 w-5" />
    </IconButton>
    <IconButton
      :label="videoOn ? '停止视频' : '开启视频'"
      :active="!videoOn"
      @click="toggleVideo"
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
