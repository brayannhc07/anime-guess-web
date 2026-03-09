import { NextRequest, NextResponse } from "next/server";
import { startGame } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";
import type { GameMode, AnimePreset } from "@/types/room";

export async function POST(req: NextRequest) {
  const { code, characterIds, mode, anime } = (await req.json()) as {
    code: string;
    characterIds: number[];
    mode: GameMode;
    anime: AnimePreset;
  };

  const room = startGame(code, characterIds, mode, anime);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.GAME_STARTED, {
    characterIds,
    mode,
    anime,
  });

  return NextResponse.json(room);
}
