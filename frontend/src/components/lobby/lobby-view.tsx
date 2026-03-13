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
import { pickRandomPokemonIdsMultiGen, getMultiGenerationSize } from "@/lib/pokemon";
import type { GameMode, CharacterSource } from "@/types/room";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export function LobbyView() {
  const { roomCode, players, playerId } = useGameStore();
  const { startGame } = useGameActions();
  const { t } = useLanguage();

  const [characterSource, setCharacterSource] = useState<CharacterSource>("template");
  const [templateKeys, setTemplateKeys] = useState<string[]>([]);
  const [searchAnimeId, setSearchAnimeId] = useState<number | null>(null);
  const [searchAnimeName, setSearchAnimeName] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [pokemonGenerations, setPokemonGenerations] = useState<string[]>([]);
  const [mode, setMode] = useState<GameMode>("classic");
  const [loading, setLoading] = useState(false);

  const { data: searchCharacters } = useAnimeCharacters(
    characterSource === "search" ? searchAnimeId : null
  );

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const isSpectator = me?.isSpectator ?? false;
  const gamePlayers = players.filter((p) => !p.isSpectator);
  const spectators = players.filter((p) => p.isSpectator);
  const hasTwoPlayers = gamePlayers.length === 2;

  const poolSize = characterSource === "template"
    ? getMultiTemplatePoolSize(templateKeys, genderFilter)
    : characterSource === "pokemon"
      ? getMultiGenerationSize(pokemonGenerations)
      : (searchCharacters?.length ?? 0);

  const ruleMasterSourceReady =
    characterSource === "pokemon" ||
    (characterSource === "search" && searchAnimeId !== null) ||
    (characterSource === "template" && templateKeys.length > 0);

  const canStart = mode === "classic"
    ? hasTwoPlayers && poolSize >= GRID_SIZE
    : hasTwoPlayers && ruleMasterSourceReady;

  async function handleStart() {
    if (!isHost || !canStart) return;
    setLoading(true);
    try {
      let characterIds: number[];

      if (mode === "rule-master") {
        // Rule Master doesn't need a pre-built grid — characters are searched live
        characterIds = [];
      } else if (characterSource === "template") {
        const picked = pickRandomFromTemplates(templateKeys, GRID_SIZE, genderFilter);
        characterIds = picked.map((c) => c.id);
      } else if (characterSource === "pokemon") {
        characterIds = pickRandomPokemonIdsMultiGen(pokemonGenerations, GRID_SIZE);
      } else {
        // Search mode: pick 24 random from fetched characters
        const chars = [...(searchCharacters ?? [])];
        for (let i = chars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        characterIds = chars.slice(0, GRID_SIZE).map((c) => c.id);
      }

      const genParam = characterSource === "pokemon" ? pokemonGenerations : null;
      await startGame(roomCode, characterIds, mode, characterSource, templateKeys, searchAnimeId, genParam);
    } catch {
      toast.error(t("error.startGame"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("lobby.room")}: {roomCode}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = `${window.location.origin}/room/${roomCode}`;
                navigator.clipboard.writeText(url);
                toast(t("toast.linkCopied"));
              }}
            >
              {t("lobby.copyCode")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("lobby.players")}</p>
            <div className="flex gap-2 flex-wrap">
              {gamePlayers.map((p) => (
                <Badge key={p.id} variant={p.isHost ? "default" : "secondary"}>
                  {p.name} {p.isHost && "(Host)"}
                </Badge>
              ))}
              {gamePlayers.length < 2 && (
                <Badge variant="outline" className="text-muted-foreground">
                  {t("lobby.waitingOpponent")}
                </Badge>
              )}
            </div>
          </div>
          {spectators.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("lobby.spectators")}</p>
              <div className="flex gap-2 flex-wrap">
                {spectators.map((p) => (
                  <Badge key={p.id} variant="outline">
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("lobby.gameSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ModePicker value={mode} onChange={setMode} disabled={!isHost} />

          {/* Source toggle */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("lobby.characterSource")}</p>
            <div className="flex gap-2">
              <Button
                variant={characterSource === "template" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("template")}
                disabled={!isHost}
              >
                {t("lobby.templates")}
              </Button>
              <Button
                variant={characterSource === "search" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("search")}
                disabled={!isHost}
              >
                {t("lobby.searchAnime")}
              </Button>
              <Button
                variant={characterSource === "pokemon" ? "default" : "outline"}
                size="sm"
                onClick={() => setCharacterSource("pokemon")}
                disabled={!isHost}
              >
                {t("lobby.pokemon")}
              </Button>
            </div>
          </div>

          {characterSource === "template" ? (
            <TemplatePicker value={templateKeys} onChange={setTemplateKeys} disabled={!isHost} />
          ) : characterSource === "pokemon" ? (
            mode === "rule-master" ? (
              <p className="text-sm text-muted-foreground">
                {t("lobby.searchAllPokemon")}
              </p>
            ) : (
              <GenerationPicker value={pokemonGenerations} onChange={setPokemonGenerations} disabled={!isHost} />
            )
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

          {mode === "classic" && characterSource === "template" && templateKeys.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("lobby.genderFilter")}</p>
              <div className="flex gap-2">
                {(["all", "male", "female"] as const).map((g) => (
                  <Button
                    key={g}
                    variant={genderFilter === g ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGenderFilter(g)}
                    disabled={!isHost}
                  >
                    {g === "all" ? t("lobby.genderAll") : g === "male" ? t("lobby.genderMale") : t("lobby.genderFemale")}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {mode === "classic" && poolSize > 0 && (
            <p className="text-sm text-muted-foreground">
              {t("lobby.poolSize", { count: poolSize, grid: GRID_SIZE })}
              {poolSize < GRID_SIZE && (
                <span className="text-red-500 ml-1">
                  — {t("lobby.needMore", { grid: GRID_SIZE, type: t(characterSource === "pokemon" ? "lobby.generations" : "lobby.packs") })}
                </span>
              )}
            </p>
          )}

          {isSpectator ? (
            <p className="text-center text-muted-foreground text-sm">
              {t("lobby.spectating")}
            </p>
          ) : isHost ? (
            <Button onClick={handleStart} disabled={!canStart || loading} className="w-full">
              {loading
                ? t("lobby.starting")
                : canStart
                  ? t("lobby.startGame")
                  : hasTwoPlayers
                    ? mode === "classic"
                      ? t("lobby.needCharacters", { grid: GRID_SIZE })
                      : characterSource === "search"
                        ? t("lobby.selectAnime")
                        : characterSource === "pokemon"
                          ? t("lobby.selectGenerations")
                          : t("lobby.selectTemplates")
                    : t("lobby.waitingOpponent")}
            </Button>
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              {t("lobby.waitingHost")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
