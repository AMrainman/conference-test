import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    // 使用绝对路径避免嵌套在其他 vitest 项目下时相对路径解析错误
    setupFiles: [resolve(__dirname, 'vitest.setup.ts')],
    globals: true,
  },
})
