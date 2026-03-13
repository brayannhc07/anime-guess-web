"use client";

import { useEffect, useRef } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "@/lib/pusher-client";
import { useGameStore } from "@/stores/game-store";
import { PUSHER_EVENTS } from "@/types/pusher-events";
import type { RoomState } from "@/types/room";
import type {
  GameStartedPayload,
  PlayerJoinedPayload,
  PlayerLockedInPayload,
  BothLockedInPayload,
  GuessResultPayload,
  RematchRequestedPayload,
  CharacterAskedPayload,
  CharacterAnsweredPayload,
  RuleGuessSubmittedPayload,
  RuleGuessJudgedPayload,
  RemainingCountPayload,
  PlayerLeftPayload,
} from "@/types/pusher-events";
import { toast } from "sonner";
import { playJoinSound, playStartSound, playTurnSound, playCorrectSound, playWrongSound, playNotificationSound } from "@/lib/sounds";
import { recordWin, recordLoss } from "@/lib/game-stats";
import type { TranslationKey } from "@/lib/i18n";

type TFunc = (key: TranslationKey, params?: Record<string, string | number>) => string;

export function useRoomChannel(roomCode: string, t: TFunc) {
  const channelRef = useRef<Channel | null>(null);
  const {
    setPhase,
    setMode,
    setCharacterSource,
    setTemplateKeys,
    setSearchAnimeId,
    setPokemonGeneration,
    setCharacterIds,
    setPlayers,
    updatePlayerLocked,
    setGuessResult,
    setWinner,
    setCurrentTurn,
    setPendingAsk,
    setPendingRuleGuess,
    setAskedCharacters,
    addAskedCharacter,
    players,
    playerId,
    clearEliminated,
  } = useGameStore();

  useEffect(() => {
    if (!roomCode) return;

    const pusher = getPusherClient();
    const channelName = `presence-room-${roomCode}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(PUSHER_EVENTS.PLAYER_JOINED, (data: PlayerJoinedPayload) => {
      if (data.playerId !== playerId) {
        toast(data.isSpectator ? t("toast.joinedSpectator", { name: data.playerName }) : t("toast.joined", { name: data.playerName }));
        playJoinSound();
      }
      setPlayers([
        ...players,
        {
          id: data.playerId,
          name: data.playerName,
          isHost: false,
          isSpectator: data.isSpectator,
          selection: null,
          rule: null,
          lockedIn: false,
          rematchRequested: false,
        },
      ]);
    });

    channel.bind(PUSHER_EVENTS.PLAYER_LEFT, (data: PlayerLeftPayload) => {
      const currentPlayers = useGameStore.getState().players;
      const leavingPlayer = currentPlayers.find((p) => p.id === data.playerId);
      let updated = currentPlayers.filter((p) => p.id !== data.playerId);

      // Transfer host if needed
      if (data.newHostId) {
        updated = updated.map((p) =>
          p.id === data.newHostId ? { ...p, isHost: true } : p
        );
      }

      // Promote first spectator to player if a game player left
      if (data.wasGamePlayer) {
        const gamePlayers = updated.filter((p) => !p.isSpectator);
        if (gamePlayers.length < 2) {
          const firstSpectator = updated.find((p) => p.isSpectator);
          if (firstSpectator) {
            updated = updated.map((p) =>
              p.id === firstSpectator.id ? { ...p, isSpectator: false } : p
            );
          }
        }
      }

      setPlayers(updated);
      if (leavingPlayer) {
        toast(t("toast.playerLeft", { name: leavingPlayer.name }));
        playNotificationSound();
      }
    });

    channel.bind(PUSHER_EVENTS.GAME_STARTED, (data: GameStartedPayload) => {
      setCharacterIds(data.characterIds);
      setMode(data.mode);
      setCharacterSource(data.characterSource);
      setTemplateKeys(data.templateKeys);
      setSearchAnimeId(data.searchAnimeId);
      setPokemonGeneration(data.pokemonGeneration);
      setPhase("selection");
      clearEliminated();
      setCurrentTurn(null);
      setPendingAsk(null);
      setPendingRuleGuess(null);
      setAskedCharacters([]);
      useGameStore.getState().setOpponentRemainingCount(null);
    });

    channel.bind(PUSHER_EVENTS.PLAYER_LOCKED_IN, (data: PlayerLockedInPayload) => {
      updatePlayerLocked(data.playerId);
      if (data.playerId !== playerId) {
        toast(t("toast.lockedIn"));
        playNotificationSound();
      }
    });

    channel.bind(PUSHER_EVENTS.BOTH_LOCKED_IN, (data: BothLockedInPayload) => {
      setPhase("playing");
      setCurrentTurn(data.currentTurn ?? null);
      toast(t("toast.gameOn"));
      playStartSound();
    });

    channel.bind(PUSHER_EVENTS.GAME_CANCELLED, () => {
      setPhase("lobby");
      setCharacterIds([]);
      clearEliminated();
      setGuessResult(null);
      setWinner(null);
      setCurrentTurn(null);
      setPendingAsk(null);
      setPendingRuleGuess(null);
      setAskedCharacters([]);
      const currentPlayers = useGameStore.getState().players;
      setPlayers(
        currentPlayers.map((p) => ({
          ...p,
          selection: null,
          rule: null,
          lockedIn: false,
          rematchRequested: false,
        }))
      );
      toast(t("toast.cancelled"));
    });

    channel.bind(PUSHER_EVENTS.CHARACTER_ASKED, (data: CharacterAskedPayload) => {
      setPendingAsk(data);
      if (data.askerId !== playerId) {
        toast(t("toast.asks", { name: data.askerName, character: data.characterName }));
        playNotificationSound();
      }
    });

    channel.bind(PUSHER_EVENTS.CHARACTER_ANSWERED, (data: CharacterAnsweredPayload) => {
      addAskedCharacter({
        id: data.characterId,
        name: data.characterName,
        image: data.characterImage,
        valid: data.valid,
        askerId: data.askerId,
      });
      setPendingAsk(null);
      setCurrentTurn(data.nextTurn);
      toast(data.valid
        ? t("toast.answeredYes", { name: data.answererName, character: data.characterName })
        : t("toast.answeredNo", { name: data.answererName, character: data.characterName })
      );
      if (data.nextTurn === playerId) playTurnSound();
    });

    channel.bind(PUSHER_EVENTS.RULE_GUESS_SUBMITTED, (data: RuleGuessSubmittedPayload) => {
      setPendingRuleGuess(data);
      if (data.guesserId !== playerId) {
        toast(t("toast.guessingRule", { name: data.guesserName, guess: data.guess }));
        playNotificationSound();
      }
    });

    channel.bind(PUSHER_EVENTS.RULE_GUESS_JUDGED, (data: RuleGuessJudgedPayload) => {
      setPendingRuleGuess(null);
      if (data.correct) {
        setGuessResult({
          correct: true,
          guesserId: data.guesserId,
          guesserName: data.guesserName,
          guessedValue: data.guess,
          actualValue: data.actualRule,
          winnerId: data.winnerId,
        });
        setWinner(data.winnerId);
        setPhase("finished");
        if (data.winnerId === playerId) { playCorrectSound(); recordWin(); }
        else { playWrongSound(); recordLoss(); }
      } else {
        setCurrentTurn(data.nextTurn);
        toast(t("toast.wrongRuleGuess", { guess: data.guess }));
        playWrongSound();
        if (data.nextTurn === playerId) setTimeout(playTurnSound, 500);
      }
    });

    channel.bind(PUSHER_EVENTS.GUESS_RESULT, (data: GuessResultPayload) => {
      if (data.correct) {
        setGuessResult(data);
        setWinner(data.winnerId);
        setPhase("finished");
        if (data.winnerId === playerId) { playCorrectSound(); recordWin(); }
        else { playWrongSound(); recordLoss(); }
      } else {
        // Wrong guess — game continues, auto-eliminate the wrong guess
        const isMe = data.guesserId === playerId;
        if (isMe && typeof data.guessedValue === "number") {
          const { eliminated, toggleEliminated } = useGameStore.getState();
          if (!eliminated.has(data.guessedValue)) {
            toggleEliminated(data.guessedValue);
          }
        }
        toast(isMe
          ? t("toast.wrongGuess")
          : t("toast.opponentWrongGuess", { name: data.guesserName })
        );
        playWrongSound();
      }
    });

    channel.bind(PUSHER_EVENTS.REMAINING_COUNT, (data: RemainingCountPayload) => {
      if (data.playerId !== playerId) {
        const store = useGameStore.getState();
        store.setOpponentRemainingCount(data.remaining);
        if (data.remaining <= 3 && data.remaining > 0) {
          toast(t("toast.opponentRemaining", { count: data.remaining, s: data.remaining === 1 ? "" : "s" }));
        }
      }
    });

    channel.bind(PUSHER_EVENTS.REMATCH_REQUESTED, (data: RematchRequestedPayload) => {
      if (data.playerId !== playerId) {
        toast(t("toast.wantsRematch"));
      }
    });

    channel.bind(PUSHER_EVENTS.REMATCH_ACCEPTED, () => {
      setPhase("lobby");
      setCharacterIds([]);
      clearEliminated();
      setGuessResult(null);
      setWinner(null);
      setCurrentTurn(null);
      setPendingAsk(null);
      setPendingRuleGuess(null);
      setAskedCharacters([]);
      // Reset player state for the new game
      const currentPlayers = useGameStore.getState().players;
      setPlayers(
        currentPlayers.map((p) => ({
          ...p,
          selection: null,
          rule: null,
          lockedIn: false,
          rematchRequested: false,
        }))
      );
      toast(t("toast.rematchAccepted"));
    });

    // Re-sync room state when Pusher reconnects after a disconnection
    // This catches any events missed while disconnected (common in Classic mode)
    const handleConnected = () => {
      const currentPlayerId = useGameStore.getState().playerId;
      if (!currentPlayerId) return;
      fetch(`/api/room/get?code=${roomCode}&playerId=${currentPlayerId}`)
        .then((res) => {
          if (!res.ok) return;
          return res.json() as Promise<RoomState>;
        })
        .then((room) => {
          if (!room) return;
          const store = useGameStore.getState();
          // Only sync if the server phase is ahead of ours
          if (room.phase !== store.phase) {
            setPhase(room.phase);
            setMode(room.mode);
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
          }
        })
        .catch(() => {});
    };

    pusher.connection.bind("connected", handleConnected);

    return () => {
      channel.unbind_all();
      pusher.connection.unbind("connected", handleConnected);
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);
}
