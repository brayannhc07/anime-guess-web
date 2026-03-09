"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GENERATION_LABELS } from "@/lib/pokemon";

interface GenerationPickerProps {
  value: string;
  onChange: (gen: string) => void;
  disabled?: boolean;
}

export function GenerationPicker({ value, onChange, disabled }: GenerationPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Generation</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="grid grid-cols-2 gap-2">
        {Object.entries(GENERATION_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center space-x-2">
            <RadioGroupItem value={key} id={`gen-${key}`} />
            <Label htmlFor={`gen-${key}`} className="text-sm cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
