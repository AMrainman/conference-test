import { mockParticipants } from './data/participants'

const MOCK_MESSAGE_TIMESTAMP = '2024-01-01T10:00:00.000Z'

type EventType = 'open' | 'message' | 'close' | 'error'

type WebSocketEvent = Event | MessageEvent | CloseEvent

type WebSocketEventListener = (this: MockWebSocket, ev: WebSocketEvent) => void

type WebSocketEventListenerOrHandle =
  | WebSocketEventListener
  | { handleEvent: WebSocketEventListener }

function createMessagePayload(payload: Record<string, unknown>): MessageEvent {
  return new MessageEvent('message', { data: JSON.stringify(payload) })
}

function generateMessageId(content: string): string {
  return `msg-${content.length}-${content.slice(0, 5)}`
}

export class MockWebSocket {
  private listeners: Record<EventType, WebSocketEventListenerOrHandle[]> = {
    open: [],
    message: [],
    close: [],
    error: [],
  }

  readyState: number = WebSocket.CONNECTING
  onopen: ((this: MockWebSocket, ev: Event) => void) | null = null
  onmessage: ((this: MockWebSocket, ev: MessageEvent) => void) | null = null
  onclose: ((this: MockWebSocket, ev: CloseEvent) => void) | null = null
  onerror: ((this: MockWebSocket, ev: Event) => void) | null = null

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      this.dispatchEvent(new Event('open'))
    }, 100)
  }

  addEventListener(
    type: EventType,
    listener: WebSocketEventListenerOrHandle,
  ): void {
    this.listeners[type].push(listener)
  }

  removeEventListener(
    type: EventType,
    listener: WebSocketEventListenerOrHandle,
  ): void {
    this.listeners[type] = this.listeners[type].filter((l) => l !== listener)
  }

  dispatchEvent(event: WebSocketEvent): boolean {
    const type = event.type as EventType

    const handlerName = `on${type}` as const
    const handler = this[handlerName] as WebSocketEventListenerOrHandle | null
    if (handler) {
      if (typeof handler === 'function') {
        handler.call(this, event)
      } else {
        handler.handleEvent.call(this, event)
      }
    }

    this.listeners[type]?.forEach((listener) => {
      if (typeof listener === 'function') {
        listener.call(this, event)
      } else {
        listener.handleEvent.call(this, event)
      }
    })

    return true
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // mock 层仅处理文本消息
    if (typeof data !== 'string') {
      this.dispatchEvent(new Event('error'))
      return
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(data) as Record<string, unknown>
    } catch {
      this.dispatchEvent(new Event('error'))
      return
    }

    const type = parsed.type

    setTimeout(() => {
      switch (type) {
        case 'join':
          this.dispatchEvent(
            createMessagePayload({
              type: 'participant-joined',
              participant: mockParticipants[1],
            }),
          )
          break
        case 'message': {
          const content =
            typeof parsed.content === 'string' ? parsed.content : ''
          this.dispatchEvent(
            createMessagePayload({
              type: 'message-received',
              message: {
                id: generateMessageId(content),
                senderId: 'local-user',
                senderName: '我',
                content,
                timestamp: MOCK_MESSAGE_TIMESTAMP,
              },
            }),
          )
          break
        }
        case 'leave':
          this.dispatchEvent(
            createMessagePayload({
              type: 'participant-left',
              participantId:
                typeof parsed.participantId === 'string'
                  ? parsed.participantId
                  : 'local-user',
            }),
          )
          break
        case 'mute':
          this.dispatchEvent(
            createMessagePayload({
              type: 'mute-changed',
              participantId:
                typeof parsed.participantId === 'string'
                  ? parsed.participantId
                  : 'local-user',
              isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : true,
            }),
          )
          break
        case 'host':
          this.dispatchEvent(
            createMessagePayload({
              type: 'host-changed',
              participantId:
                typeof parsed.participantId === 'string'
                  ? parsed.participantId
                  : 'local-user',
              isHost: typeof parsed.isHost === 'boolean' ? parsed.isHost : true,
            }),
          )
          break
        default:
          this.dispatchEvent(new Event('error'))
      }
    }, 300)
  }

  close(): void {
    this.readyState = WebSocket.CLOSED
    this.dispatchEvent(
      new CloseEvent('close', {
        wasClean: true,
        code: 1000,
        reason: '',
      }),
    )
  }
}

export function createSocket(url: string): MockWebSocket {
  return new MockWebSocket(url)
}
