import { NextRequest, NextResponse } from "next/server";
import { getPusherServer } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channelName = params.get("channel_name");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const pusher = getPusherServer();

  if (channelName.startsWith("presence-")) {
    const userId = params.get("user_id") || socketId;
    const userName = params.get("user_name") || "Anonymous";
    const authResponse = pusher.authorizeChannel(socketId, channelName, {
      user_id: userId,
      user_info: { name: userName },
    });
    return NextResponse.json(authResponse);
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
