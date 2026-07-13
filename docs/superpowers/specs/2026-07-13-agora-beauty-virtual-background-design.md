# Agora Demo 美颜与背景模糊功能设计

## 背景

`src/features/agora-demo/views/AgoraDemoView.vue` 当前仅支持基础的音视频通话与统计展示。为了提升会议体验，需要在该页面增加美颜和背景模糊功能。

## 目标

- 在 `AgoraDemoView` 页面中集成声网美颜扩展与虚拟背景扩展。
- 在 `MeetingToolbar` 中提供用户控制入口：美颜档位、背景模糊档位。
- 保持现有频道管理逻辑不变，新增功能以独立 composable 形式实现。
- 用户离开频道后重新加入时，自动恢复上一次选择的美颜/模糊档位。

## 调研结论

### SDK 版本

当前项目依赖 `agora-rtc-sdk-ng: ^4.24.5`，已满足两个扩展的最低版本要求：

- `agora-extension-virtual-background` 要求 Web SDK ≥ v4.10.0
- `agora-extension-beauty-effect` 要求 Web SDK ≥ v4.12.0

因此**无需升级 SDK**。

### 扩展包

| 功能 | npm 包 | 说明 |
| --- | --- | --- |
| 背景模糊 | `agora-extension-virtual-background` | 支持模糊、纯色、图片、视频背景。本项目仅使用模糊。 |
| 基础美颜 | `agora-extension-beauty-effect` | 支持美白、磨皮、锐化、红润等参数调节。 |

### 高级美颜

声网中文文档中的"高级美颜"目前仅面向 Windows Native SDK（v4.5.2.9 ~ v4.6.0），Web 端没有对应方案。本项目不考虑。

### 浏览器兼容性

- 两个扩展均推荐在桌面版 Chrome 使用，并开启硬件加速。
- Beauty Effect 扩展不支持 Safari 15.4 以下版本。
- 移动端不推荐使用美颜和背景模糊。
- Virtual Background 扩展提供 `checkCompatibility()` 方法用于运行时检测。

## 架构设计

新增两个独立的组合式函数，各自管理一个扩展的生命周期：

- `src/features/agora-demo/composables/useAgoraBeautyEffect.ts`
- `src/features/agora-demo/composables/useAgoraVirtualBackground.ts`

修改现有文件：

- `src/features/agora-demo/composables/useAgoraChannel.ts`：在返回值中暴露 `localVideoTrack`。
- `src/features/agora-demo/views/AgoraDemoView.vue`：组合 `useAgoraChannel`、美颜 composable、背景模糊 composable，并把控制状态绑定到 `MeetingToolbar`。
- `src/features/meeting-room/components/MeetingToolbar.vue`：新增美颜和背景模糊两个下拉选择。

## 数据流

```text
AgoraDemoView
  ├─ useAgoraChannel(channelId) → localVideoTrack
  ├─ useAgoraBeautyEffect(localVideoTrack) → beautyLevel, setBeautyLevel
  └─ useAgoraVirtualBackground(localVideoTrack) → blurLevel, setBlurLevel

MeetingToolbar
  ├─ props: beautyLevel, blurLevel
  └─ emits: update:beauty-level, update:blur-level
```

- `AgoraDemoView` 把 `beautyLevel` 和 `blurLevel` 作为 props 传给 `MeetingToolbar`。
- 用户在 `MeetingToolbar` 切换档位后，通过事件回传新值。
- `AgoraDemoView` 调用对应的 `setBeautyLevel` / `setBlurLevel` 调整效果。

## 视频处理流水线

当两个效果同时开启时，本地视频轨道按以下顺序串接：

```text
cameraTrack
  → beautyProcessor
  → virtualBackgroundProcessor
  → cameraTrack.processorDestination
```

- 美颜处理在前，背景模糊在后，这样背景模糊不会把美颜处理后的皮肤细节再次模糊。
- 每个 composable 只负责把自己的 processor 插入到当前流水线中的合适位置。

## 档位设计

### 美颜

| 档位 | 效果 |
| --- | --- |
| 关闭 | 不启用美颜 processor |
| 低 | 轻微磨皮 + 美白 |
| 中 | 中等磨皮 + 美白 + 红润 |
| 高 | 较强磨皮 + 美白 + 红润 + 锐化 |

具体参数值参考官方 `BeautyEffectOptions` 设置。

### 背景模糊

| 档位 | 效果 |
| --- | --- |
| 关闭 | 不启用虚拟背景 processor |
| 低 | `blurDegree: 1` |
| 中 | `blurDegree: 2` |
| 高 | `blurDegree: 3` |

## 状态持久化

- 美颜档位和模糊档位用 `ref` 保存在各自 composable 内部。
- 当 `localVideoTrack` 变化（例如用户重新加入频道）时，composable 自动用当前档位重新初始化 processor。
- 不写入 `localStorage`，仅在当前页面生命周期内保持。

## 错误处理

- 扩展注册或 processor 初始化失败时，返回可读的 `error` 提示，例如"当前浏览器不支持背景模糊"。
- 如果扩展加载失败，UI 下拉菜单仍然可用，但实际效果不会生效，并给出文字提示。
- 切换档位时的异步操作必须 catch 错误，避免阻塞界面。
- 重新加入频道时，如果扩展初始化失败，记录错误但不应阻止用户正常通话。

## 代码注释

按项目要求，在以下文件中增加中文注释，解释关键逻辑和"为什么"：

- `src/features/agora-demo/composables/useAgoraChannel.ts`
- `src/features/agora-demo/composables/useAgoraBeautyEffect.ts`（新增）
- `src/features/agora-demo/composables/useAgoraVirtualBackground.ts`（新增）

注释重点：

- processor 的创建和销毁时机
- 为什么需要 `pipe` 和 `processorDestination`
- 多个 processor 串联的顺序原因
- 重新加入频道时如何复用/重建 processor

## 依赖变更

需要新增两个 npm 依赖：

```bash
npm install agora-extension-virtual-background agora-extension-beauty-effect
```

> 注意：WSL 环境下不执行 `npm install`，由用户在 WSL 或 Windows 终端中手动安装。

## 后续可能优化

- 当前仅支持背景模糊，如需支持纯色/图片/视频背景，可在 `useAgoraVirtualBackground` 中扩展 `setOptions` 的参数类型。
- 移动端兼容性提示可进一步细化。
- 可考虑在 Settings 面板中提供更细粒度的美颜参数调节。

## 参考

- [Virtual Background | Agora Docs](https://docs.agora.io/en/video-calling/advanced-features/virtual-background)
- [Beauty Effect (Beta) | Agora Docs](https://docs.agora.io/en/video-calling/advanced-features/beauty-effect?platform=web)
- [agora-extension-virtual-background on NPM](https://www.npmjs.com/package/agora-extension-virtual-background)
- [agora-extension-beauty-effect on NPM](https://www.npmjs.com/package/agora-extension-beauty-effect)
- [高级美颜 | 声网文档中心](https://doc.shengwang.cn/doc/rtc/windows/advanced-features/advanced-beauty)
