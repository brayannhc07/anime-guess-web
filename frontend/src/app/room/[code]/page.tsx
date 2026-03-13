"use client";

import { use, useEffect, useState } from "react";
import { useGameStore } from "@/stores/game-store";
import { useRoomChannel } from "@/hooks/use-room-channel";
import { useKeepAlive } from "@/hooks/use-keepalive";
import { LobbyView } from "@/components/lobby/lobby-view";
import { SelectionPhase } from "@/components/game/selection-phase";
import { GameBoard } from "@/components/game/game-board";
import { GuessDialog } from "@/components/game/guess-dialog";
import { GameOverBanner } from "@/components/game/game-over-banner";
import { PlayerInfoBadge } from "@/components/game/player-info-badge";
import { RoomHeader } from "@/components/shared/room-header";
import { CharacterSearch } from "@/components/game/character-search";
import { AnswerPrompt } from "@/components/game/answer-prompt";
import { RuleMasterBoard } from "@/components/game/rule-master-board";
import { RuleGuessPrompt } from "@/components/game/rule-guess-prompt";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useRemainingBroadcast } from "@/hooks/use-remaining-broadcast";
import { useTitleFlash } from "@/hooks/use-title-flash";
import type { RoomState } from "@/types/room";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    phase, playerId, mode, currentTurn, pendingAsk, pendingRuleGuess, players, opponentRemainingCount,
    setRoomCode, setPhase, setMode, setCharacterSource, setTemplateKeys, setSearchAnimeId, setPokemonGeneration,
    setPlayers, setCharacterIds,
    setCurrentTurn, setPendingAsk, setPendingRuleGuess, setWinner, setGuessResult,
    hydratePlayer,
  } = useGameStore();

  useEffect(() => {
    // Try to restore player identity from sessionStorage
    if (!playerId) {
      hydratePlayer();
    }
  }, [playerId, hydratePlayer]);

  useEffect(() => {
    const currentPlayerId = useGameStore.getState().playerId;
    if (!currentPlayerId) {
      router.push("/");
      return;
    }

    setRoomCode(code);

    // If we have no players (page was reloaded), fetch room state from server
    if (useGameStore.getState().players.length === 0) {
      fetch(`/api/room/get?code=${code}&playerId=${currentPlayerId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Room not found");
          return res.json() as Promise<RoomState>;
        })
        .then((room) => {
          setPhase(room.phase);
          setMode(room.mode);
          setCharacterSource(room.characterSource);
          setTemplateKeys(room.templateKeys);
          setSearchAnimeId(room.searchAnimeId);
          setPokemonGeneration(room.pokemonGeneration);
          setPlayers(room.players);
          setCharacterIds(room.characterIds);
          setCurrentTurn(room.currentTurn);
          setWinner(room.winner);
          if (room.guessResult) {
            setGuessResult({
              correct: room.guessResult.correct,
              guesserId: room.guessResult.guesserId,
              guesserName: room.players.find((p) => p.id === room.guessResult!.guesserId)?.name ?? "",
              guessedValue: room.guessResult.actual,
              actualValue: room.guessResult.actual,
              winnerId: room.winner,
            });
          }
          if (room.pendingAsk) {
            const asker = room.players.find((p) => p.id === room.pendingAsk!.askerId);
            setPendingAsk({
              askerId: room.pendingAsk.askerId,
              askerName: asker?.name ?? "",
              characterId: room.pendingAsk.characterId,
              characterName: room.pendingAsk.characterName,
              characterImage: room.pendingAsk.characterImage,
            });
          }
          if (room.pendingRuleGuess) {
            const guesser = room.players.find((p) => p.id === room.pendingRuleGuess!.guesserId);
            setPendingRuleGuess({
              guesserId: room.pendingRuleGuess.guesserId,
              guesserName: guesser?.name ?? "",
              guess: room.pendingRuleGuess.guess,
            });
          }
          // Restore askedCharacters for rule-master
          const store = useGameStore.getState();
          if (room.askedCharacters && room.askedCharacters.length > 0 && store.askedCharacters.length === 0) {
            for (const ac of room.askedCharacters) {
              useGameStore.getState().addAskedCharacter(ac);
            }
          }
        })
        .catch(() => {
          router.push("/");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useRoomChannel(code);
  useKeepAlive(code);
  useRemainingBroadcast();

  const isMyTurn = currentTurn === playerId;
  const needsMyAttention = phase === "playing" && mode === "rule-master" && (
    isMyTurn ||
    (pendingAsk !== null && pendingAsk.askerId !== playerId) ||
    (pendingRuleGuess !== null && pendingRuleGuess.guesserId !== playerId)
  );
  useTitleFlash(needsMyAttention ? "Your turn! - Adivinamon" : null);

  if (loading || !playerId) return null;

  const isWaitingForAnswer = pendingAsk !== null && pendingAsk.askerId === playerId;
  const isWaitingForRuleJudgment = pendingRuleGuess !== null && pendingRuleGuess.guesserId === playerId;
  const isJudgingRuleGuess = pendingRuleGuess !== null && pendingRuleGuess.guesserId !== playerId;

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-4">
      <RoomHeader />

      {phase === "lobby" && <LobbyView />}
      {phase === "selection" && <SelectionPhase />}

      {phase === "playing" && mode === "classic" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {opponentRemainingCount !== null && opponentRemainingCount <= 3 ? (
              <Badge variant="destructive" className="text-sm px-3 py-1.5 animate-pulse">
                Opponent has {opponentRemainingCount} left!
              </Badge>
            ) : (
              <div />
            )}
            <GuessDialog />
          </div>
          <GameBoard />
        </div>
      )}

      {phase === "playing" && mode === "rule-master" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={isMyTurn ? "default" : "secondary"} className="text-sm px-3 py-1.5">
              {isWaitingForRuleJudgment
                ? "Waiting for opponent to judge your guess..."
                : isJudgingRuleGuess
                  ? "Judge your opponent's rule guess!"
                  : isWaitingForAnswer
                    ? "Waiting for opponent's answer..."
                    : isMyTurn
                      ? "Your turn - search for a character!"
                      : "Opponent's turn..."}
            </Badge>
            <GuessDialog />
          </div>
          <RuleGuessPrompt />
          <AnswerPrompt />
          <CharacterSearch />
          <RuleMasterBoard />
        </div>
      )}

      {phase === "finished" && (
        <div className="space-y-4">
          <GameOverBanner />
          {mode === "classic" ? <GameBoard /> : <RuleMasterBoard />}
        </div>
      )}

      <PlayerInfoBadge />
    </main>
  );
}
