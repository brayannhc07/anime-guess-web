import { NextRequest, NextResponse } from "next/server";
import { removePlayer } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const result = await removePlayer(code, playerId);
  if (!result) {
    return NextResponse.json({ error: "Room or player not found" }, { status: 404 });
  }

  const pusher = getPusherServer();

  if (result.room.players.length > 0) {
    await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.PLAYER_LEFT, {
      playerId,
      wasGamePlayer: result.wasGamePlayer,
      newHostId: result.newHostId,
    });

    // If a game player left mid-game, also send game cancelled
    if (result.wasGamePlayer && result.room.phase === "lobby") {
      await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.GAME_CANCELLED, {});
    }
  }

  return NextResponse.json({ ok: true });
}
