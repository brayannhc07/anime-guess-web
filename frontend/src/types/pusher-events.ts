import type { GameMode, CharacterSource } from "./room";

export const PUSHER_EVENTS = {
  PLAYER_JOINED: "player-joined",
  PLAYER_LEFT: "player-left",
  GAME_STARTED: "game-started",
  PLAYER_LOCKED_IN: "player-locked-in",
  BOTH_LOCKED_IN: "both-locked-in",
  GUESS_RESULT: "guess-result",
  REMATCH_REQUESTED: "rematch-requested",
  REMATCH_ACCEPTED: "rematch-accepted",
  // Rule Master events
  CHARACTER_ASKED: "character-asked",
  CHARACTER_ANSWERED: "character-answered",
  GAME_CANCELLED: "game-cancelled",
  RULE_GUESS_SUBMITTED: "rule-guess-submitted",
  RULE_GUESS_JUDGED: "rule-guess-judged",
} as const;

export interface PlayerJoinedPayload {
  playerId: string;
  playerName: string;
}

export interface PlayerLeftPayload {
  playerId: string;
}

export interface GameStartedPayload {
  characterIds: number[];
  mode: GameMode;
  characterSource: CharacterSource;
  templateKeys: string[];
  searchAnimeId: number | null;
}

export interface PlayerLockedInPayload {
  playerId: string;
}

export interface BothLockedInPayload {
  message: string;
  currentTurn: string;
}

export interface GuessResultPayload {
  correct: boolean;
  guesserId: string;
  guesserName: string;
  guessedValue: number | string;
  actualValue: number | string;
  winnerId: string | null;
}

export interface RematchRequestedPayload {
  playerId: string;
}

export interface RematchAcceptedPayload {
  message: string;
}

export interface CharacterAskedPayload {
  askerId: string;
  askerName: string;
  characterId: number;
  characterName: string;
  characterImage: string;
}

export interface CharacterAnsweredPayload {
  askerId: string;
  characterId: number;
  characterName: string;
  characterImage: string;
  valid: boolean;
  answererName: string;
  nextTurn: string;
}

export interface RuleGuessSubmittedPayload {
  guesserId: string;
  guesserName: string;
  guess: string;
}

export interface RuleGuessJudgedPayload {
  correct: boolean;
  guesserId: string;
  guesserName: string;
  guess: string;
  actualRule: string;
  winnerId: string | null;
  nextTurn: string | null;
}
