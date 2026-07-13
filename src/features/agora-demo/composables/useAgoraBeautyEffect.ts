import { ref, type DeepReadonly, type Ref } from 'vue'

import BeautyExtension from 'agora-extension-beauty-effect'

import { getBeautyExtension } from './useAgoraExtensions'

export type BeautyLevel = 'off' | 'low' | 'medium' | 'high'

interface BeautyPreset {
  lighteningContrastLevel: number
  lighteningLevel: number
  smoothnessLevel: number
  sharpnessLevel: number
  rednessLevel: number
}

/**
 * 美颜档位预设。
 *
 * 声网 Beauty Effect 扩展通过 lightening、smoothness、sharpness、redness 四个维度
 * 调节效果。这里把常用组合封装成四档，避免用户在 UI 上面对多个滑块。
 */
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
  processor: ReturnType<BeautyExtension['createProcessor']>
  applyOptions: () => void
  cleanup: () => Promise<void>
}

/**
 * 管理声网基础美颜扩展的 processor 实例与档位状态。
 *
 * 该 composable 不负责 pipe、init 或 enable。因为美颜和背景模糊两个扩展需要
 * 按固定顺序串接到同一条视频处理链上，这些操作由上层统一处理，避免互相覆盖。
 */
export function useAgoraBeautyEffect(): UseAgoraBeautyEffectReturn {
  const beautyLevel = ref<BeautyLevel>('off')

  // 使用已注册的同一个 extension 实例创建 processor，避免 "Extension not registered yet" 错误。
  const extension = getBeautyExtension()
  const processor = extension.createProcessor()

  function setBeautyLevel(level: BeautyLevel) {
    beautyLevel.value = level
  }

  /**
   * 将当前档位参数设置到 processor。
   * 上层在确认档位不为 off 且 pipeline 已组装后调用。
   */
  function applyOptions() {
    if (beautyLevel.value === 'off') return
    processor.setOptions(PRESETS[beautyLevel.value])
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
    beautyLevel,
    setBeautyLevel,
    processor,
    applyOptions,
    cleanup,
  }
}
