"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GENERATION_LABELS, getGenerationSize } from "@/lib/pokemon";

interface GenerationPickerProps {
  value: string[];
  onChange: (gens: string[]) => void;
  disabled?: boolean;
}

export function GenerationPicker({ value, onChange, disabled }: GenerationPickerProps) {
  const allKeys = Object.keys(GENERATION_LABELS);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => value.includes(k));

  function toggle(key: string) {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  }

  function toggleAll() {
    onChange(allSelected ? [] : allKeys);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Generations (select one or more)</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-auto py-1 px-2"
          disabled={disabled}
          onClick={toggleAll}
        >
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {Object.entries(GENERATION_LABELS).map(([key, label]) => {
          const selected = value.includes(key);
          return (
            <Button
              key={key}
              type="button"
              variant={selected ? "default" : "outline"}
              size="sm"
              className="justify-start h-auto py-1.5 px-3 text-sm"
              disabled={disabled}
              onClick={() => toggle(key)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
