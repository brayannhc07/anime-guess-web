import { NextRequest, NextResponse } from "next/server";
import { setPlayerSelection } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, selection, rule } = await req.json();

  const result = await setPlayerSelection(code, playerId, selection ?? null, rule ?? null);
  if (!result) {
    return NextResponse.json({ error: "Room or player not found" }, { status: 404 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.PLAYER_LOCKED_IN, {
    playerId,
  });

  if (result.bothLocked) {
    await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.BOTH_LOCKED_IN, {
      message: "Both players locked in! Game on!",
      currentTurn: result.room.currentTurn,
    });
  }

  return NextResponse.json(result.room);
}
