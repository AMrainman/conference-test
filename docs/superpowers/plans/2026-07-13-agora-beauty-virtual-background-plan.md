# Agora Demo 美颜与背景模糊实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or implement inline with frequent verification.

**Goal:** 在 `AgoraDemoView` 中集成声网美颜与背景模糊扩展，并在 `MeetingToolbar` 中提供档位控制。

**Architecture:** 新增 `useAgoraBeautyEffect` 和 `useAgoraVirtualBackground` 两个独立 composable 管理各自扩展；`useAgoraChannel` 仅暴露 `localVideoTrack`；`AgoraDemoView` 组合三者并绑定 `MeetingToolbar`。

**Tech Stack:** Vue 3 + TypeScript + Pinia + agora-rtc-sdk-ng + agora-extension-beauty-effect + agora-extension-virtual-background

---

## 文件变更清单

| 文件 | 操作 | 职责 |
| --- | --- | --- |
| `src/features/agora-demo/composables/useAgoraBeautyEffect.ts` | 创建 | 管理美颜扩展生命周期与四档预设 |
| `src/features/agora-demo/composables/useAgoraVirtualBackground.ts` | 创建 | 管理背景模糊扩展生命周期与三档模糊强度 |
| `src/features/agora-demo/composables/useAgoraChannel.ts` | 修改 | 暴露 `localVideoTrack`；增加中文注释 |
| `src/features/agora-demo/views/AgoraDemoView.vue` | 修改 | 集成两个 composable，绑定 `MeetingToolbar` |
| `src/features/meeting-room/components/MeetingToolbar.vue` | 修改 | 新增美颜、背景模糊下拉 |
| `src/shared/components/Toolbar.vue` | 修改 | 新增美颜、背景模糊 props 与事件 |
| `package.json` | 修改 | 新增两个 npm 依赖 |

---

## Task 1: 新增 `useAgoraBeautyEffect` composable

**Files:**
- Create: `src/features/agora-demo/composables/useAgoraBeautyEffect.ts`

- [ ] **Step 1.1: 实现 composable**

```typescript
import { ref, watch, type Ref, type DeepReadonly } from 'vue'
import BeautyExtension from 'agora-extension-beauty-effect'
import AgoraRTC, { type ICameraVideoTrack } from 'agora-rtc-sdk-ng'

export type BeautyLevel = 'off' | 'low' | 'medium' | 'high'

interface BeautyPreset {
  lighteningContrastLevel: number
  lighteningLevel: number
  smoothnessLevel: number
  sharpnessLevel: number
  rednessLevel: number
}

const PRESETS: Record<Exclude<BeautyLevel, 'off'>, BeautyPreset> = {
  low: {
    lighteningContrastLevel: 1,
    lighteningLevel: 0.3,
    smoothnessLevel: 0.3,
    sharpnessLevel: 0.2,
    rednessLevel: 0.2,
  },
  medium: {
    lighteningContrastLevel: 1,
    lighteningLevel: 0.5,
    smoothnessLevel: 0.5,
    sharpnessLevel: 0.3,
    rednessLevel: 0.4,
  },
  high: {
    lighteningContrastLevel: 2,
    lighteningLevel: 0.7,
    smoothnessLevel: 0.7,
    sharpnessLevel: 0.5,
    rednessLevel: 0.5,
  },
}

export interface UseAgoraBeautyEffectReturn {
  beautyLevel: DeepReadonly<Ref<BeautyLevel>>
  setBeautyLevel: (level: BeautyLevel) => void
  error: DeepReadonly<Ref<string | null>>
}

export function useAgoraBeautyEffect(
  localVideoTrack: Ref<ICameraVideoTrack | null>
): UseAgoraBeautyEffectReturn {
  const beautyLevel = ref<BeautyLevel>('off')
  const error = ref<string | null>(null)
  const extension = new BeautyExtension()
  const processor = extension.createProcessor()

  AgoraRTC.registerExtensions([extension])

  async function apply(level: BeautyLevel) {
    const track = localVideoTrack.value
    if (!track) return

    try {
      if (level === 'off') {
        if (processor.enabled) {
          await processor.disable()
        }
        track.unpipe()
        return
      }

      processor.setOptions(PRESETS[level])
      track.pipe(processor).pipe(track.processorDestination)
      if (!processor.enabled) {
        await processor.enable()
      }
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '美颜效果开启失败'
    }
  }

  function setBeautyLevel(level: BeautyLevel) {
    beautyLevel.value = level
    void apply(level)
  }

  watch(
    localVideoTrack,
    (track, oldTrack) => {
      if (oldTrack && beautyLevel.value !== 'off') {
        oldTrack.unpipe()
      }
      if (track && beautyLevel.value !== 'off') {
        void apply(beautyLevel.value)
      }
    },
    { immediate: true }
  )

  return {
    beautyLevel,
    setBeautyLevel,
    error,
  }
}
```

- [ ] **Step 1.2: 增加中文注释**

在关键位置补充注释，说明：
- 为什么通过 `pipe` 注入 processor
- `processorDestination` 的作用
- 档位变化时如何复用 processor
- 重新加入频道时为何需要 `watch` track

---

## Task 2: 新增 `useAgoraVirtualBackground` composable

**Files:**
- Create: `src/features/agora-demo/composables/useAgoraVirtualBackground.ts`

- [ ] **Step 2.1: 实现 composable**

```typescript
import { ref, watch, type Ref, type DeepReadonly } from 'vue'
import VirtualBackgroundExtension from 'agora-extension-virtual-background'
import AgoraRTC, { type ICameraVideoTrack } from 'agora-rtc-sdk-ng'

export type BlurLevel = 'off' | 'low' | 'medium' | 'high'

const BLUR_DEGREE: Record<Exclude<BlurLevel, 'off'>, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export interface UseAgoraVirtualBackgroundReturn {
  blurLevel: DeepReadonly<Ref<BlurLevel>>
  setBlurLevel: (level: BlurLevel) => void
  error: DeepReadonly<Ref<string | null>>
}

export function useAgoraVirtualBackground(
  localVideoTrack: Ref<ICameraVideoTrack | null>
): UseAgoraVirtualBackgroundReturn {
  const blurLevel = ref<BlurLevel>('off')
  const error = ref<string | null>(null)
  const extension = new VirtualBackgroundExtension()

  if (!extension.checkCompatibility()) {
    error.value = '当前浏览器不支持背景模糊'
  }

  const processor = extension.createProcessor()
  AgoraRTC.registerExtensions([extension])

  async function apply(level: BlurLevel) {
    const track = localVideoTrack.value
    if (!track) return

    try {
      if (level === 'off') {
        if (processor.enabled) {
          await processor.disable()
        }
        track.unpipe()
        return
      }

      await processor.init('/assets/wasms')
      processor.setOptions({ type: 'blur', blurDegree: BLUR_DEGREE[level] })
      track.pipe(processor).pipe(track.processorDestination)
      if (!processor.enabled) {
        await processor.enable()
      }
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : '背景模糊开启失败'
    }
  }

  function setBlurLevel(level: BlurLevel) {
    blurLevel.value = level
    void apply(level)
  }

  watch(
    localVideoTrack,
    (track, oldTrack) => {
      if (oldTrack && blurLevel.value !== 'off') {
        oldTrack.unpipe()
      }
      if (track && blurLevel.value !== 'off') {
        void apply(blurLevel.value)
      }
    },
    { immediate: true }
  )

  return {
    blurLevel,
    setBlurLevel,
    error,
  }
}
```

- [ ] **Step 2.2: 增加中文注释**

说明：
- `checkCompatibility()` 的用途
- WASM 资源路径
- 为什么背景模糊 processor 放在美颜 processor 之后（在 AgoraDemoView 中控制顺序）

---

## Task 3: 修改 `useAgoraChannel.ts`

**Files:**
- Modify: `src/features/agora-demo/composables/useAgoraChannel.ts`

- [ ] **Step 3.1: 在返回值中暴露 `localVideoTrack`**

```typescript
return {
  client,
  localAudioTrack,
  localVideoTrack, // 新增暴露
  localUser,
  // ... 其他不变
}
```

- [ ] **Step 3.2: 增加中文注释**

在以下位置增加注释：
- `useAgoraChannel` 函数顶部：说明该 composable 的职责边界
- `join` 函数中音视频轨道创建部分
- `cleanup` 函数中轨道释放部分
- 为什么 `localVideoTrack` 需要暴露给上层 composable

---

## Task 4: 修改 `AgoraDemoView.vue`

**Files:**
- Modify: `src/features/agora-demo/views/AgoraDemoView.vue`

- [ ] **Step 4.1: 导入并初始化两个 composable**

```typescript
import { useAgoraBeautyEffect } from '../composables/useAgoraBeautyEffect'
import { useAgoraVirtualBackground } from '../composables/useAgoraVirtualBackground'

const { localVideoTrack } = useAgoraChannel(channelId)

const { beautyLevel, setBeautyLevel, error: beautyError } = useAgoraBeautyEffect(localVideoTrack)
const { blurLevel, setBlurLevel, error: blurError } = useAgoraVirtualBackground(localVideoTrack)
```

- [ ] **Step 4.2: 绑定到 `MeetingToolbar`**

```html
<MeetingToolbar
  :mic-on="!isMuted"
  :video-on="!isVideoOff"
  :beauty-level="beautyLevel"
  :blur-level="blurLevel"
  @toggle-mic="toggleMic"
  @toggle-video="toggleCamera"
  @leave="handleLeave"
  @update:beauty-level="setBeautyLevel"
  @update:blur-level="setBlurLevel"
/>
```

- [ ] **Step 4.3: 显示扩展错误提示**

在现有 error 提示下方增加扩展错误提示：

```html
<div v-if="beautyError || blurError" class="mx-4 mt-2 rounded-lg bg-warning-subtle px-4 py-2 text-sm text-warning-text">
  {{ beautyError || blurError }}
</div>
```

---

## Task 5: 修改 `MeetingToolbar.vue` 与 `Toolbar.vue`

**Files:**
- Modify: `src/features/meeting-room/components/MeetingToolbar.vue`
- Modify: `src/shared/components/Toolbar.vue`

- [ ] **Step 5.1: 扩展 `Toolbar.vue` props 和事件**

```typescript
import { SparklesIcon, SwatchIcon } from '@heroicons/vue/24/outline'

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
```

- [ ] **Step 5.2: 在 `Toolbar.vue` 新增两个下拉菜单**

在工具栏中合适位置（如参会者按钮旁边）新增美颜和背景模糊下拉：

```html
<!-- 美颜下拉 -->
<Menu as="div" class="relative">
  <MenuButton as="template">
    <IconButton label="美颜" :label-class="labelClass">
      <SparklesIcon class="h-5 w-5" />
    </IconButton>
  </MenuButton>
  <MenuItems class="...">
    <MenuItem v-for="item in BEAUTY_OPTIONS" :key="item.value" v-slot="{ active }">
      <button
        type="button"
        class="..."
        :class="[active && 'bg-surface-secondary', beautyLevel === item.value && 'font-medium text-text']"
        @click="emit('update:beautyLevel', item.value)"
      >
        {{ item.label }}
      </button>
    </MenuItem>
  </MenuItems>
</Menu>
```

背景模糊下拉类似。

- [ ] **Step 5.3: 在 `MeetingToolbar.vue` 中透传新 props 和事件**

```typescript
interface Props {
  micOn?: boolean
  videoOn?: boolean
  beautyLevel?: 'off' | 'low' | 'medium' | 'high'
  blurLevel?: 'off' | 'low' | 'medium' | 'high'
}

const emit = defineEmits<{
  toggleMic: []
  toggleVideo: []
  toggleSidebar: []
  leave: []
  'update:beautyLevel': [level: 'off' | 'low' | 'medium' | 'high']
  'update:blurLevel': [level: 'off' | 'low' | 'medium' | 'high']
}>()
```

```html
<Toolbar
  :mic-on="micOn"
  :video-on="videoOn"
  :beauty-level="beautyLevel"
  :blur-level="blurLevel"
  @toggle-mic="emit('toggleMic')"
  @toggle-video="emit('toggleVideo')"
  @toggle-sidebar="emit('toggleSidebar')"
  @leave="emit('leave')"
  @update:beauty-level="emit('update:beautyLevel', $event)"
  @update:blur-level="emit('update:blurLevel', $event)"
/>
```

---

## Task 6: 添加 npm 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 6.1: 新增依赖**

```json
"dependencies": {
  "agora-extension-beauty-effect": "^1.0.2-beta",
  "agora-extension-virtual-background": "^2.1.0",
  // ... 其他不变
}
```

- [ ] **Step 6.2: 提示用户安装**

在 WSL 环境中不执行 `npm install`，在最终摘要中提示用户在项目目录下运行：

```bash
npm install
```

---

## Task 7: 类型检查与验证

**Files:**
- 运行命令验证

- [ ] **Step 7.1: 运行 type-check**

```bash
npm run type-check
```

预期结果：无类型错误。

- [ ] **Step 7.2: 运行 lint**

```bash
npm run lint
```

预期结果：无 lint 错误。

---

## 依赖关系

1. Task 1 和 Task 2 相互独立，可并行。
2. Task 3 可在 Task 1/2 之前或之后完成。
3. Task 4 依赖 Task 1、Task 2、Task 3。
4. Task 5 依赖 Task 4（因为需要一致的 props/event 名称）。
5. Task 6 和 Task 7 在所有修改完成后执行。

## 验收标准

- `AgoraDemoView` 页面加载后，美颜和背景模糊默认关闭。
- `MeetingToolbar` 中新增美颜和背景模糊两个下拉菜单，各四档。
- 切换美颜档位时，本地视频画面实时应用对应效果。
- 切换背景模糊档位时，本地视频背景实时模糊。
- 离开频道后重新加入，保持上次选择的美颜/模糊档位。
- 浏览器不支持时显示友好提示，不影响正常通话。
- `npm run type-check` 通过。
- `npm run lint` 通过。

## 参考

- 设计文档：`docs/superpowers/specs/2026-07-13-agora-beauty-virtual-background-design.md`
- [Beauty Effect (Beta) | Agora Docs](https://docs.agora.io/en/video-calling/advanced-features/beauty-effect?platform=web)
- [Virtual Background | Agora Docs](https://docs.agora.io/en/video-calling/advanced-features/virtual-background)
