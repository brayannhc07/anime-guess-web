"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useGameCharacters } from "@/hooks/use-character-list";

export function GuessDialog() {
  const { mode, roomCode, eliminated, pendingRuleGuess } = useGameStore();
  const { makeGuess, submitRuleGuess } = useGameActions();
  const { data: characterList } = useGameCharacters();
  const [open, setOpen] = useState(false);
  const [ruleGuess, setRuleGuess] = useState("");
  const [loading, setLoading] = useState(false);

  const nonEliminated = characterList?.filter((c) => !eliminated.has(c.id)) ?? [];
  const isWaitingForJudgment = pendingRuleGuess !== null;

  async function handleClassicGuess(guess: number) {
    setLoading(true);
    try {
      await makeGuess(roomCode, guess);
      setOpen(false);
    } catch {
      alert("Failed to make guess");
    } finally {
      setLoading(false);
    }
  }

  async function handleRuleGuess() {
    if (!ruleGuess.trim()) return;
    setLoading(true);
    try {
      await submitRuleGuess(roomCode, ruleGuess.trim());
      setOpen(false);
      setRuleGuess("");
    } catch {
      alert("Failed to submit guess");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="destructive" size="lg" disabled={isWaitingForJudgment} />}
      >
        {mode === "classic" ? "Make Final Guess" : isWaitingForJudgment ? "Waiting for judgment..." : "Guess the Rule"}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "classic"
              ? "Which character did they pick?"
              : "What rule did your opponent set for you?"}
          </DialogTitle>
        </DialogHeader>

        {mode === "classic" ? (
          <div className="grid grid-cols-3 gap-2">
            {nonEliminated.map((character) => (
              <Button
                key={character.id}
                variant="outline"
                className="flex flex-col items-center h-auto py-2"
                disabled={loading}
                onClick={() => handleClassicGuess(character.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={character.image}
                  alt={character.name}
                  className="aspect-[3/4] w-12 object-cover rounded"
                />
                <span className="text-xs">{character.name}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Based on the characters your opponent approved/rejected, guess what rule they set for you.
              Your opponent will judge if your guess is correct.
            </p>
            <Input
              placeholder='e.g. "Has blue hair", "Female character"...'
              value={ruleGuess}
              onChange={(e) => setRuleGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRuleGuess()}
            />
            <Button
              onClick={handleRuleGuess}
              disabled={!ruleGuess.trim() || loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Guess"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
