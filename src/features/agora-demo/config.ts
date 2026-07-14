/**
 * 声网性能测试 Demo 配置
 * 测试阶段直接写死，生产环境应改为后端签发 Token 或环境变量注入。
 */
import type { VideoQualityLevel, VideoQualityPreset } from './types'

export const AGORA_APP_ID = '6510430cd3c8484e8e7b1fb32df77500'

// 无证书项目填 null；有证书项目填临时 Token
export const AGORA_TOKEN: string | null =
  '0066112165ff8d94702a84b161af4c72690IADWxNM7YOB95BNYyAEiFiH55tUA48H3RtYVF+sB1o699aF4E7IAAAAAIgCCK2XEg0lXagQAAQCjhFZqAgCjhFZqAwCjhFZqBACjhFZq'

/**
 * 本地视频推流质量档位。
 * fluent 侧重弱网保活，hd 侧重画质；根据网络质量可动态切换。
 */
export const VIDEO_QUALITY_PRESETS: Record<VideoQualityLevel, VideoQualityPreset> = {
  fluent: { label: '流畅', encoderConfig: '360p_1' },
  sd: { label: '标清', encoderConfig: '480p_1' },
  hd: { label: '高清', encoderConfig: '720p_2' },
  hdplus: { label: '超清', encoderConfig: '1080p_2' },
}
