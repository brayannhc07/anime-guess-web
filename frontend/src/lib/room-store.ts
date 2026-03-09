import type { GameMode, CharacterSource, RoomState } from "@/types/room";
import { generateCode } from "./generate-code";

const globalForRooms = globalThis as unknown as {
  __rooms?: Map<string, RoomState>;
};

const rooms = globalForRooms.__rooms ?? new Map<string, RoomState>();
globalForRooms.__rooms = rooms;

export function createRoom(hostName: string, hostId: string): RoomState {
  const code = generateCode();
  const room: RoomState = {
    code,
    phase: "lobby",
    mode: "classic",
    characterSource: "template",
    templateKeys: [],
    searchAnimeId: null,
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        selection: null,
        rule: null,
        lockedIn: false,
        rematchRequested: false,
      },
    ],
    characterIds: [],
    winner: null,
    guessResult: null,
    currentTurn: null,
    askedCharacters: [],
    pendingAsk: null,
    pendingRuleGuess: null,
  };
  rooms.set(code, room);
  return room;
}

export function joinRoom(code: string, playerName: string, playerId: string): RoomState | null {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.players.length >= 2) return null;
  if (room.players.some((p) => p.id === playerId)) return room;

  room.players.push({
    id: playerId,
    name: playerName,
    isHost: false,
    selection: null,
    rule: null,
    lockedIn: false,
    rematchRequested: false,
  });
  return room;
}

export function getRoom(code: string): RoomState | null {
  return rooms.get(code) ?? null;
}

export function updateRoom(code: string, updates: Partial<RoomState>): RoomState | null {
  const room = rooms.get(code);
  if (!room) return null;
  Object.assign(room, updates);
  return room;
}

export function cancelGame(code: string, playerId: string): RoomState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player?.isHost) return null;

  room.phase = "lobby";
  room.characterIds = [];
  room.winner = null;
  room.guessResult = null;
  room.currentTurn = null;
  room.askedCharacters = [];
  room.pendingAsk = null;
  room.pendingRuleGuess = null;
  for (const p of room.players) {
    p.selection = null;
    p.rule = null;
    p.lockedIn = false;
    p.rematchRequested = false;
  }
  return room;
}

export function startGame(
  code: string,
  characterIds: number[],
  mode: GameMode,
  characterSource: CharacterSource,
  templateKeys: string[],
  searchAnimeId: number | null
): RoomState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.phase = "selection";
  room.characterIds = characterIds;
  room.mode = mode;
  room.characterSource = characterSource;
  room.templateKeys = templateKeys;
  room.searchAnimeId = searchAnimeId;
  room.winner = null;
  room.guessResult = null;
  room.currentTurn = null;
  room.askedCharacters = [];
  room.pendingAsk = null;
  room.pendingRuleGuess = null;
  for (const player of room.players) {
    player.selection = null;
    player.rule = null;
    player.lockedIn = false;
    player.rematchRequested = false;
  }
  return room;
}

export function setPlayerSelection(
  code: string,
  playerId: string,
  selection: number | null,
  rule: string | null
): { room: RoomState; bothLocked: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.selection = selection;
  player.rule = rule;
  player.lockedIn = true;

  const bothLocked = room.players.length === 2 && room.players.every((p) => p.lockedIn);
  if (bothLocked) {
    room.phase = "playing";
    // In rule-master, host goes first
    if (room.mode === "rule-master") {
      const host = room.players.find((p) => p.isHost);
      room.currentTurn = host?.id ?? room.players[0].id;
    }
  }
  return { room, bothLocked };
}

export function askCharacter(
  code: string,
  askerId: string,
  characterId: number,
  characterName: string,
  characterImage: string
): RoomState | null {
  const room = rooms.get(code);
  if (!room || room.mode !== "rule-master") return null;
  if (room.currentTurn !== askerId) return null;
  if (room.pendingAsk) return null; // already waiting for an answer

  room.pendingAsk = { askerId, characterId, characterName, characterImage };
  return room;
}

export function answerCharacter(
  code: string,
  answererId: string,
  valid: boolean
): { room: RoomState; askedCharacter: RoomState["pendingAsk"]; nextTurn: string } | null {
  const room = rooms.get(code);
  if (!room || room.mode !== "rule-master") return null;
  if (!room.pendingAsk) return null;
  // Only the non-asker can answer
  if (room.pendingAsk.askerId === answererId) return null;

  const pending = room.pendingAsk;
  room.askedCharacters.push({
    id: pending.characterId,
    name: pending.characterName,
    image: pending.characterImage,
    valid,
    askerId: pending.askerId,
  });

  // Switch turns
  const nextTurn = room.players.find((p) => p.id !== pending.askerId)!.id;
  room.currentTurn = nextTurn;
  room.pendingAsk = null;

  return { room, askedCharacter: pending, nextTurn };
}

export function makeGuess(
  code: string,
  guesserId: string,
  guess: number | string
): {
  room: RoomState;
  correct: boolean;
  guesserName: string;
  actualValue: number | string;
} | null {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.mode !== "classic") return null; // rule-master uses submitRuleGuess/judgeRuleGuess
  const guesser = room.players.find((p) => p.id === guesserId);
  if (!guesser) return null;
  const opponent = room.players.find((p) => p.id !== guesserId);
  if (!opponent) return null;

  const correct = guess === opponent.selection;
  const actualValue = opponent.selection!;

  room.phase = "finished";
  room.winner = correct ? guesserId : opponent.id;
  room.guessResult = {
    correct,
    guesserId,
    actual: actualValue,
  };

  return { room, correct, guesserName: guesser.name, actualValue };
}

export function submitRuleGuess(
  code: string,
  guesserId: string,
  guess: string
): { room: RoomState; guesserName: string } | null {
  const room = rooms.get(code);
  if (!room || room.mode !== "rule-master") return null;
  if (room.pendingRuleGuess) return null; // already pending
  const guesser = room.players.find((p) => p.id === guesserId);
  if (!guesser) return null;

  room.pendingRuleGuess = { guesserId, guess };
  room.pendingAsk = null;
  return { room, guesserName: guesser.name };
}

export function judgeRuleGuess(
  code: string,
  judgerId: string,
  correct: boolean
): {
  room: RoomState;
  guesserName: string;
  guess: string;
  actualRule: string;
} | null {
  const room = rooms.get(code);
  if (!room || room.mode !== "rule-master") return null;
  if (!room.pendingRuleGuess) return null;
  if (room.pendingRuleGuess.guesserId === judgerId) return null; // can't judge own guess

  const guesser = room.players.find((p) => p.id === room.pendingRuleGuess!.guesserId);
  const judge = room.players.find((p) => p.id === judgerId);
  if (!guesser || !judge) return null;

  const guess = room.pendingRuleGuess.guess;
  const actualRule = judge.rule!; // the rule the judge set for the guesser

  if (correct) {
    room.phase = "finished";
    room.winner = guesser.id;
    room.guessResult = { correct: true, guesserId: guesser.id, actual: actualRule };
  } else {
    // Wrong guess - switch turn to guesser's opponent (i.e. guesser loses their turn)
    const nextTurn = room.players.find((p) => p.id !== guesser.id)!.id;
    room.currentTurn = nextTurn;
  }

  room.pendingRuleGuess = null;
  return { room, guesserName: guesser.name, guess, actualRule };
}

export function requestRematch(code: string, playerId: string): { room: RoomState; bothRequested: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.rematchRequested = true;

  const bothRequested = room.players.length === 2 && room.players.every((p) => p.rematchRequested);
  if (bothRequested) {
    room.phase = "lobby";
    room.characterIds = [];
    room.winner = null;
    room.guessResult = null;
    room.currentTurn = null;
    room.askedCharacters = [];
    room.pendingAsk = null;
    room.pendingRuleGuess = null;
    for (const p of room.players) {
      p.selection = null;
      p.rule = null;
      p.lockedIn = false;
      p.rematchRequested = false;
    }
  }

  return { room, bothRequested };
}
