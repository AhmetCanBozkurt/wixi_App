"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import TranslationService from "../ApiServices/services/TranslationService"
import { PreferenceService } from "../ApiServices/services/PreferenceService"
import { TokenService } from "../ApiServices/services/TokenService"

type Language = "de" | "tr" | "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)


export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de")
  const [booted, setBooted] = useState(false)

  // Bootstrap language: prefer server for authenticated users, else localStorage
  useEffect(() => {
    (async () => {
      try {
        const isAuthenticatedRoute = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/admin') || 
          window.location.pathname.startsWith('/client')
        )
        const token = await TokenService.getInstance().getToken()
        const hasToken = !!token
        if (isAuthenticatedRoute && hasToken) {
          try {
            const pref = await PreferenceService.getMe()
            if (pref?.language && (pref.language === "de" || pref.language === "tr" || pref.language === "en" || pref.language === "ar")) {
              setLanguageState(pref.language)
              setBooted(true)
              return
            }
          } catch {}
        }
        const savedLanguage = localStorage.getItem("language") as Language
        if (savedLanguage && (savedLanguage === "de" || savedLanguage === "tr" || savedLanguage === "en" || savedLanguage === "ar")) {
          setLanguageState(savedLanguage)
        }
      } finally {
        setBooted(true)
      }
    })()
  }, [])

  // Save when language changes - with debounce to prevent multiple requests
  useEffect(() => {
    if (!booted) return
    localStorage.setItem("language", language)
    
    // Debounce server update to prevent multiple rapid requests
    const timeoutId = setTimeout(async () => {
      try {
        const isAuthenticatedRoute = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/admin') || 
          window.location.pathname.startsWith('/client')
        )
        const token = await TokenService.getInstance().getToken()
        const hasToken = !!token
        if (isAuthenticatedRoute && hasToken) {
          await PreferenceService.updateMe({ language }).catch(() => {})
        }
      } catch {}
    }, 500) // Wait 500ms before updating to server
    
    // Cleanup timeout on unmount or when language/booted changes
    return () => {
      clearTimeout(timeoutId)
    }
  }, [language, booted])

  const [remoteOverrides, setRemoteOverrides] = useState<Record<string, string>>({})

  // Load remote overrides for selected language
  useEffect(() => {
    (async () => {
      try {
        const data = await TranslationService.getPublic(language)
        setRemoteOverrides(data || {})
      } catch {
        setRemoteOverrides({})
      }
    })()
  }, [language])

  const t = (key: string): string => {
    const val = remoteOverrides?.[key]
    return (typeof val === 'string' && val.length > 0) ? val : key
  }

  const setLanguage = (lang: Language) => setLanguageState(lang)

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
