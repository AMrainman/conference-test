let mockParticipantIdCounter = 0

export function generateMockParticipantId(): string {
  mockParticipantIdCounter += 1
  return `mock-participant-${mockParticipantIdCounter}`
}

export function resetMockParticipantIds(): void {
  mockParticipantIdCounter = 0
}
