import { NextRequest, NextResponse } from "next/server";
import { submitRuleGuess } from "@/lib/room-store";
import { getPusherServer } from "@/lib/pusher-server";
import { PUSHER_EVENTS } from "@/types/pusher-events";

export async function POST(req: NextRequest) {
  const { code, playerId, guess } = await req.json();

  const result = submitRuleGuess(code, playerId, guess);
  if (!result) {
    return NextResponse.json({ error: "Cannot submit guess right now" }, { status: 400 });
  }

  const pusher = getPusherServer();
  await pusher.trigger(`presence-room-${code}`, PUSHER_EVENTS.RULE_GUESS_SUBMITTED, {
    guesserId: playerId,
    guesserName: result.guesserName,
    guess,
  });

  return NextResponse.json({ ok: true });
}
