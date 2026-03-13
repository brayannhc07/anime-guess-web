import PusherClient from "pusher-js";

let pusherInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherInstance) {
    // Retrieve player identity for presence channel auth
    let userData = { id: "", name: "Anonymous" };
    try {
      const stored = sessionStorage.getItem("animeguess-player");
      if (stored) {
        const parsed = JSON.parse(stored);
        userData = { id: parsed.id, name: parsed.name };
      }
    } catch {}

    pusherInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
        auth: {
          params: {
            user_id: userData.id,
            user_name: userData.name,
          },
        },
        activityTimeout: 30000,
        pongTimeout: 15000,
      }
    );
  }
  return pusherInstance;
}
