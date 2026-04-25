import { InputEvent, useState } from 'react'
import * as Y from 'yjs'
import './App.css'
import { BlockContent } from './BlockContent'
import { simulateAI } from './mockAI'
import { UserCursor } from './UserCursor'
import {
  useCollaborationAwareness,
} from './useCollaborationAwareness'
import { useConnectionStatus } from './useConnectionStatus'
import { useSyncYDocToReact } from './useSyncYDocToReact'

const App = () => {
  const { blocks, provider, sharedBlocks } = useSyncYDocToReact()
  const connectionStatus = useConnectionStatus(provider)
  const [aiStreamingBlocks, setAiStreamingBlocks] = useState<Set<string>>(
    new Set()
  )
  const { remoteCursorsByBlock, activeCollaborators, updateLocalCursor } =
    useCollaborationAwareness(provider)

  const addBlock = () => {
    const newBlock = new Y.Map()
    newBlock.set('id', Math.random().toString(36).substring(2, 9))
    newBlock.set('type', 'paragraph')
    newBlock.set('content', new Y.Text(''))

    sharedBlocks.push([newBlock])
  }

  const clearAll = () => {
    sharedBlocks.delete(0, sharedBlocks.length)
  }

  const updateBlockContent = (index: number, nextContent: string) => {
    const targetBlock = sharedBlocks.get(index)
    if (!targetBlock) {
      return
    }

    const yText = targetBlock.get('content')
    if (!(yText instanceof Y.Text)) {
      return
    }

    yText.delete(0, yText.length)
    yText.insert(0, nextContent)
  }

  const onBlockInput = (index: number, event: InputEvent<HTMLDivElement>) => {
    updateBlockContent(index, event.currentTarget.textContent ?? '')
  }

  const triggerAISimulation = (blockId: string, index: number) => {
    setAiStreamingBlocks((prev) => new Set(prev).add(blockId))

    simulateAI(sharedBlocks, index, () => {
      setAiStreamingBlocks((prev) => {
        const next = new Set(prev)
        next.delete(blockId)
        return next
      })
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Real Time Block Editor CRDT</h2>
        <div className="header-statuses">
          <span className="status-badge">{connectionStatus}</span>
          <span className="status-badge">👥 {activeCollaborators} active</span>
        </div>
      </header>

      <div className="actions">
        <button onClick={addBlock} className="btn">
          + Add Block
        </button>
        <button onClick={clearAll} className="btn btn-danger">
          Clear All
        </button>
      </div>

      <div className="blocks-list">
        {blocks.length === 0 && (
          <p className="empty-state">No blocks yet. Add one!</p>
        )}

        {blocks.map((block, index) => (
          <div key={block.id} className="block-card">
            <div className="block-id">Block ID: {block.id}</div>

            <div className="block-editor-shell">
              <BlockContent
                blockId={block.id}
                value={block.content}
                isReadOnly={aiStreamingBlocks.has(block.id)}
                onInput={(event) => onBlockInput(index, event)}
                onCursorChange={updateLocalCursor}
              />
              {(remoteCursorsByBlock[block.id] ?? []).map((remoteCursor) => (
                <UserCursor key={remoteCursor.clientId} cursor={remoteCursor} />
              ))}
            </div>

            <button
              onClick={() => triggerAISimulation(block.id, index)}
              className="ai-btn"
              disabled={aiStreamingBlocks.has(block.id)}
            >
              ✨ Simulate AI Stream
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
