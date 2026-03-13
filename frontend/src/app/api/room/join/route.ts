import { NextRequest, NextResponse } from "next/server";
import { joinRoom } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerName, playerId } = await req.json();
  if (!code || !playerName || !playerId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const room = joinRoom(code.toUpperCase(), playerName, playerId);
  if (!room) {
    return NextResponse.json({ error: "Room not found or full" }, { status: 404 });
  }

  const joinedPlayer = room.players.find((p) => p.id === playerId)!;
  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${room.code}`, PUSHER_EVENTS.PLAYER_JOINED, {
    playerId,
    playerName,
    isSpectator: joinedPlayer.isSpectator,
  });

  return NextResponse.json(room);
}
