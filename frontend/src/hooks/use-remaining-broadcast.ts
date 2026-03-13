"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { GRID_SIZE } from "@/lib/constants";

export function useRemainingBroadcast() {
  const { roomCode, phase, mode, eliminated } = useGameStore();
  const { broadcastRemaining } = useGameActions();
  const prevRemainingRef = useRef(GRID_SIZE);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remaining = GRID_SIZE - eliminated.size;

  useEffect(() => {
    if (phase !== "playing" || mode !== "classic") return;
    if (remaining === prevRemainingRef.current) return;
    prevRemainingRef.current = remaining;

    // Debounce to avoid spamming API on rapid toggles
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      broadcastRemaining(roomCode, remaining);
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [remaining, phase, mode, roomCode, broadcastRemaining]);
}
