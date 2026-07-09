// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { server } from './server'
import { resetMockParticipantIds } from './data/participantIds'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('handlers', () => {
  beforeEach(() => {
    resetMockParticipantIds()
  })
  it('GET /api/meetings 返回会议列表', async () => {
    const response = await fetch('/api/meetings')
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data).toHaveLength(2)
    expect(json.data[0].id).toBe('123-456-789')
  })

  it('GET /api/meetings/:id 对未知 id 返回 404', async () => {
    const response = await fetch('/api/meetings/unknown-id')
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error).toContain('Meeting not found')
  })

  it('POST /api/meetings/:id/join 缺少 displayName 返回 400', async () => {
    const response = await fetch('/api/meetings/123-456-789/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain('displayName')
  })

  it('POST /api/meetings/:id/join 对未知会议返回 404', async () => {
    const response = await fetch('/api/meetings/unknown-id/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: '测试用户' }),
    })
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error).toContain('Meeting not found')
  })

  it('GET /api/meetings/:id 返回指定会议', async () => {
    const response = await fetch('/api/meetings/123-456-789')
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data.id).toBe('123-456-789')
  })

  it('POST /api/meetings/:id/join 对有效输入返回成功载荷', async () => {
    const response = await fetch('/api/meetings/123-456-789/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: '测试用户' }),
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data).toEqual({
      meetingId: '123-456-789',
      participantId: 'mock-participant-1',
      displayName: '测试用户',
    })
  })

  it('POST /api/meetings/:id/join 空或纯空白 displayName 返回 400', async () => {
    for (const displayName of ['', '   ', '\t\n']) {
      const response = await fetch('/api/meetings/123-456-789/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain('displayName')
    }
  })

  it('POST /api/meetings/:id/join 多次调用生成唯一 participantId', async () => {
    const ids: string[] = []
    for (const displayName of ['用户一', '用户二']) {
      const response = await fetch('/api/meetings/123-456-789/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })
      expect(response.status).toBe(200)
      const json = await response.json()
      ids.push(json.data.participantId)
    }
    expect(ids).toEqual(['mock-participant-1', 'mock-participant-2'])
  })

  it('POST /api/meetings/:id/join 对非法 JSON 返回 400', async () => {
    const response = await fetch('/api/meetings/123-456-789/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid',
    })
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Invalid JSON body')
  })

  it('POST /api/meetings/:id/messages 空或纯空白内容返回 400', async () => {
    for (const content of ['', '   ', '\t\n']) {
      const response = await fetch('/api/meetings/123-456-789/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain('content')
    }
  })

  it('POST /api/meetings/:id/messages 对非法 JSON 返回 400', async () => {
    const response = await fetch('/api/meetings/123-456-789/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid',
    })
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe('Invalid JSON body')
  })

  it('POST /api/meetings/:id/messages 对未知会议返回 404', async () => {
    const response = await fetch('/api/meetings/unknown-id/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'hello' }),
    })
    expect(response.status).toBe(404)
  })

  it('POST /api/meetings/:id/messages 返回确定性消息 id 与时间戳', async () => {
    const response = await fetch('/api/meetings/123-456-789/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'hello' }),
    })
    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.data.id).toBe('msg-5-hello')
    expect(json.data.timestamp).toBe('2024-01-01T10:00:00.000Z')
  })
})
