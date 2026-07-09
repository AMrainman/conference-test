import type { Meeting } from '@/shared/types'

export const mockMeetings: Meeting[] = [
  { id: '123-456-789', title: '产品周会', hostId: 'u1', startTime: '2024-01-01T10:00:00.000Z', status: 'scheduled' },
  { id: '987-654-321', title: '技术分享', hostId: 'u2', startTime: '2024-01-01T14:00:00.000Z', status: 'live' },
]
