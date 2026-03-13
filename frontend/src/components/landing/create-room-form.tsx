"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { resetStats } from "@/lib/game-stats";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";

export function CreateRoomForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPlayer, setRoomCode, setPlayers } = useGameStore();
  const { createRoom } = useGameActions();
  const { t } = useLanguage();

  async function handleCreate() {
    if (!name.trim()) return;
    const id = crypto.randomUUID();
    setPlayer(id, name.trim());

    // Need to set player before calling createRoom which reads from store
    // But store update is sync in zustand, so we call the API directly
    setLoading(true);
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId: id }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const room = await res.json();
      setRoomCode(room.code);
      setPlayers(room.players);
      resetStats();
      router.push(`/room/${room.code}`);
    } catch {
      toast.error(t("error.createRoom"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("home.createRoom")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="create-name">{t("home.yourName")}</Label>
          <Input
            id="create-name"
            placeholder={t("home.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <Button onClick={handleCreate} disabled={!name.trim() || loading} className="w-full">
          {loading ? t("home.creating") : t("home.createRoom")}
        </Button>
      </CardContent>
    </Card>
  );
}
