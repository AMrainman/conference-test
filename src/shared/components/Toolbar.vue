<script setup lang="ts">
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  PhoneXMarkIcon,
  EllipsisVerticalIcon,
} from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import IconButton from './IconButton.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

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

// 容器宽度小于 @md 时隐藏按钮文字；小于 @sm 时将“参会者”收进“更多”菜单。
const labelClass = ['hidden', '@md:inline']
</script>

<template>
  <div class="@container flex items-center justify-center gap-2 bg-white p-3 shadow-lg dark:bg-slate-900">
    <IconButton
      :label="micOn ? '静音' : '解除静音'"
      :active="!micOn"
      :label-class="labelClass"
      @click="emit('toggleMic')"
    >
      <component :is="micOn ? MicrophoneIcon : MicrophoneSlashIcon" class="h-5 w-5" />
    </IconButton>

    <IconButton
      :label="videoOn ? '停止视频' : '开启视频'"
      :active="!videoOn"
      :label-class="labelClass"
      @click="emit('toggleVideo')"
    >
      <component :is="videoOn ? VideoCameraIcon : VideoCameraSlashIcon" class="h-5 w-5" />
    </IconButton>

    <IconButton label="离开会议" danger :label-class="labelClass" @click="emit('leave')">
      <PhoneXMarkIcon class="h-5 w-5" />
    </IconButton>

    <IconButton label="参会者" :label-class="labelClass" class="hidden @sm:flex" @click="emit('toggleSidebar')">
      <UsersIcon class="h-5 w-5" />
    </IconButton>

    <Menu as="div" class="relative @sm:hidden">
      <MenuButton as="template">
        <IconButton label="更多" :label-class="labelClass">
          <EllipsisVerticalIcon class="h-5 w-5" />
        </IconButton>
      </MenuButton>

      <MenuItems
        class="absolute bottom-full right-0 mb-2 w-40 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5 dark:bg-slate-800"
      >
        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
            :class="active && 'bg-slate-100 dark:bg-slate-700'"
            @click="emit('toggleSidebar')"
          >
            <UsersIcon class="h-4 w-4" />
            参会者
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  </div>
</template>
