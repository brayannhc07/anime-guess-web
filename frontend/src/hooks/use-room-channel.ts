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
} from "@/types/pusher-events";
import { toast } from "sonner";

export function useRoomChannel(roomCode: string) {
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
        toast(`${data.playerName} joined the room!`);
      }
      setPlayers([
        ...players,
        {
          id: data.playerId,
          name: data.playerName,
          isHost: false,
          selection: null,
          rule: null,
          lockedIn: false,
          rematchRequested: false,
        },
      ]);
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
    });

    channel.bind(PUSHER_EVENTS.PLAYER_LOCKED_IN, (data: PlayerLockedInPayload) => {
      updatePlayerLocked(data.playerId);
      if (data.playerId !== playerId) {
        toast("Opponent has locked in!");
      }
    });

    channel.bind(PUSHER_EVENTS.BOTH_LOCKED_IN, (data: BothLockedInPayload) => {
      setPhase("playing");
      setCurrentTurn(data.currentTurn ?? null);
      toast("Both players locked in! Game on!");
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
      toast("Host cancelled the game. Back to lobby.");
    });

    channel.bind(PUSHER_EVENTS.CHARACTER_ASKED, (data: CharacterAskedPayload) => {
      setPendingAsk(data);
      if (data.askerId !== playerId) {
        toast(`${data.askerName} asks: "Does ${data.characterName} fit?"`);
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
      const status = data.valid ? "Yes!" : "No!";
      toast(`${data.answererName} says ${status} (${data.characterName})`);
    });

    channel.bind(PUSHER_EVENTS.RULE_GUESS_SUBMITTED, (data: RuleGuessSubmittedPayload) => {
      setPendingRuleGuess(data);
      if (data.guesserId !== playerId) {
        toast(`${data.guesserName} is guessing your rule: "${data.guess}"`);
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
      } else {
        setCurrentTurn(data.nextTurn);
        toast(`Wrong guess! "${data.guess}" is not the rule.`);
      }
    });

    channel.bind(PUSHER_EVENTS.GUESS_RESULT, (data: GuessResultPayload) => {
      if (data.correct) {
        setGuessResult(data);
        setWinner(data.winnerId);
        setPhase("finished");
      } else {
        // Wrong guess — game continues, show feedback
        const isMe = data.guesserId === playerId;
        toast(
          isMe
            ? "Wrong guess! Game continues."
            : `${data.guesserName} guessed wrong! Game continues.`
        );
      }
    });

    channel.bind(PUSHER_EVENTS.REMATCH_REQUESTED, (data: RematchRequestedPayload) => {
      if (data.playerId !== playerId) {
        toast("Opponent wants a rematch!");
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
      toast("Rematch accepted! Back to lobby.");
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
