import { http, HttpResponse } from 'msw'

import type { JoinMeetingPayload } from '@/shared/types'

import { MOCK_MESSAGE_TIMESTAMP } from './data/constants'
import { mockMeetings } from './data/meetings'
import { generateMockParticipantId } from './data/participantIds'

function generateMessageId(content: string): string {
  return `msg-${content.length}-${content.slice(0, 5)}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidJoinPayload(body: unknown): body is JoinMeetingPayload {
  return isObject(body) && typeof body.displayName === 'string' && body.displayName.trim().length > 0
}

export const handlers = [
  http.get('/api/meetings', () => {
    return HttpResponse.json({ data: mockMeetings })
  }),

  http.get('/api/meetings/:id', ({ params }) => {
    const meeting = mockMeetings.find(m => m.id === params.id)
    if (!meeting) return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    return HttpResponse.json({ data: meeting })
  }),

  http.post('/api/meetings/:id/join', async ({ params, request }) => {
    const meeting = mockMeetings.find(m => m.id === params.id)
    if (!meeting) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!isValidJoinPayload(body)) {
      return HttpResponse.json({ error: 'displayName is required and must be a string' }, { status: 400 })
    }

    return HttpResponse.json({
      data: {
        meetingId: params.id,
        participantId: generateMockParticipantId(),
        displayName: body.displayName,
      },
    })
  }),

  http.post('/api/meetings/:id/messages', async ({ params, request }) => {
    const meeting = mockMeetings.find(m => m.id === params.id)
    if (!meeting) {
      return HttpResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    if (!isObject(body) || typeof body.content !== 'string') {
      return HttpResponse.json({ error: 'content is required and must be a string' }, { status: 400 })
    }

    if (!body.content.trim()) {
      return HttpResponse.json({ error: 'content is required and must be a string' }, { status: 400 })
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
