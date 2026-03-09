import { NextRequest, NextResponse } from "next/server";
import { answerCharacter } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, valid } = await req.json();

  const result = answerCharacter(code, playerId, valid);
  if (!result) {
    return NextResponse.json({ error: "Cannot answer right now" }, { status: 400 });
  }

  const answerer = result.room.players.find((p) => p.id === playerId);
  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.CHARACTER_ANSWERED, {
    askerId: result.askedCharacter!.askerId,
    characterId: result.askedCharacter!.characterId,
    characterName: result.askedCharacter!.characterName,
    characterImage: result.askedCharacter!.characterImage,
    valid,
    answererName: answerer?.name ?? "Unknown",
    nextTurn: result.nextTurn,
  });

  return NextResponse.json({ ok: true });
}
