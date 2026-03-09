"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ANIME_LABELS } from "@/lib/constants";
import type { AnimePreset } from "@/types/room";

interface AnimePickerProps {
  value: AnimePreset;
  onChange: (anime: AnimePreset) => void;
  disabled?: boolean;
}

export function AnimePicker({ value, onChange, disabled }: AnimePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Anime</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as AnimePreset)}
        disabled={disabled}
        className="grid grid-cols-2 gap-2"
      >
        {Object.entries(ANIME_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center space-x-2">
            <RadioGroupItem value={key} id={`anime-${key}`} />
            <Label htmlFor={`anime-${key}`} className="text-sm cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
