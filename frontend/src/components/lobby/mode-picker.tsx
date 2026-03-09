"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { GameMode } from "@/types/room";

interface ModePickerProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Game Mode</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as GameMode)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="classic" id="mode-classic" />
          <Label htmlFor="mode-classic" className="cursor-pointer">
            <span className="font-medium">Classic</span>
            <span className="text-muted-foreground text-sm ml-2">
              Pick a character, opponent guesses which one
            </span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rule-master" id="mode-rule" />
          <Label htmlFor="mode-rule" className="cursor-pointer">
            <span className="font-medium">Rule Master</span>
            <span className="text-muted-foreground text-sm ml-2">
              Set a rule for your opponent, they ask about characters to figure it out
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
