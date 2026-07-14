import type { IRemoteVideoTrack, IRemoteAudioTrack, UID, VideoEncoderConfigurationPreset } from 'agora-rtc-sdk-ng'

export type VideoQualityLevel = 'fluent' | 'sd' | 'hd' | 'hdplus'

export interface VideoQualityPreset {
  label: string
  encoderConfig: VideoEncoderConfigurationPreset
}

export interface AgoraLocalUser {
  uid: UID
  displayName: string
}

export interface AgoraRemoteUser {
  uid: UID
  displayName: string
  videoTrack?: IRemoteVideoTrack
  audioTrack?: IRemoteAudioTrack
  hasVideo: boolean
  hasAudio: boolean
}

export interface LocalStats {
  audioSendBitrate: number
  audioSendBytes: number
  audioSendPackets: number
  audioSendPacketsLost: number
  videoSendBitrate: number
  videoSendBytes: number
  videoSendPackets: number
  videoSendPacketsLost: number
  videoSendFrameRate?: number
  videoSendResolutionWidth?: number
  videoSendResolutionHeight?: number
}

export interface RemoteStats {
  uid: UID
  audioReceiveBitrate: number
  audioReceiveBytes: number
  audioReceivePackets: number
  audioReceivePacketsLost: number
  videoReceiveBitrate: number
  videoReceiveBytes: number
  videoReceivePackets: number
  videoReceivePacketsLost: number
  videoReceiveFrameRate?: number
  videoReceiveResolutionWidth?: number
  videoReceiveResolutionHeight?: number
}

export interface NetworkQualitySnapshot {
  uplink: number
  downlink: number
}
