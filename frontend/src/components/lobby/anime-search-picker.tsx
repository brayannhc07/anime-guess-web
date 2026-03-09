"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAnimeSearch, useAnimeCharacters } from "@/hooks/use-character-list";

interface AnimeSearchPickerProps {
  selectedAnimeId: number | null;
  selectedAnimeName: string;
  onChange: (id: number, name: string, characterCount: number) => void;
  disabled?: boolean;
}

export function AnimeSearchPicker({ selectedAnimeId, selectedAnimeName, onChange, disabled }: AnimeSearchPickerProps) {
  const [query, setQuery] = useState("");
  const { data: searchResults, isLoading: searching } = useAnimeSearch(query);
  const { data: characters } = useAnimeCharacters(selectedAnimeId);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Search Anime</Label>
      <Input
        placeholder="Type an anime name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />

      {searching && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-1">
          {searchResults.map((anime) => {
            const title = anime.title_english || anime.title;
            const isSelected = selectedAnimeId === anime.mal_id;
            return (
              <Button
                key={anime.mal_id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="w-full justify-start gap-2 h-auto py-2"
                disabled={disabled}
                onClick={() => {
                  onChange(anime.mal_id, title, 0);
                  setQuery("");
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={anime.images.jpg.image_url}
                  alt={title}
                  className="w-8 h-12 object-cover rounded shrink-0"
                />
                <span className="text-sm truncate">{title}</span>
              </Button>
            );
          })}
        </div>
      )}

      {selectedAnimeId && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{selectedAnimeName}</span>
          {characters && ` (${characters.length} characters)`}
        </p>
      )}
    </div>
  );
}
