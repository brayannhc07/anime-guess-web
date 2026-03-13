"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useLanguage } from "@/contexts/language-context";
import { resetStats } from "@/lib/game-stats";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/shared/language-toggle";

interface InlineJoinFormProps {
  roomCode: string;
}

export function InlineJoinForm({ roomCode }: InlineJoinFormProps) {
  const { t } = useLanguage();
  const { setPlayer, setRoomCode, setPlayers } = useGameStore();
  const { joinRoom } = useGameActions();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const id = crypto.randomUUID();
      setPlayer(id, name.trim());
      const room = await joinRoom(roomCode);
      setRoomCode(room.code);
      setPlayers(room.players);
      resetStats();
    } catch {
      toast.error(t("error.joinRoom"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">{t("home.title")}</h1>
        <p className="text-muted-foreground">{t("home.subtitle")}</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("home.joinRoom")}: {roomCode}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("home.yourName")}</Label>
            <Input
              placeholder={t("home.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              autoFocus
            />
          </div>
          <Button onClick={handleJoin} disabled={!name.trim() || loading} className="w-full">
            {loading ? t("home.joining") : t("home.joinRoom")}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
