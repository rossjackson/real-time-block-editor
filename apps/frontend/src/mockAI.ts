import * as Y from 'yjs'

const TOKEN_STREAM =
  ' This text is streaming in token by token, merging with any local edits... '
const STREAM_INTERVAL_MS = 50

export const simulateAI = (
  sharedBlocks: Y.Array<Y.Map<unknown>>,
  blockIndex: number,
  onDone?: () => void
) => {
  const targetBlock = sharedBlocks.get(blockIndex)
  if (!targetBlock) {
    onDone?.()
    return
  }

  const yText = targetBlock.get('content')
  if (!(yText instanceof Y.Text)) {
    onDone?.()
    return
  }

  let i = 0

  // Demo-only mock stream that appends one token at a time.
  const interval = setInterval(() => {
    if (i < TOKEN_STREAM.length) {
      yText.insert(yText.length, TOKEN_STREAM[i])
      i++
      return
    }

    clearInterval(interval)
    onDone?.()
  }, STREAM_INTERVAL_MS)
}
