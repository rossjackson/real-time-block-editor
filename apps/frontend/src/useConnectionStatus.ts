import { useEffect, useState } from 'react'
import type { WebsocketProvider } from 'y-websocket'

const deriveConnectionLabel = (provider: WebsocketProvider): string => {
  if (provider.wsconnected) {
    return '🟢 Connected'
  }
  if (provider.wsconnecting) {
    return '🟡 Connecting...'
  }
  return '🔴 Disconnected'
}

/**
 * Mirrors y-websocket connection state into React. Subscribes to `status` and
 * re-reads provider flags so the label stays correct even if an event was missed
 * before this hook mounted.
 */
export const useConnectionStatus = (provider: WebsocketProvider): string => {
  const [status, setStatus] = useState(() => deriveConnectionLabel(provider))

  useEffect(() => {
    setStatus(deriveConnectionLabel(provider))

    const onStatus = () => {
      setStatus(deriveConnectionLabel(provider))
    }

    provider.on('status', onStatus)
    return () => {
      provider.off('status', onStatus)
    }
  }, [provider])

  return status
}
