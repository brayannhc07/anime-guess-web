# Software Requirements & Prompt: Pokémon "Guess Who" Web Game

**Role & Objective**
Act as an expert Full-Stack Developer. Your goal is to build a multiplayer "Guess Who" style Pokémon web game. 

**Tech Stack**
* **Framework:** Next.js (App Router preferred)
* **Styling:** Tailwind CSS + shadcn/ui (install core components like buttons, dialogs, inputs, cards, and toasts)
* **Local State Management:** Zustand (for client-side UI state, like which grid items are crossed out)
* **Server State / Data Fetching:** TanStack Query (React Query)
* **Real-time / Multiplayer:** Pusher (or PartyKit, whichever is most efficient for a serverless Next.js deployment to sync game state)
* **Data Source:** PokeAPI (https://pokeapi.co/)

**Game Overview**
Two players join a room via a unique code. They are presented with a grid of 24 Pokémon. Players talk via an external app (Discord) to ask yes/no questions and eliminate Pokémon on their local screen until they guess the opponent's Pokémon (or figure out the secret rule).

---

## Implementation Steps & Requirements

### Phase 1: Project Setup & Real-time Infrastructure
1. Initialize the Next.js project with Tailwind, configure shadcn/ui, and set up the TanStack Query `QueryClientProvider`.
2. Set up the real-time websocket provider (Pusher/PartyKit) to handle room channels. 

3. Create a Lobby system:
   * Generate a 5-character alphanumeric Room Code.
   * Allow "Player 1" (Host) to create a room.
   * Allow "Player 2" to join via the code.
   * Sync the room state so the game doesn't start until both are connected.

### Phase 2: PokeAPI Data Strategy (using TanStack Query)
1. Use TanStack Query (`useQuery`) to fetch and cache Pokémon data.

2. **Optimization constraint:** To avoid slow load times and API rate limits, do not make 24 separate API calls. Fetch the master list (`?limit=1300`), filter by the selected preset (Generation), pick 24 random IDs, and construct the sprite URLs manually (e.g., `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png`). 
3. Implement presets in the Lobby (Host chooses before starting):
   * Gen 1 Only (IDs 1-151)
   * Gen 1-3 (IDs 1-386)
   * Gen 1-6 (IDs 1-721)
   * Completely Random (Any ID)
4. Ensure both players in the room receive the *exact same* 24 Pokémon for their grids. The Host's client should generate the list of 24 IDs and send them via the websocket to Player 2.

### Phase 3: Building the Game Board (UI/UX)
1. Build a responsive CSS Grid displaying the 24 selected Pokémon (Sprite + Name).
2. **Interactions:** * Left-clicking a Pokémon toggles an "eliminated" state (grayscale, lowered opacity, and a visual indicator like a red 'X'). 
   * The grid state (eliminated Pokémon) is strictly **local**—manage this with Zustand. Do not sync eliminations to the opponent, as each player tracks their own guesses.

### Phase 4: Game Modes Implementation
Both players must agree on the mode before starting in the Lobby.
* **Mode 1: Classic Guess Who**
    * **Selection Phase:** Both players secretly click one Pokémon to be their chosen character. Sync to the server that both players have locked in.
    * **Play Phase:** The UI displays the player's own chosen Pokémon in a small corner box so they don't forget. Players freely toggle their grids.
* **Mode 2: Phrase/Rule Master**
    * **Rule Phase:** The UI provides a text input for each player to type a secret rule (e.g., "Weak to water"). 
    * **Play Phase:** The UI displays the user's own secret rule in the corner. (Validation is purely honor-system over voice chat; the app just needs to store and display the text).

### Phase 5: Polish
* Add a "Reset Board" button (resets local Zustand state).
* Add a "Rematch" button at the end of a game that takes them back to the Lobby together.
* Use shadcn/ui Toast notifications for player connections/disconnections.

---
**Initial Prompt Execution:**
Please begin by outlining your folder structure and executing Phase 1. Ask for my Pusher/PartyKit credentials when you are ready for them.
