"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimePicker } from "./anime-picker";
import { ModePicker } from "./mode-picker";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useCharacterList } from "@/hooks/use-character-list";
import type { GameMode, AnimePreset } from "@/types/room";

export function LobbyView() {
  const { roomCode, players, playerId } = useGameStore();
  const { startGame } = useGameActions();
  const [anime, setAnime] = useState<AnimePreset>("rezero");
  const [mode, setMode] = useState<GameMode>("classic");
  const [loading, setLoading] = useState(false);
  const { data: characters } = useCharacterList(anime);

  const isHost = players.find((p) => p.id === playerId)?.isHost ?? false;
  const hasTwoPlayers = players.length === 2;

  async function handleStart() {
    if (!isHost || !hasTwoPlayers) return;
    setLoading(true);
    try {
      // Classic mode uses a fixed grid of 24 characters; Rule Master has no pre-set grid
      const characterIds = mode === "classic" && characters
        ? characters.map((c) => c.id)
        : [];
      await startGame(roomCode, characterIds, mode, anime);
    } catch {
      alert("Failed to start game");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Room: {roomCode}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(roomCode)}
            >
              Copy Code
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Players</p>
            <div className="flex gap-2">
              {players.map((p) => (
                <Badge key={p.id} variant={p.isHost ? "default" : "secondary"}>
                  {p.name} {p.isHost && "(Host)"}
                </Badge>
              ))}
              {players.length < 2 && (
                <Badge variant="outline" className="text-muted-foreground">
                  Waiting for opponent...
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimePicker value={anime} onChange={setAnime} disabled={!isHost} />
          <ModePicker value={mode} onChange={setMode} disabled={!isHost} />

          {isHost ? (
            <Button onClick={handleStart} disabled={!hasTwoPlayers || loading} className="w-full">
              {loading ? "Starting..." : hasTwoPlayers ? "Start Game" : "Waiting for opponent..."}
            </Button>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              Waiting for host to start the game...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
