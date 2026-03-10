"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatePicker } from "./template-picker";
import { AnimeSearchPicker } from "./anime-search-picker";
import { GenerationPicker } from "./generation-picker";
import { ModePicker } from "./mode-picker";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { pickRandomFromTemplates, getMultiTemplatePoolSize, useAnimeCharacters, type GenderFilter } from "@/hooks/use-character-list";
import { GRID_SIZE } from "@/lib/constants";
import { pickRandomPokemonIds, getGenerationSize } from "@/lib/pokemon";
import type { GameMode, CharacterSource } from "@/types/room";

export function LobbyView() {
  const { roomCode, players, playerId } = useGameStore();
  const { startGame } = useGameActions();

  const [characterSource, setCharacterSource] = useState<CharacterSource>("template");
  const [templateKeys, setTemplateKeys] = useState<string[]>([]);
  const [searchAnimeId, setSearchAnimeId] = useState<number | null>(null);
  const [searchAnimeName, setSearchAnimeName] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [pokemonGeneration, setPokemonGeneration] = useState("gen1");
  const [mode, setMode] = useState<GameMode>("classic");
  const [loading, setLoading] = useState(false);

  const { data: searchCharacters } = useAnimeCharacters(
    characterSource === "search" ? searchAnimeId : null
  );

  const isHost = players.find((p) => p.id === playerId)?.isHost ?? false;
  const hasTwoPlayers = players.length === 2;

  const poolSize = characterSource === "template"
    ? getMultiTemplatePoolSize(templateKeys, genderFilter)
    : characterSource === "pokemon"
      ? getGenerationSize(pokemonGeneration)
      : (searchCharacters?.length ?? 0);
  const canStart = hasTwoPlayers && poolSize >= GRID_SIZE;

  async function handleStart() {
    if (!isHost || !canStart) return;
    setLoading(true);
    try {
      let characterIds: number[];
      if (characterSource === "template") {
        const picked = pickRandomFromTemplates(templateKeys, GRID_SIZE, genderFilter);
        characterIds = picked.map((c) => c.id);
      } else if (characterSource === "pokemon") {
        characterIds = pickRandomPokemonIds(pokemonGeneration, GRID_SIZE);
      } else {
        // Search mode: pick 24 random from fetched characters
        const chars = [...(searchCharacters ?? [])];
        for (let i = chars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        characterIds = chars.slice(0, GRID_SIZE).map((c) => c.id);
      }

      const genParam = characterSource === "pokemon" ? pokemonGeneration : null;
      await startGame(roomCode, characterIds, mode, characterSource, templateKeys, searchAnimeId, genParam);
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
          {/* Source toggle */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Character Source</p>
            <div className="flex gap-2">
              <Button
                variant={characterSource === "template" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("template")}
                disabled={!isHost}
              >
                Templates
              </Button>
              <Button
                variant={characterSource === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("search")}
                disabled={!isHost}
              >
                Search Anime
              </Button>
              <Button
                variant={characterSource === "pokemon" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("pokemon")}
                disabled={!isHost}
              >
                Pokemon
              </Button>
            </div>
          </div>

          {characterSource === "template" ? (
            <TemplatePicker value={templateKeys} onChange={setTemplateKeys} disabled={!isHost} />
          ) : characterSource === "pokemon" ? (
            <GenerationPicker value={pokemonGeneration} onChange={setPokemonGeneration} disabled={!isHost} />
          ) : (
            <AnimeSearchPicker
              selectedAnimeId={searchAnimeId}
              selectedAnimeName={searchAnimeName}
              onChange={(id, name) => {
                setSearchAnimeId(id);
                setSearchAnimeName(name);
              }}
              disabled={!isHost}
            />
          )}

          {characterSource === "template" && templateKeys.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Gender Filter</p>
              <div className="flex gap-2">
                {(["all", "male", "female"] as const).map((g) => (
                  <Button
                    key={g}
                    variant={genderFilter === g ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGenderFilter(g)}
                    disabled={!isHost}
                  >
                    {g === "all" ? "All" : g === "male" ? "Male" : "Female"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {poolSize > 0 && (
            <p className="text-sm text-muted-foreground">
              {poolSize} unique characters available ({GRID_SIZE} randomly picked per game)
              {poolSize < GRID_SIZE && (
                <span className="text-red-500 ml-1">
                  — need at least {GRID_SIZE}, select more packs
                </span>
              )}
            </p>
          )}

          <ModePicker value={mode} onChange={setMode} disabled={!isHost} />

          {isHost ? (
            <Button onClick={handleStart} disabled={!canStart || loading} className="w-full">
              {loading ? "Starting..." : canStart ? "Start Game" : hasTwoPlayers ? `Need ${GRID_SIZE}+ characters` : "Waiting for opponent..."}
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
