"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getTemplateList } from "@/hooks/use-character-list";

interface TemplatePickerProps {
  value: string[];
  onChange: (keys: string[]) => void;
  disabled?: boolean;
}

export function TemplatePicker({ value, onChange, disabled }: TemplatePickerProps) {
  const templates = getTemplateList();

  function toggle(key: string) {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Character Packs (select one or more)</Label>
      <div className="grid grid-cols-1 gap-1.5">
        {templates.map((t) => {
          const selected = value.includes(t.key);
          return (
            <Button
              key={t.key}
              type="button"
              variant={selected ? "default" : "outline"}
              size="sm"
              className="justify-start h-auto py-1.5 px-3 text-sm"
              disabled={disabled}
              onClick={() => toggle(t.key)}
            >
              {t.name} ({t.count})
            </Button>
          );
        })}
      </div>
    </div>
  );
}
