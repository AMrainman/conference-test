export type Theme = 'system' | 'light' | 'dark'

export interface User {
  id: string
  displayName: string
  avatarUrl?: string
}

export interface Participant extends User {
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
}

export interface Meeting {
  id: string
  title: string
  hostId: string
  startTime: string
  status: 'scheduled' | 'live' | 'ended'
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

export interface JoinMeetingPayload {
  meetingId: string
  displayName: string
}
