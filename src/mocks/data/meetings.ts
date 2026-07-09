import type { Meeting } from '@/shared/types'

export const mockMeetings: Meeting[] = [
  { id: '123-456-789', title: '产品周会', hostId: 'u1', startTime: new Date().toISOString(), status: 'scheduled' },
  { id: '987-654-321', title: '技术分享', hostId: 'u2', startTime: new Date().toISOString(), status: 'live' },
]
