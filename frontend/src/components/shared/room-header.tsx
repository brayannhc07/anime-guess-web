"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { MoreHorizontalIcon } from "lucide-react";

export function RoomHeader() {
  const { roomCode, players, playerId, clearEliminated, undoEliminated, eliminatedHistory, phase, mode, leaveRoom } = useGameStore();
  const { cancelGame, leaveRoomServer } = useGameActions();
  const { t } = useLanguage();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const me = players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;
  const isSpectator = me?.isSpectator ?? false;
  const spectatorCount = players.filter((p) => p.isSpectator).length;
  const showCancel = isHost && phase !== "lobby";
  const showBoardActions = !isSpectator && (phase === "playing" || phase === "selection") && mode === "classic";

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleCancel() {
    if (phase !== "lobby" && !window.confirm(t("header.confirmCancel"))) return;
    setCancelling(true);
    try {
      await cancelGame(roomCode);
    } catch {
      toast.error(t("error.cancel"));
    } finally {
      setCancelling(false);
      setMenuOpen(false);
    }
  }

  async function handleLeave() {
    if (phase !== "lobby" && !window.confirm(t("header.confirmLeave"))) return;
    await leaveRoomServer(roomCode);
    leaveRoom();
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-lg font-bold shrink-0">{t("lobby.room")}: {roomCode}</h1>
        <div className="flex gap-1 flex-wrap min-w-0">
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

      {/* Desktop: show all buttons */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle />
        {showBoardActions && (
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

      {/* Mobile: compact menu */}
      <div className="sm:hidden relative shrink-0" ref={menuRef}>
        <div className="flex items-center gap-1">
          {showBoardActions && eliminatedHistory.length > 0 && (
            <Button variant="outline" size="sm" onClick={undoEliminated}>
              {t("header.undo")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontalIcon className="h-5 w-5" />
          </Button>
        </div>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 bg-background border rounded-lg shadow-lg p-2 space-y-1 min-w-40">
            <div className="flex items-center gap-2 px-2 py-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            {showBoardActions && (
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { clearEliminated(); setMenuOpen(false); }}>
                {t("header.resetBoard")}
              </Button>
            )}
            {showCancel && (
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? t("header.cancelling") : t("header.backToLobby")}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600" onClick={handleLeave}>
              {t("header.leaveRoom")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
