import { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import { Doc, Map } from 'yjs'

import { processEnv } from './config'

// Module-level so hot reload does not create extra websocket connections.
export const ydoc = new Doc()

export const provider = new WebsocketProvider(
  processEnv.backendWSURL,
  processEnv.wsRoomName,
  ydoc
)

export const sharedBlocks = ydoc.getArray<Map<unknown>>('blocks')

export interface BlockData {
  id: string
  type: string
  content: string
}

const blocksFromYArray = (): BlockData[] =>
  sharedBlocks.toArray().map((yMap: Map<unknown>) => ({
    id: yMap.get('id') as string,
    type: yMap.get('type') as string,
    content: yMap.get('content')?.toString() || '',
  }))

export const useYDocInit = (): {
  blocks: BlockData[]
  status: string
  ydoc: Doc
  provider: WebsocketProvider
  sharedBlocks: typeof sharedBlocks
} => {
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [status, setStatus] = useState('Connecting...')

  const onStatus = (event: { status: string }) => {
    setStatus(event.status === 'connected' ? '🟢 Connected' : '🔴 Disconnected')
  }

  provider.on('status', onStatus)

  useEffect(() => {
    const syncToReact = () => {
      setBlocks(blocksFromYArray())
    }

    sharedBlocks.observeDeep(syncToReact)
    syncToReact()

    return () => {
      provider.off('status', onStatus)
      sharedBlocks.unobserveDeep(syncToReact)
    }
  }, [])

  return { blocks, status, ydoc, provider, sharedBlocks }
}
