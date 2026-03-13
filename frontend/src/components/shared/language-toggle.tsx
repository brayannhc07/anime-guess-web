"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      className="text-xs font-medium px-2"
    >
      {locale === "en" ? "ES" : "EN"}
    </Button>
  );
}
