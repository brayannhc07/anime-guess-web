"use client";

import { useGameStore } from "@/stores/game-store";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import type { TranslationKey } from "@/lib/i18n";

export function RuleMasterBoard() {
  const { playerId, askedCharacters, players } = useGameStore();
  const { t } = useLanguage();
  const me = players.find((p) => p.id === playerId);
  const isSpectator = me?.isSpectator ?? false;
  const gamePlayers = players.filter((p) => !p.isSpectator);

  if (isSpectator) {
    return (
      <div className="space-y-6">
        {gamePlayers.map((p) => (
          <BoardSection
            key={p.id}
            title={`${p.name}'s Board`}
            characters={askedCharacters.filter((c) => c.askerId === p.id)}
            t={t}
          />
        ))}
      </div>
    );
  }

  const myCharacters = askedCharacters.filter((c) => c.askerId === playerId);
  const opponentCharacters = askedCharacters.filter((c) => c.askerId !== playerId);
  const opponent = gamePlayers.find((p) => p.id !== playerId);

  return (
    <div className="space-y-6">
      <BoardSection
        title={t("rmBoard.yourBoard")}
        characters={myCharacters}
        t={t}
      />
      <BoardSection
        title={`${opponent?.name ?? "Opponent"}'s Board`}
        characters={opponentCharacters}
        t={t}
      />
    </div>
  );
}

function BoardSection({
  title,
  characters,
  t,
}: {
  title: string;
  characters: { id: number; name: string; image: string; valid: boolean | null }[];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) {
  const validCount = characters.filter((c) => c.valid === true).length;
  const invalidCount = characters.filter((c) => c.valid === false).length;

  if (characters.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{t("rmBoard.noCharacters")}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">
        {title} ({validCount} {t("rmBoard.valid")}, {invalidCount} {t("rmBoard.invalid")})
      </h3>

      {/* Compact ask history */}
      <details className="mb-3 text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          {t("rmBoard.quickHistory", { count: characters.length })}
        </summary>
        <ul className="mt-1.5 space-y-0.5 pl-4">
          {characters.map((c) => (
            <li key={`history-${c.id}`} className="flex items-center gap-1.5">
              <span className={cn(
                "inline-block w-4 text-center font-bold",
                c.valid === true && "text-green-600",
                c.valid === false && "text-red-500",
                c.valid === null && "text-yellow-500"
              )}>
                {c.valid === true ? "\u2713" : c.valid === false ? "\u2717" : "?"}
              </span>
              <span className="text-muted-foreground">{c.name}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {characters.map((c) => (
          <div
            key={`${c.id}-${c.valid}`}
            className={cn(
              "relative rounded-lg border-2 p-2 flex flex-col items-center gap-1",
              c.valid === true && "border-green-400 bg-green-50 dark:bg-green-950/60",
              c.valid === false && "border-red-300 bg-red-50 dark:bg-red-950/60 opacity-50 grayscale",
              c.valid === null && "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/60 animate-pulse"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image}
              alt={c.name}
              className="aspect-[3/4] w-full object-cover rounded"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
            <span className="text-xs truncate w-full text-center text-muted-foreground">
              {c.name}
            </span>
            {c.valid === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-red-500/60">X</span>
              </div>
            )}
            {c.valid === true && (
              <div className="absolute top-1 right-1">
                <span className="text-green-600 text-sm font-bold">&#10003;</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
