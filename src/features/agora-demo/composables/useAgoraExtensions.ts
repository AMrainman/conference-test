import AgoraRTC from 'agora-rtc-sdk-ng'
import BeautyExtension from 'agora-extension-beauty-effect'
import VirtualBackgroundExtension from 'agora-extension-virtual-background'

/**
 * 模块级单例，缓存声网扩展实例并确保只注册一次。
 *
 * 声网 Web SDK 要求：
 * 1. 扩展必须在 AgoraRTC.createClient 之前注册；
 * 2. registerExtensions 时传入的 extension 实例，必须与后续 createProcessor 的实例相同。
 * 因此把两个扩展实例缓存在模块顶层，在组件 setup 执行 import 时完成注册，
 * 早于 onMounted 中调用 join() 创建 client 的时机。
 */
let registered = false
const beautyExtension = new BeautyExtension()
const virtualBackgroundExtension = new VirtualBackgroundExtension()

export function registerAgoraExtensions(): void {
  if (registered) return
  AgoraRTC.registerExtensions([beautyExtension, virtualBackgroundExtension])
  registered = true
}

export function getBeautyExtension(): BeautyExtension {
  registerAgoraExtensions()
  return beautyExtension
}

export function getVirtualBackgroundExtension(): VirtualBackgroundExtension {
  registerAgoraExtensions()
  return virtualBackgroundExtension
}
