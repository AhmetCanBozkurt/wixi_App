"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={language === "de" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("de")}
        className="h-8 px-2 text-xs"
      >
        DE
      </Button>
      <Button
        variant={language === "tr" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("tr")}
        className="h-8 px-2 text-xs"
      >
        TR
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
      <Button
        variant={language === "ar" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ar")}
        className="h-8 px-2 text-xs"
      >
        AR
      </Button>
    </div>
  )
}
