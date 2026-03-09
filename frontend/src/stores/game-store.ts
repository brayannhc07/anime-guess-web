import { create } from "zustand";
import type { AskedCharacter, GameMode, GamePhase, CharacterSource, Player } from "@/types/room";
import type { GuessResultPayload, CharacterAskedPayload, RuleGuessSubmittedPayload } from "@/types/pusher-events";

interface GameState {
  playerId: string;
  playerName: string;
  roomCode: string;
  phase: GamePhase;
  mode: GameMode;
  characterSource: CharacterSource;
  templateKeys: string[];
  searchAnimeId: number | null;
  players: Player[];
  characterIds: number[];
  eliminated: Set<number>;
  winner: string | null;
  guessResult: GuessResultPayload | null;
  // Rule Master state
  currentTurn: string | null;
  askedCharacters: AskedCharacter[];
  pendingAsk: CharacterAskedPayload | null;
  pendingRuleGuess: RuleGuessSubmittedPayload | null;

  setPlayer: (id: string, name: string) => void;
  setRoomCode: (code: string) => void;
  setPhase: (phase: GamePhase) => void;
  setMode: (mode: GameMode) => void;
  setCharacterSource: (source: CharacterSource) => void;
  setTemplateKeys: (keys: string[]) => void;
  setSearchAnimeId: (id: number | null) => void;
  setPlayers: (players: Player[]) => void;
  setCharacterIds: (ids: number[]) => void;
  toggleEliminated: (id: number) => void;
  clearEliminated: () => void;
  setWinner: (winnerId: string | null) => void;
  setGuessResult: (result: GuessResultPayload | null) => void;
  updatePlayerLocked: (playerId: string) => void;
  setCurrentTurn: (turn: string | null) => void;
  setPendingAsk: (ask: CharacterAskedPayload | null) => void;
  setPendingRuleGuess: (guess: RuleGuessSubmittedPayload | null) => void;
  setAskedCharacters: (characters: AskedCharacter[]) => void;
  addAskedCharacter: (character: AskedCharacter) => void;
  hydratePlayer: () => void;
  leaveRoom: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerId: "",
  playerName: "",
  roomCode: "",
  phase: "lobby",
  mode: "classic",
  characterSource: "template",
  templateKeys: [],
  searchAnimeId: null,
  players: [],
  characterIds: [],
  eliminated: new Set(),
  winner: null,
  guessResult: null,
  currentTurn: null,
  askedCharacters: [],
  pendingAsk: null,
  pendingRuleGuess: null,

  setPlayer: (id, name) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("animeguess-player", JSON.stringify({ id, name }));
    }
    set({ playerId: id, playerName: name });
  },
  setRoomCode: (code) => set({ roomCode: code }),
  setPhase: (phase) => set({ phase }),
  setMode: (mode) => set({ mode }),
  setCharacterSource: (source) => set({ characterSource: source }),
  setTemplateKeys: (keys) => set({ templateKeys: keys }),
  setSearchAnimeId: (id) => set({ searchAnimeId: id }),
  setPlayers: (players) => set({ players }),
  setCharacterIds: (ids) => set({ characterIds: ids }),
  toggleEliminated: (id) =>
    set((state) => {
      const next = new Set(state.eliminated);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { eliminated: next };
    }),
  clearEliminated: () => set({ eliminated: new Set() }),
  setWinner: (winnerId) => set({ winner: winnerId }),
  setGuessResult: (result) => set({ guessResult: result }),
  updatePlayerLocked: (playerId) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, lockedIn: true } : p
      ),
    })),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  setPendingAsk: (ask) => set({ pendingAsk: ask }),
  setPendingRuleGuess: (guess) => set({ pendingRuleGuess: guess }),
  setAskedCharacters: (characters) => set({ askedCharacters: characters }),
  addAskedCharacter: (character) =>
    set((state) => ({
      askedCharacters: [...state.askedCharacters, character],
    })),
  hydratePlayer: () => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("animeguess-player");
    if (stored) {
      const { id, name } = JSON.parse(stored);
      set({ playerId: id, playerName: name });
    }
  },
  leaveRoom: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("animeguess-player");
    }
    set({
      playerId: "",
      playerName: "",
      roomCode: "",
      phase: "lobby",
      mode: "classic",
      characterSource: "template",
      templateKeys: [],
      searchAnimeId: null,
      players: [],
      characterIds: [],
      eliminated: new Set(),
      winner: null,
      guessResult: null,
      currentTurn: null,
      askedCharacters: [],
      pendingAsk: null,
      pendingRuleGuess: null,
    });
  },
  resetGame: () =>
    set({
      phase: "lobby",
      characterIds: [],
      eliminated: new Set(),
      winner: null,
      guessResult: null,
      players: [],
      currentTurn: null,
      askedCharacters: [],
      pendingAsk: null,
      pendingRuleGuess: null,
    }),
}));
