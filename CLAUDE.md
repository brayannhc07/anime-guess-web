# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adivinamon — a real-time multiplayer "Guess Who?" web game using Pokémon. Two players join a room via a 5-character code, see a shared grid of 24 Pokémon, and deduce each other's secret pick (or secret rule) while chatting over Discord.

## Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Monorepo layout:** The repo root contains docs; all application code lives under `frontend/`.

### Tech Stack
- **Next.js 16** (App Router) with React 19
- **Tailwind CSS 4** + **shadcn/ui** for components
- **Zustand** for client-side state (grid eliminations, player identity)
- **TanStack Query** for data fetching (PokeAPI)
- **Pusher** (presence channels) for real-time multiplayer sync

### State Management — Two Layers

1. **Server-side room state** (`src/lib/room-store.ts`): An in-memory `Map<string, RoomState>` stored on `globalThis` (survives HMR). All game logic (create/join room, selections, guesses, turn management) runs here via Next.js API routes. This is the source of truth.

2. **Client-side state** (`src/stores/game-store.ts`): A Zustand store that mirrors server state plus local-only data (the `eliminated` Set for greying out Pokémon on the grid). Player identity is persisted in `sessionStorage`.

### Real-Time Flow

- Pusher presence channels (`presence-room-{code}`) sync game events between players.
- API routes in `src/app/api/room/` mutate server state then trigger Pusher events.
- The `useRoomChannel` hook (`src/hooks/use-room-channel.ts`) subscribes to all Pusher events and updates the Zustand store.
- The `useGameActions` hook (`src/hooks/use-game-actions.ts`) wraps all API calls (create, join, start, select, guess, ask, answer, rematch, cancel).
- Event types are defined in `src/types/pusher-events.ts`.

### Game Phases & Modes

**Phases** (defined in `src/types/room.ts`): `lobby` → `selection` → `playing` → `finished`

**Two game modes:**
- **Classic:** Each player secretly picks a Pokémon; guess the opponent's pick.
- **Rule Master:** Each player writes a secret rule; take turns asking if Pokémon match the opponent's rule, then guess the rule. Turn-based with `currentTurn`, `pendingAsk`, and `pendingRuleGuess` fields.

### Key Directories

- `src/app/api/room/` — API routes (one per action: create, join, start, select, guess, ask, answer, rule-guess, rule-judge, rematch, cancel, get)
- `src/components/game/` — Game phase components (board, selection, guess dialog, rule master)
- `src/components/lobby/` — Lobby UI (generation picker, mode picker)
- `src/lib/` — Utilities: room store, Pusher client/server setup, Pokémon helpers, constants
- `src/types/` — TypeScript types for room state and Pusher event payloads

### Pokémon Data Strategy

No individual API calls per Pokémon. Sprite URLs are constructed directly from Pokémon IDs (`src/lib/pokemon.ts`). Generation ranges are defined in `src/lib/constants.ts`. The host picks 24 random IDs and broadcasts them via Pusher so both players see the same grid. TanStack Query (`src/hooks/use-pokemon-list.ts`) fetches names from PokeAPI.

### Environment Variables

Pusher credentials are required in `frontend/.env.local`:
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

### Future Refactor Note

`docs/implementation-refactor.md` describes a planned swap from PokeAPI to Jikan API (anime characters). The constraint is to only change the data layer and UI — the Pusher/room/Zustand multiplayer engine must remain untouched.
