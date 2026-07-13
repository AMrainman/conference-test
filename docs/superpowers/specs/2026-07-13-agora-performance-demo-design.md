# 声网多人视频性能测试 Demo 设计文档

## 背景

需要在本项目基础上快速搭建一个声网多人视频性能测试 Demo，用于验证同一频道内最多可容纳多少人时开始出现卡顿。Demo 无需登录，打开链接后自动开启摄像头和麦克风，并允许随时关闭音视频。

## 目标

1. 用户通过后台生成的链接进入同一声网频道。
2. 进入页面后自动获取摄像头/麦克风权限并加入频道。
3. 自动订阅所有远端用户的音视频流。
4. 提供麦克风、摄像头开关控制。
5. 在界面上实时展示本地/远端性能指标（码率、帧率、分辨率、延迟、网络质量）。
6. 界面风格参考 `MeetingRoomView.vue`。

## 非目标

- 不实现登录、昵称设置、聊天、参会者列表面板。
- 不实现屏幕共享、录制、白板等会议高级功能。
- 不解决 Token 安全问题（测试 Demo 使用固定配置）。

## 方案选型

采用**方案 1：复用现有会议骨架 + 声网 Web SDK**。

- 复用 `MeetingRoomView.vue` 的 Header、VideoGrid、MeetingToolbar 布局。
- 新增独立路由 `/demo/:channelId`，避免污染现有会议流程。
- 声网相关状态内聚在自定义 composable 中，不混入 `meetingStore`。

## 路由设计

```text
/demo/:channelId   -> 声网性能测试房间
```

- `channelId` 由后台生成并嵌入链接中。
- 所有访问同一 `channelId` 的用户进入同一个声网频道。

## SDK 集成

### 依赖

新增运行时依赖：

```bash
npm install agora-rtc-sdk-ng
```

### Composable：useAgoraChannel

新增 `src/features/agora-demo/composables/useAgoraChannel.ts`，职责如下：

- 创建 `IAgoraRTCClient`（模式为 `rtc`）。
- 创建本地麦克风/摄像头轨道。
- 调用 `client.join(appId, channelId, token, uid)` 加入频道。
- 发布本地轨道。
- 监听事件：
  - `user-published`：订阅远端用户的音视频轨道。
  - `user-unpublished`：取消订阅并清理对应轨道。
  - `user-left`：从远端用户列表移除。
- 提供 `toggleMic()`、`toggleCamera()`、`leave()`。
- 暴露响应式数据：
  - `joined`
  - `localUser`
  - `remoteUsers`
  - `isMuted`
  - `isVideoOff`
  - `networkQuality`
  - `localStats`
  - `remoteStats`
  - `error`

### Stats 轮询

在 composable 内部启动 `setInterval`（间隔 2 秒），调用以下接口收集性能数据：

- `client.getLocalAudioStats()`
- `client.getLocalVideoStats()`
- `client.getRemoteAudioStats()`
- `client.getRemoteVideoStats()`
- `client.getRTCStats()`
- `client.getNetworkQuality()`

清理时（`leave` 或组件卸载）清除 interval。

## 状态管理

不扩展 `meetingStore`。所有声网状态内聚在 `useAgoraChannel` 中返回的响应式对象里。

```ts
{
  joined: boolean
  localUser: { uid: string; displayName: string }
  remoteUsers: RemoteUserWithStats[]
  isMuted: boolean
  isVideoOff: boolean
  networkQuality: NetworkQuality
  localStats: LocalStats
  remoteStats: Record<UID, RemoteStats>
  error: string | null
  join: () => Promise<void>
  toggleMic: () => void
  toggleCamera: () => void
  leave: () => Promise<void>
}
```

## UI 设计

### 页面：AgoraDemoView.vue

新增 `src/features/agora-demo/views/AgoraDemoView.vue`，结构参考 `MeetingRoomView.vue`：

- 顶部 `MeetingHeader`：显示"性能测试"标题和当前 `channelId`。
- 主体左侧：
  - `VideoGrid`：展示本地 + 所有远端视频画面。
  - `MeetingToolbar`：麦克风、摄像头、离开按钮。
- 不展示侧边栏（无需聊天/参会者列表面板）。

### VideoTile 改造

扩展 `src/shared/components/VideoTile.vue`：

- 新增 `videoTrack` prop（`IVideoTrack | undefined`）。
- 如果有 `videoTrack`，将 `<video>` 元素的 `srcObject` 绑定到真实 MediaStream，并调用 `videoTrack.play(videoElement)`。
- 如果 `isVideoOff` 或没有 `videoTrack`，保持原有 Avatar 占位。

### VideoGrid 改造

扩展 `src/features/meeting-room/components/VideoGrid.vue`：

- 新增 `remoteUsers` prop。
- 第一个格子渲染本地视频（`localVideoTrack`）。
- 后续格子按 `remoteUsers` 渲染远端视频。
- 保持现有 `@container` 网格响应式布局。

### 性能指标展示

#### 本地指标

在 Header 或工具栏上方展示一行小字：

```text
上行 1.2Mbps / 30fps / 延迟 68ms / 网络质量 优
```

#### 远端指标

在每个 `VideoTile` 的右下角叠加一个半透明小面板：

```text
用户 8f3a
下行 0.8Mbps
1280x720 @ 25fps
网络 良
```

#### 网络质量圆点

- 绿色：优
- 黄色：良/一般
- 红色：差

### 日志导出

工具栏增加"复制 Stats 日志"按钮，将最近一段时间的本地/远端 stats 序列化到剪贴板，方便测试后分析。

## 入会流程

1. 用户访问 `/demo/:channelId`。
2. `AgoraDemoView.vue` 的 `onMounted` 中调用 `useAgoraChannel().join()`。
3. `join()` 内部：
   - 生成随机昵称 `用户 ${random(4)}`。
   - 调用 `AgoraRTC.createMicrophoneAndCameraTracks()` 获取本地轨道（此时浏览器会弹出权限申请）。
   - 权限通过后调用 `client.join(...)` 加入频道。
   - 调用 `client.publish([localAudioTrack, localVideoTrack])` 发布本地流。
4. 如果任何步骤失败，`error` 被设置，页面中央显示错误和"重试"按钮。

## 错误处理

| 场景 | 处理 |
|---|---|
| 摄像头/麦克风权限被拒绝 | 页面中央提示用户手动开启权限，提供重试按钮 |
| 加入频道失败 | 显示声网错误码 + 中文说明 |
| 本地轨道创建失败 | 提示检查设备 |
| 页面刷新/关闭 | 在 `beforeunload` 和 `onUnmounted` 中调用 `leave()`，unpublish 并释放轨道 |

## 配置

新增 `src/features/agora-demo/config.ts`：

```ts
export const AGORA_APP_ID = '你的 AppID'

// 无证书项目填 null；有证书项目填临时 Token
export const AGORA_TOKEN: string | null = null
```

测试 Demo 不考虑安全，直接写死在代码中。后续如需多环境配置，可改为读取 `import.meta.env.VITE_AGORA_APP_ID`。

## 文件清单

- 新增
  - `src/features/agora-demo/views/AgoraDemoView.vue`
  - `src/features/agora-demo/composables/useAgoraChannel.ts`
  - `src/features/agora-demo/config.ts`
- 修改
  - `src/app/router.ts`（新增 `/demo/:channelId` 路由）
  - `src/shared/components/VideoTile.vue`（支持真实 video track）
  - `src/features/meeting-room/components/VideoGrid.vue`（支持远端用户列表）
  - `package.json`（新增 `agora-rtc-sdk-ng` 依赖）

## 后续可扩展

- 通过 URL query 参数控制默认是否开启视频/音频，例如 `/demo/:channelId?video=0&audio=1`。
- 增加"只订阅音频"模式，用于纯音频压力测试。
- 将 stats 数据发送到后端或控制台，做更长时间的性能分析。
