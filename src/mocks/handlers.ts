import { http, HttpResponse } from 'msw'

import type { JoinMeetingPayload } from '@/shared/types'

import { mockMeetings } from './data/meetings'

const MOCK_MESSAGE_TIMESTAMP = '2024-01-01T10:00:00.000Z'

function generateMessageId(content: string): string {
  return `msg-${content.length}-${content.slice(0, 5)}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidJoinPayload(body: unknown): body is JoinMeetingPayload {
  return isObject(body) && typeof body.displayName === 'string'
}

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
    const meeting = mockMeetings.find((m) => m.id === params.id)
    if (!meeting) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const body = await request.json()
    if (!isValidJoinPayload(body)) {
      return HttpResponse.json(
        { error: 'displayName is required and must be a string' },
        { status: 400 },
      )
    }

    return HttpResponse.json({
      data: {
        meetingId: params.id,
        participantId: 'local-user',
        displayName: body.displayName,
      },
    })
  }),

  http.post('/api/meetings/:id/messages', async ({ params, request }) => {
    const meeting = mockMeetings.find((m) => m.id === params.id)
    if (!meeting) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const body = await request.json()
    if (!isObject(body) || typeof body.content !== 'string') {
      return HttpResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 },
      )
    }

    if (!body.content) {
      return HttpResponse.json(
        { error: 'content is required and must be a string' },
        { status: 400 },
      )
    }

    return HttpResponse.json({
      data: {
        id: generateMessageId(body.content),
        senderId: 'local-user',
        senderName: '我',
        content: body.content,
        timestamp: MOCK_MESSAGE_TIMESTAMP,
      },
    })
  }),
]
