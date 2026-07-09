<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from '@/shared/components/Button.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
    <h1 class="mb-2 text-6xl font-bold text-slate-300 dark:text-slate-700">
      404
    </h1>
    <p class="mb-6 text-lg text-slate-600 dark:text-slate-400">
      抱歉，你访问的页面不存在
    </p>
    <Button @click="goHome">
      返回首页
    </Button>
  </div>
</template>
