import { ref, watch, type Ref } from 'vue'

import type { NetworkQualitySnapshot, VideoQualityLevel } from '../types'

interface UseAgoraAutoQualityOptions {
  /** 连续几次检测到差网络后触发降级 */
  poorThreshold?: number
  /** 连续几次检测到良好网络后尝试恢复 */
  goodThreshold?: number
}

const ORDERED_LEVELS: VideoQualityLevel[] = ['fluent', 'sd', 'hd', 'hdplus']

/**
 * 根据声网上行网络质量自动调整本地视频推流清晰度。
 *
 * 规则：
 * - 上行质量 ≥ 4（差/极差）连续达到阈值时，降低一档（不会低于 fluent）。
 * - 上行质量 ≤ 2（优/良）连续达到阈值，且当前档位低于用户偏好时，向偏好档位恢复一档。
 * - 用户手动切换档位会同时更新偏好档位；自动降级只改当前档位，不改偏好档位。
 */
export function useAgoraAutoQuality(
  networkQuality: Ref<NetworkQualitySnapshot>,
  currentLevel: Ref<VideoQualityLevel>,
  preferredLevel: Ref<VideoQualityLevel>,
  setQuality: (level: VideoQualityLevel, options?: { updatePreferred?: boolean }) => Promise<void> | void,
  options: UseAgoraAutoQualityOptions = {}
) {
  const { poorThreshold = 2, goodThreshold = 3 } = options

  const isAutoDegraded = ref(false)
  const autoDegradedReason = ref<string | null>(null)

  let poorCount = 0
  let goodCount = 0
  let isAdjusting = false

  function getLevelIndex(level: VideoQualityLevel): number {
    return ORDERED_LEVELS.indexOf(level)
  }

  watch(
    () => networkQuality.value.uplink,
    async level => {
      if (isAdjusting) return

      // 声网网络质量：0=未知，1=优，2=良，3=一般，4=差，5=极差，6=断开
      if (level >= 4) {
        poorCount++
        goodCount = 0

        const currentIndex = getLevelIndex(currentLevel.value)
        if (currentIndex === 0) {
          // 已降至最低档，停止计数避免无限增长
          poorCount = 0
          return
        }

        if (poorCount >= poorThreshold) {
          const nextLevel = ORDERED_LEVELS[currentIndex - 1]
          isAdjusting = true
          try {
            await setQuality(nextLevel, { updatePreferred: false })
            isAutoDegraded.value = true
            autoDegradedReason.value = '网络质量较差，已自动降低清晰度'
          } finally {
            isAdjusting = false
            poorCount = 0
          }
        }
      } else if (level <= 2) {
        goodCount++
        poorCount = 0

        if (!isAutoDegraded.value) {
          goodCount = 0
          return
        }

        const currentIndex = getLevelIndex(currentLevel.value)
        const preferredIndex = getLevelIndex(preferredLevel.value)
        if (goodCount >= goodThreshold && currentIndex < preferredIndex) {
          const nextLevel = ORDERED_LEVELS[currentIndex + 1]
          isAdjusting = true
          try {
            await setQuality(nextLevel, { updatePreferred: false })
            if (nextLevel === preferredLevel.value) {
              isAutoDegraded.value = false
              autoDegradedReason.value = null
            }
          } finally {
            isAdjusting = false
            goodCount = 0
          }
        }
      } else {
        // 网络质量一般时不改变计数，避免频繁震荡
        poorCount = 0
        goodCount = 0
      }
    }
  )

  function reset() {
    isAutoDegraded.value = false
    autoDegradedReason.value = null
    poorCount = 0
    goodCount = 0
  }

  return {
    isAutoDegraded,
    autoDegradedReason,
    reset,
  }
}
