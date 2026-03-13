import { Redis } from "@upstash/redis";
import type { GameMode, CharacterSource, RoomState } from "@/types/room";
import { generateCode } from "./generate-code";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ROOM_TTL_SECONDS = 2 * 60 * 60; // 2 hours

async function getRoom(code: string): Promise<RoomState | null> {
  return redis.get<RoomState>(`room:${code}`);
}

async function saveRoom(room: RoomState): Promise<void> {
  room.lastActivity = Date.now();
  await redis.set(`room:${room.code}`, room, { ex: ROOM_TTL_SECONDS });
}

async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = generateCode();
    const exists = await redis.exists(`room:${code}`);
    if (!exists) return code;
  }
  return generateCode() + generateCode().slice(0, 1);
}

export async function createRoom(hostName: string, hostId: string): Promise<RoomState> {
  const code = await generateUniqueCode();
  const room: RoomState = {
    code,
    lastActivity: Date.now(),
    phase: "lobby",
    mode: "classic",
    characterSource: "template",
    templateKeys: [],
    searchAnimeId: null,
    pokemonGeneration: null,
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        isSpectator: false,
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
  await saveRoom(room);
  return room;
}

export async function joinRoom(code: string, playerName: string, playerId: string): Promise<RoomState | null> {
  const room = await getRoom(code);
  if (!room) return null;
  if (room.players.some((p) => p.id === playerId)) return room;

  const activePlayers = room.players.filter((p) => !p.isSpectator);
  const isSpectator = activePlayers.length >= 2;

  room.players.push({
    id: playerId,
    name: playerName,
    isHost: false,
    isSpectator,
    selection: null,
    rule: null,
    lockedIn: false,
    rematchRequested: false,
  });
  await saveRoom(room);
  return room;
}

export async function fetchRoom(code: string): Promise<RoomState | null> {
  return getRoom(code);
}

export async function cancelGame(code: string, playerId: string): Promise<RoomState | null> {
  const room = await getRoom(code);
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
  await saveRoom(room);
  return room;
}

export async function startGame(
  code: string,
  characterIds: number[],
  mode: GameMode,
  characterSource: CharacterSource,
  templateKeys: string[],
  searchAnimeId: number | null,
  pokemonGeneration: string[] | null
): Promise<RoomState | null> {
  const room = await getRoom(code);
  if (!room) return null;
  room.phase = "selection";
  room.characterIds = characterIds;
  room.mode = mode;
  room.characterSource = characterSource;
  room.templateKeys = templateKeys;
  room.searchAnimeId = searchAnimeId;
  room.pokemonGeneration = pokemonGeneration;
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
  await saveRoom(room);
  return room;
}

export async function setPlayerSelection(
  code: string,
  playerId: string,
  selection: number | null,
  rule: string | null
): Promise<{ room: RoomState; bothLocked: boolean } | null> {
  const room = await getRoom(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.selection = selection;
  player.rule = rule;
  player.lockedIn = true;

  const gamePlayers = room.players.filter((p) => !p.isSpectator);
  const bothLocked = gamePlayers.length === 2 && gamePlayers.every((p) => p.lockedIn);
  if (bothLocked) {
    room.phase = "playing";
    if (room.mode === "rule-master") {
      const host = room.players.find((p) => p.isHost);
      room.currentTurn = host?.id ?? room.players[0].id;
    }
  }
  await saveRoom(room);
  return { room, bothLocked };
}

export async function askCharacter(
  code: string,
  askerId: string,
  characterId: number,
  characterName: string,
  characterImage: string
): Promise<RoomState | null> {
  const room = await getRoom(code);
  if (!room || room.mode !== "rule-master") return null;
  if (room.currentTurn !== askerId) return null;
  if (room.pendingAsk) return null;

  room.pendingAsk = { askerId, characterId, characterName, characterImage };
  await saveRoom(room);
  return room;
}

export async function answerCharacter(
  code: string,
  answererId: string,
  valid: boolean
): Promise<{ room: RoomState; askedCharacter: RoomState["pendingAsk"]; nextTurn: string } | null> {
  const room = await getRoom(code);
  if (!room || room.mode !== "rule-master") return null;
  if (!room.pendingAsk) return null;
  if (room.pendingAsk.askerId === answererId) return null;

  const pending = room.pendingAsk;
  room.askedCharacters.push({
    id: pending.characterId,
    name: pending.characterName,
    image: pending.characterImage,
    valid,
    askerId: pending.askerId,
  });

  const nextTurn = room.players.find((p) => p.id !== pending.askerId && !p.isSpectator)!.id;
  room.currentTurn = nextTurn;
  room.pendingAsk = null;
  await saveRoom(room);

  return { room, askedCharacter: pending, nextTurn };
}

export async function makeGuess(
  code: string,
  guesserId: string,
  guess: number | string
): Promise<{
  room: RoomState;
  correct: boolean;
  guesserName: string;
  actualValue: number | string;
} | null> {
  const room = await getRoom(code);
  if (!room) return null;
  if (room.mode !== "classic") return null;
  const guesser = room.players.find((p) => p.id === guesserId);
  if (!guesser) return null;
  const opponent = room.players.find((p) => p.id !== guesserId && !p.isSpectator);
  if (!opponent) return null;

  const correct = guess === opponent.selection;
  const actualValue = opponent.selection!;

  if (correct) {
    room.phase = "finished";
    room.winner = guesserId;
    room.guessResult = {
      correct,
      guesserId,
      actual: actualValue,
    };
  }
  await saveRoom(room);

  return { room, correct, guesserName: guesser.name, actualValue };
}

export async function submitRuleGuess(
  code: string,
  guesserId: string,
  guess: string
): Promise<{ room: RoomState; guesserName: string } | null> {
  const room = await getRoom(code);
  if (!room || room.mode !== "rule-master") return null;
  if (room.pendingRuleGuess) return null;
  const guesser = room.players.find((p) => p.id === guesserId);
  if (!guesser) return null;

  room.pendingRuleGuess = { guesserId, guess };
  room.pendingAsk = null;
  await saveRoom(room);
  return { room, guesserName: guesser.name };
}

export async function judgeRuleGuess(
  code: string,
  judgerId: string,
  correct: boolean
): Promise<{
  room: RoomState;
  guesserName: string;
  guess: string;
  actualRule: string;
} | null> {
  const room = await getRoom(code);
  if (!room || room.mode !== "rule-master") return null;
  if (!room.pendingRuleGuess) return null;
  if (room.pendingRuleGuess.guesserId === judgerId) return null;

  const guesser = room.players.find((p) => p.id === room.pendingRuleGuess!.guesserId);
  const judge = room.players.find((p) => p.id === judgerId);
  if (!guesser || !judge) return null;

  const guess = room.pendingRuleGuess.guess;
  const actualRule = judge.rule!;

  if (correct) {
    room.phase = "finished";
    room.winner = guesser.id;
    room.guessResult = { correct: true, guesserId: guesser.id, actual: actualRule };
  } else {
    const nextTurn = room.players.find((p) => p.id !== guesser.id && !p.isSpectator)!.id;
    room.currentTurn = nextTurn;
  }

  room.pendingRuleGuess = null;
  await saveRoom(room);
  return { room, guesserName: guesser.name, guess, actualRule };
}

export async function requestRematch(code: string, playerId: string): Promise<{ room: RoomState; bothRequested: boolean } | null> {
  const room = await getRoom(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return null;

  player.rematchRequested = true;

  const gamePlayers = room.players.filter((p) => !p.isSpectator);
  const bothRequested = gamePlayers.length === 2 && gamePlayers.every((p) => p.rematchRequested);
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

  await saveRoom(room);
  return { room, bothRequested };
}
