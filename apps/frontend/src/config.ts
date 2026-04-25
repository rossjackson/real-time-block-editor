export const processEnv = {
  backendWSURL: process.env.BACKEND_WS_URL ?? 'ws://localhost:5001',
  wsRoomName: process.env.WS_ROOM_NAME ?? 'real-time-editor-demo',
}
