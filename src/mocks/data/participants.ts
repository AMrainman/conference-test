import type { Participant } from '@/shared/types'

export const mockParticipants: Participant[] = [
  { id: 'u1', displayName: '张三', isHost: true, isMuted: false, isVideoOff: false },
  { id: 'u2', displayName: '李四', isHost: false, isMuted: true, isVideoOff: false },
  { id: 'u3', displayName: '王五', isHost: false, isMuted: false, isVideoOff: true },
]
