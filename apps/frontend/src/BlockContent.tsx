import { InputEvent, useEffect, useLayoutEffect, useRef } from 'react'
import type { CursorPosition } from './useCollaborationAwareness'

interface BlockContentProps {
  blockId: string
  value: string
  isReadOnly: boolean
  onInput: (event: InputEvent<HTMLDivElement>) => void
  onCursorChange: (blockId: string, cursor: CursorPosition | null) => void
}

export const BlockContent = ({
  blockId,
  value,
  isReadOnly,
  onInput,
  onCursorChange,
}: BlockContentProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)

  const getCursorPosition = (
    range: Range,
    element: HTMLDivElement
  ): CursorPosition | null => {
    const elementRect = element.getBoundingClientRect()
    const rangeRect = range.getBoundingClientRect()

    if (rangeRect.width !== 0 || rangeRect.height !== 0) {
      return {
        x: rangeRect.left - elementRect.left,
        y: rangeRect.top - elementRect.top,
      }
    }

    // Collapsed caret ranges in contentEditable can report a zero-sized rect.
    // Use a temporary marker span to measure a stable caret anchor point.
    const marker = document.createElement('span')
    marker.textContent = '\u200b'
    marker.style.position = 'relative'
    marker.style.display = 'inline-block'

    const markerRange = range.cloneRange()
    markerRange.insertNode(marker)
    const markerRect = marker.getBoundingClientRect()
    marker.remove()

    return {
      x: markerRect.left - elementRect.left,
      y: markerRect.top - elementRect.top,
    }
  }

  const notifyCursorPosition = () => {
    const element = contentRef.current
    const selection = window.getSelection()
    if (!element || !selection || selection.rangeCount === 0) {
      return
    }

    const range = selection.getRangeAt(0)
    if (!element.contains(range.startContainer)) {
      return
    }

    const cursorPosition = getCursorPosition(range, element)
    if (!cursorPosition) {
      return
    }

    onCursorChange(blockId, cursorPosition)
  }

  useLayoutEffect(() => {
    const element = contentRef.current
    if (!element) {
      return
    }

    // Avoid resetting text while the user is actively typing,
    // which causes the caret to jump to the start.
    if (document.activeElement === element) {
      return
    }

    if (element.textContent !== value) {
      element.textContent = value
    }
  }, [value])

  useEffect(() => {
    const onSelectionChange = () => {
      const element = contentRef.current
      if (!element || document.activeElement !== element) {
        return
      }

      notifyCursorPosition()
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [])

  return (
    <div
      ref={contentRef}
      className="block-content"
      data-block-id={blockId}
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      onInput={(event) => {
        onInput(event)
        notifyCursorPosition()
      }}
      onKeyUp={notifyCursorPosition}
      onMouseUp={notifyCursorPosition}
      onFocus={notifyCursorPosition}
      onBlur={() => onCursorChange(blockId, null)}
    />
  )
}
