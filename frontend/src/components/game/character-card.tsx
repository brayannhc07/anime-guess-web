"use client";

import { useState, useRef, useCallback } from "react";
import type { AnimeCharacter } from "@/types/character";
import { cn } from "@/lib/utils";
import { isPokemonSprite } from "@/lib/pokemon";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

interface CharacterCardProps {
  character: AnimeCharacter;
  eliminated: boolean;
  selected?: boolean;
  selectable?: boolean;
  onClick: () => void;
}

export function CharacterCard({ character, eliminated, selected, selectable, onClick }: CharacterCardProps) {
  const isPokemon = isPokemonSprite(character.image);
  const [preview, setPreview] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const startLongPress = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setPreview(true);
    }, 400);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    onClick();
  }, [onClick]);

  return (
    <>
      <button
        onClick={handleClick}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        onContextMenu={(e) => { e.preventDefault(); setPreview(true); }}
        aria-label={`${character.name}${eliminated ? " (eliminated)" : ""}${selected ? " (selected)" : ""}`}
        aria-pressed={selected}
        className={cn(
          "relative rounded-lg border-2 p-2 transition-all flex flex-col items-center gap-1 w-full",
          "hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          eliminated && "opacity-40 grayscale",
          selected && "border-yellow-400 ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-950/60",
          selectable && !selected && "border-blue-300 cursor-pointer",
          !selectable && !eliminated && "border-border"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.image}
          alt={character.name}
          className={cn(
            "w-full rounded",
            isPokemon
              ? "aspect-square object-contain [image-rendering:pixelated]"
              : "aspect-[3/4] object-cover"
          )}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
        />
        <span className={cn("text-xs font-medium truncate w-full text-center", isPokemon && "capitalize")}>
          {character.name}
        </span>
        {eliminated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-red-500/70">X</span>
          </div>
        )}
      </button>

      {/* Preview overlay */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreview(false)}
          onTouchEnd={() => setPreview(false)}
        >
          <div className="bg-background rounded-xl p-4 shadow-2xl max-w-xs w-full mx-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={character.image}
              alt={character.name}
              className={cn(
                "w-full rounded-lg",
                isPokemon
                  ? "aspect-square object-contain [image-rendering:pixelated]"
                  : "aspect-[3/4] object-cover"
              )}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="text-center">
              <p className={cn("text-lg font-semibold", isPokemon && "capitalize")}>{character.name}</p>
              {character.anime && <p className="text-sm text-muted-foreground">{character.anime}</p>}
            </div>
            <button
              onClick={() => setPreview(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
