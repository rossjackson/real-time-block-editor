# Backend

Lightweight Node.js + WebSocket backend for the real-time block editor. This app hosts the Yjs collaboration server using `y-websocket` so multiple frontend clients can sync block content and awareness (presence/cursor) state in the same room.

The server entrypoint is `src/main.ts`, which:

- starts an HTTP server (basic health-style response on `/`)
- attaches a WebSocket server (`ws`)
- delegates each socket connection to `setupWSConnection` from `y-websocket`
