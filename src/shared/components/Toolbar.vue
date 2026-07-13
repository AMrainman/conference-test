<script setup lang="ts">
import {
  MicrophoneIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  PhoneXMarkIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/vue/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import IconButton from './IconButton.vue'
import MicrophoneSlashIcon from './MicrophoneSlashIcon.vue'

interface Props {
  micOn?: boolean
  videoOn?: boolean
  beautyLevel?: 'off' | 'low' | 'medium' | 'high'
  blurLevel?: 'off' | 'low' | 'medium' | 'high'
}

withDefaults(defineProps<Props>(), {
  micOn: true,
  videoOn: true,
  beautyLevel: 'off',
  blurLevel: 'off',
})

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
  'update:beautyLevel': [level: 'off' | 'low' | 'medium' | 'high']
  'update:blurLevel': [level: 'off' | 'low' | 'medium' | 'high']
}>()

const BEAUTY_OPTIONS: { value: 'off' | 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'off', label: '美颜：关闭' },
  { value: 'low', label: '美颜：低' },
  { value: 'medium', label: '美颜：中' },
  { value: 'high', label: '美颜：高' },
]

const BLUR_OPTIONS: { value: 'off' | 'low' | 'medium' | 'high'; label: string }[] = [
  { value: 'off', label: '模糊：关闭' },
  { value: 'low', label: '模糊：低' },
  { value: 'medium', label: '模糊：中' },
  { value: 'high', label: '模糊：高' },
]

// 容器宽度小于 @md 时隐藏按钮文字；小于 @sm 时将“参会者”收进“更多”菜单。
const labelClass = ['hidden', '@md:inline']
</script>

<template>
  <div class="@container flex items-center justify-center gap-2 bg-surface p-3 shadow-lg">
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

    <!-- 美颜下拉 -->
    <Menu as="div" class="relative hidden @sm:block">
      <MenuButton as="template">
        <IconButton label="美颜" :active="beautyLevel !== 'off'" :label-class="labelClass">
          <SparklesIcon class="h-5 w-5" />
        </IconButton>
      </MenuButton>

      <MenuItems
        class="absolute bottom-full right-0 mb-2 w-32 rounded-lg bg-surface p-1 shadow-lg ring-1 ring-overlay/5"
      >
        <MenuItem v-for="item in BEAUTY_OPTIONS" :key="item.value" v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary"
            :class="[active && 'bg-surface-secondary', beautyLevel === item.value && 'font-medium text-text']"
            @click="emit('update:beautyLevel', item.value)"
          >
            {{ item.label }}
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>

    <!-- 背景模糊下拉 -->
    <Menu as="div" class="relative hidden @sm:block">
      <MenuButton as="template">
        <IconButton label="背景模糊" :active="blurLevel !== 'off'" :label-class="labelClass">
          <SwatchIcon class="h-5 w-5" />
        </IconButton>
      </MenuButton>

      <MenuItems
        class="absolute bottom-full right-0 mb-2 w-32 rounded-lg bg-surface p-1 shadow-lg ring-1 ring-overlay/5"
      >
        <MenuItem v-for="item in BLUR_OPTIONS" :key="item.value" v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary"
            :class="[active && 'bg-surface-secondary', blurLevel === item.value && 'font-medium text-text']"
            @click="emit('update:blurLevel', item.value)"
          >
            {{ item.label }}
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>

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
        class="absolute bottom-full right-0 mb-2 w-40 rounded-lg bg-surface p-1 shadow-lg ring-1 ring-overlay/5"
      >
        <MenuItem v-for="item in BEAUTY_OPTIONS" :key="`mobile-beauty-${item.value}`" v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary"
            :class="[active && 'bg-surface-secondary', beautyLevel === item.value && 'font-medium text-text']"
            @click="emit('update:beautyLevel', item.value)"
          >
            <SparklesIcon class="h-4 w-4" />
            {{ item.label }}
          </button>
        </MenuItem>

        <MenuItem v-for="item in BLUR_OPTIONS" :key="`mobile-blur-${item.value}`" v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary"
            :class="[active && 'bg-surface-secondary', blurLevel === item.value && 'font-medium text-text']"
            @click="emit('update:blurLevel', item.value)"
          >
            <SwatchIcon class="h-4 w-4" />
            {{ item.label }}
          </button>
        </MenuItem>

        <MenuItem v-slot="{ active }">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-text-secondary"
            :class="active && 'bg-surface-secondary'"
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
