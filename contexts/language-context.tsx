"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, type Language } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.zh
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log("[v0] LanguageProvider mounted")
    setMounted(true)

    // Load language preference from localStorage after mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language
      console.log("[v0] Loaded language from localStorage:", saved)
      if (saved && (saved === "zh" || saved === "en")) {
        setLanguageState(saved)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    console.log("[v0] Setting language to:", lang)
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  }

  console.log("[v0] LanguageProvider rendering with language:", language, "mounted:", mounted)

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
