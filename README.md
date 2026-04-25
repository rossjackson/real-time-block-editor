# real-time-block-editor

Real time block editor where two browser windows can edit different blocks, add new blocks, and simulate an "AI" typing into a block simultaneously.

The frontend now keeps simulated AI streaming logic in `apps/frontend/src/mockAI.ts` instead of inside `App.tsx`. This keeps the UI component focused on rendering and interactions, while demo/mock behavior stays isolated and easy to swap out for a real AI stream later.

## Docs

- [Frontend](apps/frontend/README.md) — architecture notes, including why Yjs state is synced into React state.
