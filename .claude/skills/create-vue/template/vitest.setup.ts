import { setupServer } from 'msw/node'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { handlers } from './src/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
