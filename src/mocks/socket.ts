import { mockParticipants } from './data/participants'

type SocketEventHandler = (data: unknown) => void

export class MockWebSocket {
  private listeners: Record<string, SocketEventHandler[]> = {}
  readyState = 1

  constructor(public url: string) {
    setTimeout(() => {
      this.emit('open', {})
    }, 100)
  }

  on(event: string, handler: SocketEventHandler) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
  }

  emit(event: string, data: unknown) {
    this.listeners[event]?.forEach((h) => h(data))
  }

  send(message: string) {
    const parsed = JSON.parse(message)
    if (parsed.type === 'join') {
      setTimeout(() => {
        this.emit('message', {
          type: 'participant-joined',
          participant: mockParticipants[1],
        })
      }, 300)
    }
  }

  close() {
    this.readyState = 3
  }
}

export function createSocket(url: string) {
  return new MockWebSocket(url)
}
