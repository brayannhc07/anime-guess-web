"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/game-store";

const KEEPALIVE_INTERVAL = 30_000; // 30 seconds

/**
 * Periodically pings the server to keep the room alive in memory.
 * In Classic mode there's no message exchange during gameplay,
 * so without this the server-side room state can get garbage-collected
 * when the serverless function goes cold.
 */
export function useKeepAlive(roomCode: string) {
  const playerId = useGameStore((s) => s.playerId);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (!roomCode || !playerId) return;
    // Only keepalive during active game phases (selection, playing, finished)
    if (phase === "lobby") return;

    const ping = () => {
      fetch(`/api/room/get?code=${roomCode}&playerId=${playerId}`).catch(
        () => {
          // Silent fail - if the room is truly gone, the next user action will handle it
        }
      );
    };

    const interval = setInterval(ping, KEEPALIVE_INTERVAL);
    return () => clearInterval(interval);
  }, [roomCode, playerId, phase]);
}
