# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adivinamon — a real-time multiplayer "Guess Who?" web game using anime characters or Pokémon. Two+ players join a room via a 5-character code, see a shared grid of 24 characters (Classic) or search characters live (Rule Master), and deduce each other's secret pick or rule.

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
- **Tailwind CSS 4** + **shadcn/ui** (Maia style, purple primary) for components
- **Zustand** for client-side state (grid eliminations, player identity)
- **TanStack Query** for data fetching (PokeAPI, Jikan API)
- **Pusher** (presence channels) for real-time multiplayer sync
- **Upstash Redis** for persistent server-side room state (replaces in-memory Map)

### State Management — Two Layers

1. **Server-side room state** (`src/lib/room-store.ts`): Stored in Upstash Redis as `room:{code}` keys with 2-hour TTL. All game logic (create/join room, selections, guesses, turn management) runs here via async Next.js API routes. This is the source of truth.

2. **Client-side state** (`src/stores/game-store.ts`): A Zustand store that mirrors server state plus local-only data (the `eliminated` Set for greying out characters on the grid, `opponentRemainingCount`). Player identity is persisted in `sessionStorage`.

### Real-Time Flow

- Pusher presence channels (`presence-room-{code}`) sync game events between players.
- API routes in `src/app/api/room/` mutate Redis state then trigger Pusher events.
- The `useRoomChannel` hook (`src/hooks/use-room-channel.ts`) subscribes to all Pusher events and updates the Zustand store. Also plays sound effects and records game stats.
- The `useGameActions` hook (`src/hooks/use-game-actions.ts`) wraps all API calls (create, join, start, select, guess, ask, answer, rematch, cancel, leave, remaining).
- Event types are defined in `src/types/pusher-events.ts`.

### Game Phases & Modes

**Phases** (defined in `src/types/room.ts`): `lobby` → `selection` → `playing` → `finished`

**Two game modes:**
- **Classic:** Each player secretly picks a character from a 24-character grid; guess the opponent's pick. Wrong guesses auto-eliminate the character and the game continues until someone guesses correctly. A confirmation step prevents misclicks.
- **Rule Master:** Each player writes a secret rule; take turns asking if characters match the opponent's rule, then guess the rule. Turn-based with `currentTurn`, `pendingAsk`, and `pendingRuleGuess` fields. Characters are searched live from the selected source.

### Character Sources

Three sources available for both modes:
- **Templates** — Curated character packs from `src/data/templates/` (53 anime). Multi-select with "Select All". Gender filter available in Classic mode.
- **Search Anime** — Search for an anime via Jikan API, then use its characters. Classic picks 24 random; Rule Master searches from that anime's full roster.
- **Pokemon** — Multi-generation selection (Gen 1-9) with "Select All". Classic picks 24 random from selected generations; Rule Master searches all Pokémon.

### Player Roles

- **Host** — Creates the room, configures game settings, starts the game.
- **Player 2** — Joins the room, plays the game.
- **Spectator** — 3rd+ players join as spectators. Can view the game but cannot interact (no eliminating, guessing, or answering). In Rule Master, spectators see per-player boards instead of "Your Board" / "Opponent's Board".

### Key Directories

- `src/app/api/room/` — API routes (create, join, start, select, guess, ask, answer, rule-guess, rule-judge, rematch, cancel, leave, remaining, get)
- `src/components/game/` — Game phase components (board, selection, guess dialog, rule master, character search, answer prompt, player info badge)
- `src/components/lobby/` — Lobby UI (template picker, generation picker, anime search picker, mode picker)
- `src/components/shared/` — Room header, theme toggle
- `src/lib/` — Utilities: room store (Redis), Pusher client/server, Pokémon helpers, constants, sounds, game stats
- `src/hooks/` — Custom hooks: room channel, game actions, character list, remaining broadcast, title flash, keepalive
- `src/stores/` — Zustand game store
- `src/types/` — TypeScript types for room state, Pusher event payloads, character data
- `src/data/templates/` — JSON character template files + index.ts

### UX Features

- **Sound effects** — Web Audio API tones for join, start, turn, correct/wrong guess, notifications
- **Tab title flash** — Browser tab flashes "Your turn!" in Rule Master when attention is needed
- **Elimination counter** — Shows remaining/total on Classic board
- **Board filter** — Text input to dim non-matching characters on the grid
- **Character preview** — Long-press or right-click for zoomed overlay with full image and name
- **Opponent remaining warning** — Pulsing badge when opponent has ≤3 characters left (broadcasts via Pusher)
- **Phase animations** — Fade + slide transition between game phases
- **Game stats** — Win/loss/streak tracked in localStorage per room session, with reset button
- **Image fallback** — Placeholder SVG for broken character images
- **Dark mode** — Full dark mode support with proper colored card backgrounds
- **Confirmation dialogs** — Confirm before leaving room or cancelling game mid-play
- **Keyboard accessibility** — ARIA labels, focus-visible rings, proper roles on grid

### Environment Variables

Required in `frontend/.env.local`:
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`
- `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Deployment

Deployed on **Vercel**. Room state persists across serverless function invocations via Upstash Redis. Pusher handles real-time WebSocket connections. Redis keys auto-expire after 2 hours.
