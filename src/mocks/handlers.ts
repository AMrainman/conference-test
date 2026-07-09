import { http, HttpResponse } from 'msw'

import type { JoinMeetingPayload } from '@/shared/types'

import { mockMeetings } from './data/meetings'

export const handlers = [
  http.get('/api/meetings', () => {
    return HttpResponse.json({ data: mockMeetings })
  }),

  http.get('/api/meetings/:id', ({ params }) => {
    const meeting = mockMeetings.find((m) => m.id === params.id)
    if (!meeting) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ data: meeting })
  }),

  http.post('/api/meetings/:id/join', async ({ params, request }) => {
    const body = (await request.json()) as JoinMeetingPayload
    if (!body.displayName) {
      return HttpResponse.json({ error: 'displayName is required' }, { status: 400 })
    }
    return HttpResponse.json({
      data: {
        meetingId: params.id,
        participantId: 'local-user',
        displayName: body.displayName,
      },
    })
  }),

  http.post('/api/meetings/:id/messages', async ({ request }) => {
    const body = (await request.json()) as { content: string }
    if (!body.content) {
      return HttpResponse.json({ error: 'content is required' }, { status: 400 })
    }
    return HttpResponse.json({
      data: {
        id: `msg-${Date.now()}`,
        senderId: 'local-user',
        senderName: '我',
        content: body.content,
        timestamp: new Date().toISOString(),
      },
    })
  }),
]
