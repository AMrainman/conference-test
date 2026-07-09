// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import { server } from './server'

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
