# Frontend

Webpack + React client for the real-time block editor. `src/collaborationProvider.ts` owns shared Yjs singletons (`ydoc`, websocket `provider`, `sharedBlocks`) at module scope so hot reload does not spawn extra connections. `src/useSyncYDocToReact.ts` mirrors shared block content into React state, and `src/App.tsx` is the main UI.

`src/mockAI.ts` contains the `simulateAI` helper used by the demo button in `App.tsx`. It exists to keep mock/demo token streaming separate from UI rendering logic so it is easier to replace with a real backend AI stream without mixing transport/mock concerns into the component.

## Why sync Yjs to React (`syncToReact`)

The collaborative document lives in **mutable Yjs types** (`Y.Array`, `Y.Map`, `Y.Text`) outside React’s state model. When the doc changes—local actions, another tab, or remote sync over the websocket—those updates happen on the Yjs objects only. React does **not** re-render unless something calls `setState` (or similar).

`syncToReact` is the bridge:

1. **`observeDeep`** runs it whenever the shared structure (including nested `Y.Text`) changes.
2. Inside, **`setBlocks`** schedules a re-render so the UI stays in sync with the document.

The function also **converts Yjs → plain data** for JSX: `Y.Text` is not a string, so we use `.toString()` (or a proper editor binding later). The UI maps over `BlockData[]`, not `Y.Map` instances.

**Source of truth** remains Yjs (and the provider). React `blocks` state is a **derived snapshot** for rendering—similar to subscribing to an external store and copying a view model into `useState`.

If you later use an editor that binds directly to `Y.Text` (e.g. ProseMirror/Lexical + Yjs), that layer replaces “string in a `div`” but you still need **some** path from Yjs updates to what gets painted on screen.

## Why `addBlock` updates `sharedBlocks` (not React state)

`addBlock` writes to `sharedBlocks` because that `Y.Array` is the collaborative source of truth shared across tabs/clients. If we only called React state setters in `App.tsx`, that change would be local UI state and would not become a CRDT operation broadcast through Yjs.

Flow:

1. `addBlock` creates Yjs types (`Y.Map`, `Y.Text`) and pushes them into `sharedBlocks`.
2. Yjs emits change events (`observeDeep`) for local and remote edits.
3. `syncToReact` responds to those events and calls `setBlocks` with a plain-data snapshot for rendering.

So React state is intentionally **derived** from Yjs, while all real mutations happen on shared Yjs structures. This keeps one write path and avoids state divergence between React and the collaborative document.

## Block editing and AI streaming behavior

The block body in `App.tsx` uses a `contentEditable` `div` and pushes user input back into shared Yjs `Y.Text` so edits are visible across tabs/browsers in the same room.

### Editable block sync

1. Typing in a block fires `onInput`.
2. `onInput` calls `updateBlockContent`.
3. `updateBlockContent` rewrites the block's shared `Y.Text` content.
4. Yjs emits updates and `syncToReact` rehydrates `blocks` for render in all connected clients.

### AI stream lock during simulation

When `✨ Simulate AI Stream` is clicked for a block:

1. That block ID is added to an `aiStreamingBlocks` set in React state.
2. The block's `contentEditable` is set to `false` for that block only.
3. The AI stream appends token-by-token into the shared `Y.Text`.
4. On stream completion, the block ID is removed from the set and editing is enabled again.

This prevents local typing from competing with the simulated AI writes for the same block while the stream is active.

### Current caveat

To avoid caret jumps in `contentEditable`, focused blocks skip DOM text replacement from incoming sync updates. During local typing, remote updates for that same focused block may not be painted until focus leaves the block.

## Awareness, cursors, and active collaborators

This app uses `y-websocket` awareness (presence) to show who is online and where they are typing.

### Where it lives

- `src/collaborationProvider.ts`
  - Initializes local awareness state once at module load (`user` and `cursor: null`).
  - Exposes singleton `provider` used by awareness hooks.
- `src/useCollaborationAwareness.ts`
  - Subscribes to `provider.awareness` `change` and `update` events.
  - Builds `remoteCursorsByBlock` for rendering cursor flags.
  - Computes `activeCollaborators` as remote clients that have `user` presence (cursor is optional).
  - Exposes `updateLocalCursor(blockId, cursor)` so editors can publish local caret movement.
- `src/BlockContent.tsx`
  - Captures caret position from contentEditable selection and publishes it through `onCursorChange`.
  - Handles collapsed caret ranges by inserting a temporary zero-width marker to measure stable coordinates.
- `src/UserCursor.tsx`
  - Renders the remote cursor line + colored user badge.
- `src/App.tsx`
  - Wires everything together: status badge, collaborator count, block editor, and cursor overlay layer.

### Behavior details

1. On load, each client publishes a local awareness `user` object (`name`, `color`).
2. While focused in a block, caret movement updates local `cursor` (`blockId`, `x`, `y`).
3. Other clients receive awareness updates and group remote cursors by `blockId`.
4. The UI renders cursor flags in the matching block and shows active collaborator count in the header.
5. On blur/unmount, local `cursor` is set to `null` so stale caret markers disappear.
