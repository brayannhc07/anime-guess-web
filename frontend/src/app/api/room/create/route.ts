import { NextRequest, NextResponse } from "next/server";
import { createRoom } from "@/lib/room-store";

export async function POST(req: NextRequest) {
  const { playerName, playerId } = await req.json();
  if (!playerName || !playerId) {
    return NextResponse.json({ error: "Missing playerName or playerId" }, { status: 400 });
  }
  const room = createRoom(playerName, playerId);
  return NextResponse.json(room);
}
