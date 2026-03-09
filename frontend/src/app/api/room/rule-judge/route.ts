import { NextRequest, NextResponse } from "next/server";
import { judgeRuleGuess } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, correct } = await req.json();

  const result = judgeRuleGuess(code, playerId, correct);
  if (!result) {
    return NextResponse.json({ error: "Cannot judge right now" }, { status: 400 });
  }

  const pusher = getPusherServer();
  const guesserId = correct
    ? (result.room.guessResult?.guesserId ?? "")
    : result.room.players.find((p) => p.name === result.guesserName)?.id ?? "";

  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.RULE_GUESS_JUDGED, {
    correct,
    guesserId,
    guesserName: result.guesserName,
    guess: result.guess,
    actualRule: result.actualRule,
    winnerId: result.room.winner,
    nextTurn: result.room.currentTurn,
  });

  return NextResponse.json(result.room);
}
