import type { RemoteCursor } from './useCollaborationAwareness'

interface UserCursorProps {
  cursor: RemoteCursor
}

export const UserCursor = ({ cursor }: UserCursorProps) => (
  <div
    className="remote-cursor"
    style={{
      left: `${cursor.x}px`,
      top: `${cursor.y}px`,
      borderColor: cursor.color,
    }}
  >
    <span
      className="remote-cursor-flag"
      style={{ backgroundColor: cursor.color }}
    >
      {cursor.name}
    </span>
  </div>
)
