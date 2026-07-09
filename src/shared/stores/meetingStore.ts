import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { ChatMessage, Meeting, Participant } from '@/shared/types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function hasStringFields<T extends Record<string, string>>(
  value: unknown,
  fields: T
): value is Record<keyof T, string> {
  if (!isRecord(value)) {
    return false
  }
  return Object.entries(fields).every(([key, type]) => typeof value[key] === type)
}

function isMeeting(value: unknown): value is Meeting {
  return (
    hasStringFields(value, {
      id: 'string',
      title: 'string',
      hostId: 'string',
      startTime: 'string',
      status: 'string',
    }) && ['scheduled', 'live', 'ended'].includes(value.status)
  )
}

function isJoinData(value: unknown): value is { meetingId: string; participantId: string; displayName: string } {
  return hasStringFields(value, {
    meetingId: 'string',
    participantId: 'string',
    displayName: 'string',
  })
}

function isChatMessage(value: unknown): value is ChatMessage {
  return hasStringFields(value, {
    id: 'string',
    senderId: 'string',
    senderName: 'string',
    content: 'string',
    timestamp: 'string',
  })
}

function extractData<T>(value: unknown, guard: (value: unknown) => value is T): T {
  if (!isRecord(value) || !('data' in value)) {
    throw new Error('接口返回格式异常')
  }
  const data = value.data
  if (!guard(data)) {
    throw new Error('接口返回数据格式异常')
  }
  return data
}

export const useMeetingStore = defineStore('meeting', () => {
  // 当前会议信息
  const currentMeeting = ref<Meeting | null>(null)
  // 参会人员列表（预留，后续可通过 WebSocket 或轮询更新）
  const participants = ref<Participant[]>([])
  // 当前登录用户信息
  const localUser = ref<Participant | null>(null)
  // 聊天消息列表
  const messages = ref<ChatMessage[]>([])
  // 本地媒体状态
  const isMuted = ref(false)
  const isVideoOff = ref(false)
  // 异步操作状态与错误信息
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isHost = computed(
    () =>
      localUser.value !== null && currentMeeting.value !== null && localUser.value.id === currentMeeting.value.hostId
  )

  async function join(meetingId: string, displayName: string) {
    isLoading.value = true
    error.value = null

    try {
      const joinResponse = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      })

      if (!joinResponse.ok) {
        const result = await joinResponse.json().catch(() => ({ error: '加入会议失败' }))
        throw new Error(result.error ?? '加入会议失败')
      }

      const joinResult = extractData(await joinResponse.json(), isJoinData)

      const meetingResponse = await fetch(`/api/meetings/${meetingId}`)
      if (!meetingResponse.ok) {
        const result = await meetingResponse.json().catch(() => ({ error: '获取会议信息失败' }))
        throw new Error(result.error ?? '获取会议信息失败')
      }

      const meetingResult = extractData(await meetingResponse.json(), isMeeting)

      localUser.value = {
        id: joinResult.participantId,
        displayName: joinResult.displayName,
        isHost: meetingResult.hostId === joinResult.participantId,
        isMuted: isMuted.value,
        isVideoOff: isVideoOff.value,
      }
      currentMeeting.value = meetingResult
      participants.value = [localUser.value]
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      // 发生错误时清理已设置的会议状态，避免处于半登录状态
      currentMeeting.value = null
      localUser.value = null
      participants.value = []
    } finally {
      isLoading.value = false
    }
  }

  function leave() {
    currentMeeting.value = null
    participants.value = []
    localUser.value = null
    messages.value = []
    isMuted.value = false
    isVideoOff.value = false
    error.value = null
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (localUser.value) {
      localUser.value.isMuted = isMuted.value
    }
  }

  function toggleVideo() {
    isVideoOff.value = !isVideoOff.value
    if (localUser.value) {
      localUser.value.isVideoOff = isVideoOff.value
    }
  }

  async function sendMessage(content: string) {
    if (!currentMeeting.value) {
      error.value = '当前不在会议中，无法发送消息'
      return
    }

    error.value = null
    const meetingId = currentMeeting.value.id

    try {
      const response = await fetch(`/api/meetings/${meetingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: '发送消息失败' }))
        throw new Error(result.error ?? '发送消息失败')
      }

      const result = extractData(await response.json(), isChatMessage)
      messages.value.push(result)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
    }
  }

  return {
    currentMeeting,
    participants,
    localUser,
    messages,
    isMuted,
    isVideoOff,
    isLoading,
    error,
    isHost,
    join,
    leave,
    toggleMute,
    toggleVideo,
    sendMessage,
  }
})
