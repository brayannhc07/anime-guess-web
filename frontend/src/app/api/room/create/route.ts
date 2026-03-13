import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/room-store";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RATE_LIMIT = 5; // max rooms per hour
const RATE_WINDOW = 3600; // 1 hour in seconds

export async function POST(req: NextRequest) {
  const { playerName, playerId } = await req.json();
  if (!playerName || !playerId) {
    return NextResponse.json({ error: "Missing playerName or playerId" }, { status: 400 });
  }

  // Rate limit by player ID
  const rateLimitKey = `ratelimit:create:${playerId}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    await redis.expire(rateLimitKey, RATE_WINDOW);
  }
  if (count > RATE_LIMIT) {
    return NextResponse.json({ error: "Too many rooms created. Try again later." }, { status: 429 });
  }

  const room = await createRoom(playerName, playerId);
  return NextResponse.json(room);
}
