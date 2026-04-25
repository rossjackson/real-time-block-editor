import { WebsocketProvider } from 'y-websocket'
import { Doc, Map } from 'yjs'

import { processEnv } from './config'

// Module-level singletons so hot reload does not create extra websocket connections.
export const ydoc = new Doc()

export const provider = new WebsocketProvider(
  processEnv.backendWSURL,
  processEnv.wsRoomName,
  ydoc
)

export const sharedBlocks = ydoc.getArray<Map<unknown>>('blocks')

const USER_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
]

export const localUser = {
  name: `User-${Math.random().toString(36).slice(2, 6)}`,
  color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
}

// Keep local awareness initialized independent of React mount timing.
provider.awareness.setLocalState({
  user: localUser,
  cursor: null,
})
