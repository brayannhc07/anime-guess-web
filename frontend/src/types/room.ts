export type GamePhase = "lobby" | "selection" | "playing" | "finished";

export type GameMode = "classic" | "rule-master";

export type CharacterSource = "template" | "search";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  selection: number | null; // Character ID (classic) or null
  rule: string | null; // Rule text set FOR the opponent (rule-master)
  lockedIn: boolean;
  rematchRequested: boolean;
}

export interface AskedCharacter {
  id: number;
  name: string;
  image: string;
  valid: boolean | null; // null = waiting for answer
  askerId: string;
}

export interface RoomState {
  code: string;
  phase: GamePhase;
  mode: GameMode;
  characterSource: CharacterSource;
  templateKeys: string[];
  searchAnimeId: number | null;
  players: Player[];
  characterIds: number[];
  winner: string | null;
  guessResult: {
    correct: boolean;
    guesserId: string;
    actual: number | string;
  } | null;
  // Rule Master fields
  currentTurn: string | null; // player ID whose turn it is
  askedCharacters: AskedCharacter[]; // all asked characters across both players
  pendingAsk: {
    askerId: string;
    characterId: number;
    characterName: string;
    characterImage: string;
  } | null;
  pendingRuleGuess: {
    guesserId: string;
    guess: string;
  } | null;
}
