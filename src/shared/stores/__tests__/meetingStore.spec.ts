// @vitest-environment jsdom
import { http, HttpResponse } from 'msw'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { server } from '@/mocks/server'
import { resetMockParticipantIds } from '@/mocks/data/participantIds'
import type { Meeting } from '@/shared/types'

import { useMeetingStore } from '../meetingStore'

const mockMeeting: Meeting = {
  id: '123-456-789',
  title: '测试会议',
  hostId: 'host-user',
  startTime: '2024-01-01T10:00:00.000Z',
  status: 'live',
}

describe('meetingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resetMockParticipantIds()
  })

  it('join 成功后应设置 currentMeeting 和 localUser', async () => {
    server.use(
      http.get('/api/meetings/:id', () => {
        return HttpResponse.json({ data: mockMeeting })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')

    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.currentMeeting).toEqual(mockMeeting)
    expect(store.localUser).toEqual({
      id: 'mock-participant-1',
      displayName: '测试用户',
      isHost: false,
      isMuted: false,
      isVideoOff: false,
    })
    expect(store.participants).toEqual([
      {
        id: 'mock-participant-1',
        displayName: '测试用户',
        isHost: false,
        isMuted: false,
        isVideoOff: false,
      },
    ])
  })

  it('join 失败时应设置 error 并清理会议状态', async () => {
    server.use(
      http.post('/api/meetings/:id/join', () => {
        return HttpResponse.json({ error: '会议已结束' }, { status: 403 })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')

    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('会议已结束')
    expect(store.currentMeeting).toBeNull()
    expect(store.localUser).toBeNull()
    expect(store.participants).toEqual([])
  })

  it('join 时 POST /join 成功但 GET /meetings/:id 失败应清理状态', async () => {
    server.use(
      http.get('/api/meetings/:id', () => {
        return HttpResponse.json({ error: '获取会议信息失败' }, { status: 500 })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')

    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('获取会议信息失败')
    expect(store.currentMeeting).toBeNull()
    expect(store.localUser).toBeNull()
    expect(store.participants).toEqual([])
  })

  it('toggleMute 应切换 isMuted 并同步更新 localUser', () => {
    const store = useMeetingStore()
    store.localUser = {
      id: 'local-user',
      displayName: '本地用户',
      isHost: true,
      isMuted: false,
      isVideoOff: false,
    }

    store.toggleMute()
    expect(store.isMuted).toBe(true)
    expect(store.localUser.isMuted).toBe(true)

    store.toggleMute()
    expect(store.isMuted).toBe(false)
    expect(store.localUser.isMuted).toBe(false)
  })

  it('toggleVideo 应切换 isVideoOff 并同步更新 localUser', () => {
    const store = useMeetingStore()
    store.localUser = {
      id: 'local-user',
      displayName: '本地用户',
      isHost: true,
      isMuted: false,
      isVideoOff: false,
    }

    store.toggleVideo()
    expect(store.isVideoOff).toBe(true)
    expect(store.localUser.isVideoOff).toBe(true)

    store.toggleVideo()
    expect(store.isVideoOff).toBe(false)
    expect(store.localUser.isVideoOff).toBe(false)
  })

  it('isHost getter 应判断当前用户是否为会议主持人', () => {
    const store = useMeetingStore()
    expect(store.isHost).toBe(false)

    store.currentMeeting = { id: 'm1', title: 'Test', hostId: 'host-user', startTime: '', status: 'live' }
    store.localUser = {
      id: 'host-user',
      displayName: '主持人',
      isHost: false,
      isMuted: false,
      isVideoOff: false,
    }

    expect(store.isHost).toBe(true)

    store.currentMeeting = { id: 'm2', title: 'Test', hostId: 'another-host', startTime: '', status: 'live' }

    expect(store.isHost).toBe(false)
  })

  it('sendMessage 应在当前会议中发送消息并追加到 messages', async () => {
    server.use(
      http.get('/api/meetings/:id', () => {
        return HttpResponse.json({ data: mockMeeting })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')

    await store.sendMessage('你好，世界')

    expect(store.error).toBeNull()
    expect(store.messages).toHaveLength(1)
    expect(store.messages[0]).toMatchObject({
      senderId: 'local-user',
      senderName: '我',
      content: '你好，世界',
    })
  })

  it('sendMessage 在没有 currentMeeting 时应设置错误', async () => {
    const store = useMeetingStore()
    await store.sendMessage('未加入会议的消息')

    expect(store.error).toBe('当前不在会议中，无法发送消息')
    expect(store.messages).toHaveLength(0)
  })

  it('sendMessage 失败时应设置 error 且不改变 messages', async () => {
    server.use(
      http.get('/api/meetings/:id', () => {
        return HttpResponse.json({ data: mockMeeting })
      }),
      http.post('/api/meetings/:id/messages', () => {
        return HttpResponse.json({ error: '发送消息失败' }, { status: 500 })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')
    const previousMessages = [...store.messages]

    await store.sendMessage('你好，世界')

    expect(store.error).toBe('发送消息失败')
    expect(store.messages).toEqual(previousMessages)
  })

  it('leave 应清空会议相关状态', async () => {
    server.use(
      http.get('/api/meetings/:id', () => {
        return HttpResponse.json({ data: mockMeeting })
      })
    )

    const store = useMeetingStore()
    await store.join('123-456-789', '测试用户')
    store.messages.push({
      id: 'msg-1',
      senderId: 'local-user',
      senderName: '我',
      content: '测试消息',
      timestamp: '2024-01-01T10:00:00.000Z',
    })

    store.leave()

    expect(store.currentMeeting).toBeNull()
    expect(store.localUser).toBeNull()
    expect(store.messages).toHaveLength(0)
    expect(store.isMuted).toBe(false)
    expect(store.isVideoOff).toBe(false)
    expect(store.error).toBeNull()
  })
})
