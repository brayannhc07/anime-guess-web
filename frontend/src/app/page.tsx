import { CreateRoomForm } from "@/components/landing/create-room-form";
import { JoinRoomForm } from "@/components/landing/join-room-form";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Adivinamon</h1>
        <p className="text-muted-foreground">
          An anime character &quot;Guess Who&quot; game. Create or join a room to play!
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
        <CreateRoomForm />
        <JoinRoomForm />
      </div>
    </main>
  );
}
