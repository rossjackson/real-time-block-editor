import { useCallback, useEffect, useState } from 'react'
import type { WebsocketProvider } from 'y-websocket'

export interface CursorPosition {
  x: number
  y: number
}

export interface RemoteCursor {
  clientId: number
  x: number
  y: number
  name: string
  color: string
}

interface AwarenessUser {
  name: string
  color: string
}

interface AwarenessCursor extends CursorPosition {
  blockId: string
}

interface AwarenessState {
  user?: AwarenessUser
  cursor?: AwarenessCursor
}

export const useCollaborationAwareness = (
  provider: WebsocketProvider
): {
  remoteCursorsByBlock: Record<string, RemoteCursor[]>
  activeCollaborators: number
  updateLocalCursor: (blockId: string, cursor: CursorPosition | null) => void
} => {
  const [remoteCursorsByBlock, setRemoteCursorsByBlock] = useState<
    Record<string, RemoteCursor[]>
  >({})
  const [activeCollaborators, setActiveCollaborators] = useState(0)

  const updateLocalCursor = useCallback(
    (blockId: string, cursor: CursorPosition | null) => {
      provider.awareness.setLocalStateField(
        'cursor',
        cursor ? { blockId, x: cursor.x, y: cursor.y } : null
      )
    },
    [provider]
  )

  useEffect(() => {
    const syncAwareness = () => {
      const nextByBlock: Record<string, RemoteCursor[]> = {}
      const ownClientId = provider.awareness.clientID
      let onlinePeers = 0

      provider.awareness.getStates().forEach((stateValue, clientId) => {
        const state = stateValue as AwarenessState

        if (clientId === ownClientId) {
          return
        }

        if (state.user) {
          onlinePeers++
        }

        if (!state.user || !state.cursor) {
          return
        }

        const remoteCursor: RemoteCursor = {
          clientId,
          x: state.cursor.x,
          y: state.cursor.y,
          name: state.user.name,
          color: state.user.color,
        }

        const blockId = state.cursor.blockId
        nextByBlock[blockId] = nextByBlock[blockId]
          ? [...nextByBlock[blockId], remoteCursor]
          : [remoteCursor]
      })

      setActiveCollaborators(onlinePeers)
      setRemoteCursorsByBlock(nextByBlock)
    }

    provider.awareness.on('change', syncAwareness)
    provider.awareness.on('update', syncAwareness)
    syncAwareness()

    return () => {
      provider.awareness.off('change', syncAwareness)
      provider.awareness.off('update', syncAwareness)
      provider.awareness.setLocalStateField('cursor', null)
    }
  }, [provider])

  return {
    remoteCursorsByBlock,
    activeCollaborators,
    updateLocalCursor,
  }
}
