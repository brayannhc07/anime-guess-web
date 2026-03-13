"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/stores/game-store";
import { useGameActions } from "@/hooks/use-game-actions";
import { useGameCharacters } from "@/hooks/use-character-list";
import { isPokemonSprite } from "@/lib/pokemon";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

export function GuessDialog() {
  const { mode, roomCode, eliminated, pendingRuleGuess } = useGameStore();
  const { makeGuess, submitRuleGuess } = useGameActions();
  const { data: characterList } = useGameCharacters();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [ruleGuess, setRuleGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmCharacter, setConfirmCharacter] = useState<{ id: number; name: string; image: string } | null>(null);

  const nonEliminated = characterList?.filter((c) => !eliminated.has(c.id)) ?? [];
  const isWaitingForJudgment = pendingRuleGuess !== null;

  async function handleClassicGuess() {
    if (!confirmCharacter) return;
    setLoading(true);
    try {
      await makeGuess(roomCode, confirmCharacter.id);
      setOpen(false);
      setConfirmCharacter(null);
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
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmCharacter(null); }}>
      <DialogTrigger
        render={<Button variant="destructive" size="lg" disabled={isWaitingForJudgment} />}
      >
        {mode === "classic" ? t("guess.makeGuess") : isWaitingForJudgment ? t("guess.waitingJudgment") : t("guess.guessRule")}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "classic"
              ? confirmCharacter
                ? t("guess.confirmTitle")
                : t("guess.whichCharacter")
              : t("guess.whatRule")}
          </DialogTitle>
        </DialogHeader>

        {mode === "classic" ? (
          confirmCharacter ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={confirmCharacter.image}
                  alt={confirmCharacter.name}
                  className={cn(
                    "w-24 rounded",
                    isPokemonSprite(confirmCharacter.image)
                      ? "aspect-square object-contain [image-rendering:pixelated]"
                      : "aspect-[3/4] object-cover"
                  )}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                />
                <p className="text-lg font-medium">{confirmCharacter.name}</p>
                <p className="text-sm text-muted-foreground">{t("guess.areYouSure")}</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmCharacter(null)} disabled={loading}>
                  {t("guess.goBack")}
                </Button>
                <Button variant="destructive" onClick={handleClassicGuess} disabled={loading}>
                  {loading ? t("guess.guessing") : t("guess.confirmGuess")}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {nonEliminated.map((character) => (
                <button
                  key={character.id}
                  className="flex flex-col items-center h-auto py-2 px-1 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  disabled={loading}
                  onClick={() => setConfirmCharacter({ id: character.id, name: character.name, image: character.image })}
                  aria-label={`Guess ${character.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={character.image}
                    alt={character.name}
                    className={cn(
                      "w-12 rounded",
                      isPokemonSprite(character.image)
                        ? "aspect-square object-contain [image-rendering:pixelated]"
                        : "aspect-[3/4] object-cover"
                    )}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                  />
                  <span className="text-xs truncate w-full text-center">{character.name}</span>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("guess.ruleHint")}
            </p>
            <Input
              placeholder={t("guess.rulePlaceholder")}
              value={ruleGuess}
              onChange={(e) => setRuleGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRuleGuess()}
            />
            <Button
              onClick={handleRuleGuess}
              disabled={!ruleGuess.trim() || loading}
              className="w-full"
            >
              {loading ? t("guess.submitting") : t("guess.submitGuess")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
