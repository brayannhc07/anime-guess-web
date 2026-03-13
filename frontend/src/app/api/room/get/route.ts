import { NextRequest, NextResponse } from "next/server";
import { fetchRoom } from "@/lib/room-store";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const playerId = req.nextUrl.searchParams.get("playerId");

  if (!code || !playerId) {
    return NextResponse.json({ error: "Missing code or playerId" }, { status: 400 });
  }

  const room = await fetchRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Only return room data if the player is in this room
  if (!room.players.some((p) => p.id === playerId)) {
    return NextResponse.json({ error: "Player not in room" }, { status: 403 });
  }

  return NextResponse.json(room);
}
