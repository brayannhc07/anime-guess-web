import { NextRequest, NextResponse } from "next/server";
import { cancelGame } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = cancelGame(code, playerId);
  if (!room) {
    return NextResponse.json({ error: "Only the host can cancel" }, { status: 403 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.GAME_CANCELLED, {});

  return NextResponse.json(room);
}
