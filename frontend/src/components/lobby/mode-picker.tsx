"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { GameMode } from "@/types/room";
import { useLanguage } from "@/contexts/language-context";

interface ModePickerProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{t("mode.gameMode")}</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as GameMode)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="classic" id="mode-classic" />
          <Label htmlFor="mode-classic" className="cursor-pointer">
            <span className="font-medium">{t("mode.classic")}</span>
            <span className="text-muted-foreground text-sm ml-2">
              {t("mode.classicDesc")}
            </span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rule-master" id="mode-rule" />
          <Label htmlFor="mode-rule" className="cursor-pointer">
            <span className="font-medium">{t("mode.ruleMaster")}</span>
            <span className="text-muted-foreground text-sm ml-2">
              {t("mode.ruleMasterDesc")}
            </span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
