# real-time-block-editor

Real time block editor where two browser windows can edit different blocks, add new blocks, and simulate an "AI" typing into a block simultaneously.

## Sample
<img width="1713" height="1018" alt="crdtsample" src="https://github.com/user-attachments/assets/b2c1bcc4-8a40-4db1-b922-a7709cca9838" />

## Docs

- [Frontend](apps/frontend/README.md) — architecture notes, including why Yjs state is synced into React state.
- [Backend](apps/backend/README.md) — backend architecture overview.

## Technologies used

- `Nx` monorepo/workspace tooling
- `TypeScript`
- `React` (frontend UI)
- `Webpack` + `webpack-dev-server` (frontend bundling/dev server)
- `Yjs` CRDT document model
- `y-websocket` (real-time sync transport/provider)
- `ws` (Node.js WebSocket server)

## Run frontend and backend together

Use two terminals from the repo root.

Terminal 1 (backend):

```bash
npx nx serve backend
```

Terminal 2 (frontend):

```bash
npx nx serve
```

Then open:

- `http://localhost:3000`

To verify collaboration, open that URL in two browser windows and edit blocks in either window.
