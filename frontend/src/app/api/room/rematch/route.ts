import { NextRequest, NextResponse } from "next/server";
import { requestRematch } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const result = requestRematch(code, playerId);
  if (!result) {
    return NextResponse.json({ error: "Room or player not found" }, { status: 404 });
  }

  const pusher = getPusherServer();

  if (result.bothRequested) {
    await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.REMATCH_ACCEPTED, {
      message: "Rematch accepted! Back to lobby.",
    });
  } else {
    await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.REMATCH_REQUESTED, {
      playerId,
    });
  }

  return NextResponse.json(result.room);
}
