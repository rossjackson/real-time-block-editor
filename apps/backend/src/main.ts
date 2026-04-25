import http from 'http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type WebSocket from 'ws'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

// Create a basic standard Node.js HTTP server
const server = http.createServer((_request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Yjs WebSocket Server is running behind the scenes.')
})

// Bind a WebSocket server to the HTTP server
const wss = new WebSocketServer({ server })

// Listen for incoming WebSocket connections
wss.on('connection', (conn: WebSocket, req: IncomingMessage) => {
  console.log('New client connected!')

  // Hand the connection off to the new Yjs utility.
  setupWSConnection(conn, req)
})

// Start listening on your desired port
const PORT = process.env.PORT || 5001

server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`)
})
