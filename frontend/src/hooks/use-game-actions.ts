"use client";

import { useGameStore } from "@/stores/game-store";
import type { CharacterSource } from "@/types/room";

export function useGameActions() {
  const { playerId, playerName } = useGameStore();

  async function createRoom() {
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, playerId }),
    });
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  }

  async function joinRoom(code: string) {
    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.toUpperCase(), playerName, playerId }),
    });
    if (!res.ok) throw new Error("Room not found or full");
    return res.json();
  }

  async function startGame(
    code: string,
    characterIds: number[],
    mode: string,
    characterSource: CharacterSource,
    templateKeys: string[],
    searchAnimeId: number | null,
    pokemonGeneration: string[] | null = null
  ) {
    const res = await fetch("/api/room/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, characterIds, mode, characterSource, templateKeys, searchAnimeId, pokemonGeneration }),
    });
    if (!res.ok) throw new Error("Failed to start game");
    return res.json();
  }

  async function selectCharacter(code: string, selection: number | null, rule: string | null) {
    const res = await fetch("/api/room/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, selection, rule }),
    });
    if (!res.ok) throw new Error("Failed to lock in selection");
    return res.json();
  }

  async function askCharacter(
    code: string,
    characterId: number,
    characterName: string,
    characterImage: string
  ) {
    const res = await fetch("/api/room/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, characterId, characterName, characterImage }),
    });
    if (!res.ok) throw new Error("Cannot ask right now");
    return res.json();
  }

  async function answerCharacter(code: string, valid: boolean) {
    const res = await fetch("/api/room/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, valid }),
    });
    if (!res.ok) throw new Error("Cannot answer right now");
    return res.json();
  }

  async function makeGuess(code: string, guess: number | string) {
    const res = await fetch("/api/room/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, guess }),
    });
    if (!res.ok) throw new Error("Failed to make guess");
    return res.json();
  }

  async function submitRuleGuess(code: string, guess: string) {
    const res = await fetch("/api/room/rule-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, guess }),
    });
    if (!res.ok) throw new Error("Failed to submit rule guess");
    return res.json();
  }

  async function judgeRuleGuess(code: string, correct: boolean) {
    const res = await fetch("/api/room/rule-judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, correct }),
    });
    if (!res.ok) throw new Error("Failed to judge rule guess");
    return res.json();
  }

  async function cancelGame(code: string) {
    const res = await fetch("/api/room/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId }),
    });
    if (!res.ok) throw new Error("Failed to cancel game");
    return res.json();
  }

  async function requestRematch(code: string) {
    const res = await fetch("/api/room/rematch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId }),
    });
    if (!res.ok) throw new Error("Failed to request rematch");
    return res.json();
  }

  async function broadcastRemaining(code: string, remaining: number) {
    await fetch("/api/room/remaining", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, remaining }),
    }).catch(() => {});
  }

  async function leaveRoomServer(code: string) {
    await fetch("/api/room/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId }),
    }).catch(() => {});
  }

  return {
    createRoom, joinRoom, startGame, selectCharacter,
    askCharacter, answerCharacter, makeGuess, submitRuleGuess, judgeRuleGuess, cancelGame, requestRematch, broadcastRemaining, leaveRoomServer,
  };
}
