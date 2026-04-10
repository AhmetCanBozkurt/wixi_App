import { useCallback } from "react";
import { useLanguage } from "../contexts/language-context";

type TranslationParams = Record<string, string | number>;

/**
 * Helper hook that wraps the base `useLanguage` context and provides
 * a translate method with fallback + simple template interpolation.
 */
export function useI18n() {
  const { language, setLanguage, t } = useLanguage();

  const translate = useCallback(
    (key: string, fallback?: string, params?: TranslationParams) => {
      let value = t(key);
      if (value === key && typeof fallback === "string") {
        value = fallback;
      }
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue));
        });
      }
      return value;
    },
    [t]
  );

  return { language, setLanguage, t, translate };
}

