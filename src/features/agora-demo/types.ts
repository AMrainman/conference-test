import type { IRemoteVideoTrack, IRemoteAudioTrack, UID } from 'agora-rtc-sdk-ng'

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
  audioSendBytes: number
  audioSendPackets: number
  audioSendPacketsLost: number
  videoSendBytes: number
  videoSendPackets: number
  videoSendPacketsLost: number
  videoSendFrameRate?: number
  videoSendResolutionWidth?: number
  videoSendResolutionHeight?: number
}

export interface RemoteStats {
  uid: UID
  audioReceiveBytes: number
  audioReceivePackets: number
  audioReceivePacketsLost: number
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
