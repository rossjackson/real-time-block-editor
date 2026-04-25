import { useEffect, useState } from 'react'
import { Doc, Map } from 'yjs'
import { WebsocketProvider } from 'y-websocket'

import { localUser, provider, sharedBlocks, ydoc } from './collaborationProvider'

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

export const useSyncYDocToReact = (): {
  blocks: BlockData[]
  ydoc: Doc
  provider: WebsocketProvider
  sharedBlocks: typeof sharedBlocks
  localUser: typeof localUser
} => {
  const [blocks, setBlocks] = useState<BlockData[]>([])

  useEffect(() => {
    const syncToReact = () => {
      setBlocks(blocksFromYArray())
    }

    sharedBlocks.observeDeep(syncToReact)
    syncToReact()

    return () => {
      sharedBlocks.unobserveDeep(syncToReact)
    }
  }, [])

  return { blocks, ydoc, provider, sharedBlocks, localUser }
}
