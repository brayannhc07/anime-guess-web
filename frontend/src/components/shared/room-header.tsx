"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { ThemeToggle } from "./theme-toggle";

export function RoomHeader() {
  const { roomCode, players, playerId, clearEliminated, phase, mode, leaveRoom } = useGameStore();
  const { cancelGame } = useGameActions();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const isHost = players.find((p) => p.id === playerId)?.isHost ?? false;
  const showCancel = isHost && phase !== "lobby";

  async function handleCancel() {
    if (phase !== "lobby" && !window.confirm("This will end the current game and return both players to the lobby. Continue?")) return;
    setCancelling(true);
    try {
      await cancelGame(roomCode);
    } catch {
      alert("Failed to cancel game");
    } finally {
      setCancelling(false);
    }
  }

  function handleLeave() {
    if (phase !== "lobby" && !window.confirm("You'll leave the room and lose your current game. Continue?")) return;
    leaveRoom();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">Room: {roomCode}</h1>
        <div className="flex gap-1">
          {players.map((p) => (
            <Badge key={p.id} variant={p.isHost ? "default" : "secondary"} className="text-xs">
              {p.name}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {(phase === "playing" || phase === "selection") && mode === "classic" && (
          <Button variant="outline" size="sm" onClick={clearEliminated}>
            Reset Board
          </Button>
        )}
        {showCancel && (
          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Back to Lobby"}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleLeave}>
          Leave Room
        </Button>
      </div>
    </div>
  );
}
