"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useLanguage } from "@/contexts/language-context";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

export function RoomHeader() {
  const { roomCode, players, playerId, clearEliminated, undoEliminated, eliminatedHistory, phase, mode, leaveRoom } = useGameStore();
  const { cancelGame, leaveRoomServer } = useGameActions();
  const { t } = useLanguage();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const isSpectator = me?.isSpectator ?? false;
  const spectatorCount = players.filter((p) => p.isSpectator).length;
  const showCancel = isHost && phase !== "lobby";

  async function handleCancel() {
    if (phase !== "lobby" && !window.confirm(t("header.confirmCancel"))) return;
    setCancelling(true);
    try {
      await cancelGame(roomCode);
    } catch {
      alert("Failed to cancel game");
    } finally {
      setCancelling(false);
    }
  }

  async function handleLeave() {
    if (phase !== "lobby" && !window.confirm(t("header.confirmLeave"))) return;
    await leaveRoomServer(roomCode);
    leaveRoom();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold">{t("lobby.room")}: {roomCode}</h1>
        <div className="flex gap-1 flex-wrap">
          {players.filter((p) => !p.isSpectator).map((p) => (
            <Badge key={p.id} variant={p.isHost ? "default" : "secondary"} className="text-xs">
              {p.name}
            </Badge>
          ))}
          {spectatorCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {t("header.watching", { count: spectatorCount })}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        {!isSpectator && (phase === "playing" || phase === "selection") && mode === "classic" && (
          <>
            {eliminatedHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={undoEliminated}>
                {t("header.undo")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={clearEliminated}>
              {t("header.resetBoard")}
            </Button>
          </>
        )}
        {showCancel && (
          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? t("header.cancelling") : t("header.backToLobby")}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleLeave}>
          {t("header.leaveRoom")}
        </Button>
      </div>
    </div>
  );
}
