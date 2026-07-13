// / <reference types="vite/client" />

/**
 * 声网扩展包的类型声明兜底。
 *
 * 这些扩展包可能没有完整导出 TypeScript 类型，或当前尚未安装 node_modules，
 * 为避免类型检查失败，这里提供最小化的模块声明。
 */
declare module 'agora-extension-beauty-effect' {
  import type { IExtension, IVideoProcessor } from 'agora-rtc-sdk-ng'

  interface BeautyOptions {
    lighteningContrastLevel?: number
    lighteningLevel?: number
    smoothnessLevel?: number
    sharpnessLevel?: number
    rednessLevel?: number
  }

  export default class BeautyExtension implements IExtension {
    createProcessor(): IVideoProcessor & {
      setOptions(options: BeautyOptions): void
      enable(): Promise<void>
      disable(): Promise<void>
      enabled: boolean
    }
  }
}

declare module 'agora-extension-virtual-background' {
  import type { IExtension, IVideoProcessor } from 'agora-rtc-sdk-ng'

  interface VirtualBackgroundOptions {
    type: 'blur' | 'img' | 'color'
    blurDegree?: number
    source?: HTMLImageElement | HTMLVideoElement | MediaStreamTrack | ImageData | string
    color?: string
  }

  export default class VirtualBackgroundExtension implements IExtension {
    checkCompatibility(): boolean
    createProcessor(): IVideoProcessor & {
      init(wasmDir: string): Promise<void>
      setOptions(options: VirtualBackgroundOptions): void
      enable(): Promise<void>
      disable(): Promise<void>
      enabled: boolean
    }
  }
}
