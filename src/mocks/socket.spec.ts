// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MockWebSocket } from './socket'
import { resetMockParticipantIds } from './data/participantIds'

describe('MockWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetMockParticipantIds()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('连接后触发 open 事件并更新 readyState', () => {
    const onOpen = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('open', onOpen)

    vi.advanceTimersByTime(100)

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(ws.readyState).toBe(WebSocket.OPEN)
  })

  it('onopen 属性也会被调用', () => {
    const onOpen = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.onopen = onOpen

    vi.advanceTimersByTime(100)

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('处理 join 消息并触发 participant-joined 消息事件，data 为字符串', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'join' }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(1)
    const event = onMessage.mock.calls[0][0] as MessageEvent
    expect(typeof event.data).toBe('string')
    const payload = JSON.parse(event.data)
    expect(payload.type).toBe('participant-joined')
    expect(payload.participant.id).toBe('mock-participant-1')
    expect(payload.participant.displayName).toBe('匿名用户')
  })

  it('join 消息使用 payload 中的 displayName 并生成唯一 ID', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'join', displayName: 'Alice' }))
    ws.send(JSON.stringify({ type: 'join', displayName: 'Bob' }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(2)
    const first = JSON.parse(onMessage.mock.calls[0][0].data)
    const second = JSON.parse(onMessage.mock.calls[1][0].data)
    expect(first.participant.displayName).toBe('Alice')
    expect(first.participant.id).toBe('mock-participant-1')
    expect(second.participant.displayName).toBe('Bob')
    expect(second.participant.id).toBe('mock-participant-2')
  })

  it('连接未打开时 send 抛出 InvalidStateError', () => {
    const ws = new MockWebSocket('ws://localhost')
    expect(() => ws.send(JSON.stringify({ type: 'join' }))).toThrow(DOMException)
    expect(() => ws.send(JSON.stringify({ type: 'join' }))).toThrow(/InvalidStateError/)
  })

  it('处理 message 消息并触发 message-received 消息事件', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'message', content: 'hello' }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(1)
    const event = onMessage.mock.calls[0][0] as MessageEvent
    const payload = JSON.parse(event.data)
    expect(payload.type).toBe('message-received')
    expect(payload.message.content).toBe('hello')
    expect(payload.message.id).toBe('msg-5-hello')
    expect(payload.message.timestamp).toBe('2024-01-01T10:00:00.000Z')
  })

  it('收到无效 JSON 时触发 error 事件', () => {
    const onError = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('error', onError)

    vi.advanceTimersByTime(100)
    ws.send('not-json')

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('支持 addEventListener 与 removeEventListener', () => {
    const listener = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('open', listener)
    ws.removeEventListener('open', listener)

    vi.advanceTimersByTime(100)

    expect(listener).not.toHaveBeenCalled()
  })

  it('处理 leave 消息并触发 participant-left 消息事件', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'leave', participantId: 'u3' }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(1)
    const event = onMessage.mock.calls[0][0] as MessageEvent
    const payload = JSON.parse(event.data)
    expect(payload.type).toBe('participant-left')
    expect(payload.participantId).toBe('u3')
  })

  it('处理 mute 消息并触发 mute-changed 消息事件', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'mute', participantId: 'u3', isMuted: false }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(1)
    const event = onMessage.mock.calls[0][0] as MessageEvent
    const payload = JSON.parse(event.data)
    expect(payload.type).toBe('mute-changed')
    expect(payload.participantId).toBe('u3')
    expect(payload.isMuted).toBe(false)
  })

  it('处理 host 消息并触发 host-changed 消息事件', () => {
    const onMessage = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('message', onMessage)

    vi.advanceTimersByTime(100)
    ws.send(JSON.stringify({ type: 'host', participantId: 'u3', isHost: true }))
    vi.advanceTimersByTime(300)

    expect(onMessage).toHaveBeenCalledTimes(1)
    const event = onMessage.mock.calls[0][0] as MessageEvent
    const payload = JSON.parse(event.data)
    expect(payload.type).toBe('host-changed')
    expect(payload.participantId).toBe('u3')
    expect(payload.isHost).toBe(true)
  })

  it('onerror 回调在收到无效 JSON 时被触发', () => {
    const onError = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.onerror = onError

    vi.advanceTimersByTime(100)
    ws.send('not-json')

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('close 方法触发 close 事件并更新 readyState', () => {
    const onClose = vi.fn()
    const ws = new MockWebSocket('ws://localhost')
    ws.addEventListener('close', onClose)

    ws.close()

    expect(ws.readyState).toBe(WebSocket.CLOSED)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
