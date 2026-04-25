import * as Y from 'yjs'
import './App.css'
import { simulateAI } from './mockAI'
import { useYDocInit } from './useYDocInit'

const App = () => {
  const { blocks, status, sharedBlocks } = useYDocInit()

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

  return (
    <div className="app">
      <header className="app-header">
        <h2>Real Time Block Editor CRDT</h2>
        <span className="status-badge">{status}</span>
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
        {blocks.length === 0 && <p className="empty-state">No blocks yet. Add one!</p>}

        {blocks.map((block, index) => (
          <div key={block.id} className="block-card">
            <div className="block-id">Block ID: {block.id}</div>

            <div className="block-content">{block.content}</div>

            <button
              onClick={() => simulateAI(sharedBlocks, index)}
              className="ai-btn"
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
