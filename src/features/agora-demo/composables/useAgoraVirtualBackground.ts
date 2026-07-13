import { ref, type DeepReadonly, type Ref } from 'vue'

import VirtualBackgroundExtension from 'agora-extension-virtual-background'

import { getVirtualBackgroundExtension } from './useAgoraExtensions'

export type BlurLevel = 'off' | 'low' | 'medium' | 'high'

const BLUR_DEGREE: Record<Exclude<BlurLevel, 'off'>, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export interface UseAgoraVirtualBackgroundReturn {
  blurLevel: DeepReadonly<Ref<BlurLevel>>
  setBlurLevel: (level: BlurLevel) => void
  processor: ReturnType<VirtualBackgroundExtension['createProcessor']>
  applyOptions: () => void
  isSupported: boolean
  cleanup: () => Promise<void>
}

/**
 * 管理声网虚拟背景扩展的 processor 实例与档位状态，当前仅用于背景模糊。
 *
 * 该 composable 不负责 pipe、init 或 enable。因为美颜和背景模糊两个扩展需要
 * 按固定顺序串接到同一条视频处理链上，这些操作由上层统一处理，避免互相覆盖。
 */
export function useAgoraVirtualBackground(): UseAgoraVirtualBackgroundReturn {
  // 使用已注册的同一个 extension 实例创建 processor，避免 "Extension not registered yet" 错误。
  const extension = getVirtualBackgroundExtension()

  const blurLevel = ref<BlurLevel>('off')

  // 提前检测浏览器兼容性，避免用户选择档位后才报错。
  const isSupported = extension.checkCompatibility()

  const processor = extension.createProcessor()

  function setBlurLevel(level: BlurLevel) {
    blurLevel.value = level
  }

  /**
   * 将当前档位参数设置到 processor。
   * 上层在确认档位不为 off 且 pipeline 已组装后调用。
   */
  function applyOptions() {
    if (blurLevel.value === 'off') return
    processor.setOptions({
      type: 'blur',
      blurDegree: BLUR_DEGREE[blurLevel.value],
    })
  }

  /**
   * 释放 processor 资源。
   * 关闭效果时应调用，避免 WebGL/WASM 上下文残留。
   */
  async function cleanup() {
    try {
      await processor.disable()
    } catch {
      // 清理阶段忽略已禁用或禁用失败的 processor
    }
  }

  return {
    blurLevel,
    setBlurLevel,
    processor,
    applyOptions,
    isSupported,
    cleanup,
  }
}
