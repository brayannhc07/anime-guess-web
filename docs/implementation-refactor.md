**Role & Context**
Act as an expert Full-Stack Next.js Developer. I have duplicated my existing "Guess Who: Pokémon" multiplayer web game, and I want to refactor this new codebase into an "Anime Character" guessing game. 

Please read my project files (specifically the components, TanStack query hooks, Zustand store, and types) to understand the current architecture. 

**The Goal**
We are going to swap out the PokeAPI data layer for the Jikan API (MyAnimeList), update the Lobby presets, and adjust the UI to handle anime character portraits instead of Pokémon sprites. 

**CRITICAL CONSTRAINT:** Do NOT alter the core Pusher WebSocket logic, the Room code generation, or the local Zustand state management for the "eliminated" grid items. The multiplayer engine works perfectly; we are only swapping the data and visuals.

**Refactoring Steps:**

**Step 1: Type & Variable Renaming**
* Rename any interfaces/types from `Pokemon` to `AnimeCharacter`.
* Rename variables in the Zustand store and component props from `selectedPokemon` to `selectedCharacter`, `pokemonList` to `characterList`, etc.

**Step 2: Swap the Data Layer (TanStack Query)**
* Remove the PokeAPI fetching logic.
* Implement a new fetcher using the Jikan API v4 endpoint: `https://api.jikan.moe/v4/anime/{anime_id}/characters`
* **Data Logic:** When the API returns the character array:
  1. Filter and sort the array to prioritize characters where `role === "Main"`.
  2. Fill the remaining slots with characters where `role === "Supporting"`.
  3. Slice the final array so we have exactly 24 characters.
  4. Map the data to extract the character's `name` and their image URL (found at `character.images.jpg.image_url`).

**Step 3: Update Lobby Presets**
* Replace the Pokémon Generation dropdown/presets with an "Anime Selection" dropdown using these MyAnimeList IDs:
  * Re:Zero (ID: 31240)
  * Attack on Titan (ID: 16498)
  * Kaguya-sama: Love is War (ID: 37999)
  * Frieren: Beyond Journey's End (ID: 52991)
  * Konosuba (ID: 30831)
* Ensure the Host's selected `anime_id` is passed via the existing WebSocket setup to Player 2 so both clients fetch the exact same 24 characters.

**Step 4: UI & Styling Adjustments**
* Update the Grid component. Pokémon sprites were square transparent PNGs, but Anime images from Jikan are portrait JPEGs. 
* Update the Tailwind classes on the character images to use a fixed aspect ratio (e.g., `aspect-[3/4]`) and `object-cover` so the grid remains uniform and clean.
* Change all user-facing text from "Pokémon" to "Character" or "Waifu/Husbando".

Please start by analyzing my current file structure, confirm you understand the architecture, and then execute Step 1 and Step 2. Ask me before proceeding to the UI adjustments.
