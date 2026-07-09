<script setup lang="ts">
interface Props {
  class?: string
}

defineProps<Props>()
</script>

<template>
  <!-- 自定义麦克风静音图标：@heroicons/vue 未提供 MicrophoneSlashIcon，
       因此使用与 Heroicons 风格一致的 24x24 SVG 作为语义等价替代。 -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    :class="$props.class"
  >
    <path d="M8.25 4.5a3.75 3.75 0 0 1 7.5 0v8.25a3.75 3.75 0 0 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 0 0 8.379 4.236l1.091 1.091A6.75 6.75 0 0 1 5.25 12.75v-1.5A.75.75 0 0 1 6 10.5Z" />
    <path d="M15.75 17.25v2.25h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.25a6.72 6.72 0 0 1-2.379-.764l6.545-6.545a6.75 6.75 0 0 1-2.666 5.809Z" />
    <path
      fill-rule="evenodd"
      d="M3.47 3.47a.75.75 0 0 1 1.06 0l16 16a.75.75 0 1 1-1.06 1.06l-16-16a.75.75 0 0 1 0-1.06Z"
      clip-rule="evenodd"
    />
  </svg>
</template>
