## Repo overview

- Small React + TypeScript app scaffolded for Vite (entry: `src/main.tsx`).
- UI is component-driven under `src/components/` (each component has a paired CSS file).
- Game logic is implemented with small classes and types in `src/` (see `Board.ts`, `interfaces.ts`, `types.ts`).
- The app hosts multiple games (Tic-Tac-Toe, Connect4, Gomoku). Games are selected via `GameSelector.tsx` and configured by `defaultGames.json`.

## Big-picture architecture (what an agent should know)

- `src/main.tsx` boots React and renders `App`.
- `App.tsx` wires the overall UI and loads game modules from `src/components/`.
- UI components are mostly `*.tsx` and small — business/game logic lives in `.ts` files (for example, `Board.ts` implements board state, cloning, connectivity checks like `isNConnected`).
- Interaction pattern: grid components expose `renderCell` and `onGridClick` handlers. Example: `TicTacToeGame.tsx` uses a `Grid` component and supplies `renderCell` and `onGridClick` (which receives the DOM cell and coordinates).
- State pattern: games typically use local `useReducer` state (see `TicTacToeGame.tsx`), not global stores.

## Developer workflows (commands)

- Start dev server with `npm run dev` (uses Vite; project overrides `vite` to `rolldown-vite`).
- Build for production: `npm run build` (runs `tsc -b` then `vite build`).
- Preview production build: `npm run preview`.
- Lint: `npm run lint`.

If a change causes type errors during `build`, run `tsc -b` locally to see diagnostics.

## Project-specific conventions and patterns

- Filenames: component UI in `*.tsx`, plain logic/POJOs in `*.ts` (e.g., `Board.ts`). Follow this separation.
- CSS colocated: each component typically has a corresponding `*.css` file (e.g., `TicTacToeGame.css`).
- Board values: board place values use short string literals: `'E'` for empty, `'X'` and `'O'` for players. Code expects these exact characters.
- Grid contract: `Grid` components accept props `rows`, `cols`, `cellSize`, `gap`, `renderCell` and `onGridClick(cell, x, y)`. `onGridClick` will occasionally receive `null` for `cell` — guard accordingly.
- Immutable board updates: `Board` exposes `clone()`, `getAt(x,y)`, `setAt(x,y)`, `isBoardFull()` and `isNConnected(n, value)` — use these rather than mutating internal arrays.
- Game lifecycle: dispatch `reset` and `move` actions through the reducer; `playerWon` short-circuits further moves.

## Integration points & dependencies

- Minimal external deps: `react`, `react-dom`, `vite` (overridden to `rolldown-vite` in `package.json`).
- ESLint is configured in `eslint.config.js` — use `npm run lint` to validate style.

## Helpful code examples to reference

- Rendering entry: `src/main.tsx` — root render.
- Sample game reducer: `src/components/TicTacToeGame.tsx` — shows `useReducer`, `applyMoveToBoard`, `playerWins`, and `BoardGameGrid` specialization of `Grid`.
- Board API: `src/components/Board.ts` — central to game logic; prefer its methods for board queries/updates.

## What to avoid / assumptions

- Do not assume global state management (there is none); changes should be localized to components unless you intentionally add a global store.
- Don't change the Board value literals (`'E'`, `'X'`, `'O'`) without updating all game components and tests.

## When you need more info

- If uncertain about a game rule implementation, inspect `defaultGames.json` and the game component (e.g., `GomokuGame.tsx`) for expected board sizes and win conditions.
- Ask the maintainer for expected browser support or CI steps if you plan to change build tool configuration (note: `vite` is overridden).

---

If any section is unclear or you'd like more examples (e.g., `Board` internals or `Grid` accessibility behavior), tell me which part to expand. 
