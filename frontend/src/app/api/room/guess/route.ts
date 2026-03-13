import { NextRequest, NextResponse } from "next/server";
import { makeGuess } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, guess } = await req.json();

  const result = await makeGuess(code, playerId, guess);
  if (!result) {
    return NextResponse.json({ error: "Room or player not found" }, { status: 404 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.GUESS_RESULT, {
    correct: result.correct,
    guesserId: playerId,
    guesserName: result.guesserName,
    guessedValue: guess,
    actualValue: result.actualValue,
    winnerId: result.room.winner,
  });

  return NextResponse.json(result.room);
}
