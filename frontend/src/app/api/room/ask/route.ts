import { NextRequest, NextResponse } from "next/server";
import { askCharacter } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, characterId, characterName, characterImage } = await req.json();

  const room = await askCharacter(code, playerId, characterId, characterName, characterImage);
  if (!room) {
    return NextResponse.json({ error: "Cannot ask right now" }, { status: 400 });
  }

  const asker = room.players.find((p) => p.id === playerId);
  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.CHARACTER_ASKED, {
    askerId: playerId,
    askerName: asker?.name ?? "Unknown",
    characterId,
    characterName,
    characterImage,
  });

  return NextResponse.json({ ok: true });
}
