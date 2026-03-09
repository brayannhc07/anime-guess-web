"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGameStore } from "@/stores/game-store";

export function JoinRoomForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPlayer, setRoomCode, setPlayers } = useGameStore();

  async function handleJoin() {
    if (!name.trim() || !code.trim()) return;
    const id = crypto.randomUUID();
    setPlayer(id, name.trim());
    setLoading(true);
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          playerName: name.trim(),
          playerId: id,
        }),
      });
      if (!res.ok) throw new Error("Room not found or full");
      const room = await res.json();
      setRoomCode(room.code);
      setPlayers(room.players);
      router.push(`/room/${room.code}`);
    } catch {
      alert("Room not found or full");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Join Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="join-name">Your Name</Label>
          <Input
            id="join-name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="join-code">Room Code</Label>
          <Input
            id="join-code"
            placeholder="ABC12"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
        </div>
        <Button
          onClick={handleJoin}
          disabled={!name.trim() || !code.trim() || loading}
          className="w-full"
        >
          {loading ? "Joining..." : "Join Room"}
        </Button>
      </CardContent>
    </Card>
  );
}
