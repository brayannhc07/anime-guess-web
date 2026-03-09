import { NextRequest, NextResponse } from "next/server";
import { startGame } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";
import type { GameMode, CharacterSource } from "@/types/room";

export async function POST(req: NextRequest) {
  const { code, characterIds, mode, characterSource, templateKeys, searchAnimeId, pokemonGeneration } = (await req.json()) as {
    code: string;
    characterIds: number[];
    mode: GameMode;
    characterSource: CharacterSource;
    templateKeys: string[];
    searchAnimeId: number | null;
    pokemonGeneration: string | null;
  };

  const room = startGame(code, characterIds, mode, characterSource, templateKeys, searchAnimeId, pokemonGeneration);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.GAME_STARTED, {
    characterIds,
    mode,
    characterSource,
    templateKeys,
    searchAnimeId,
    pokemonGeneration,
  });

  return NextResponse.json(room);
}
