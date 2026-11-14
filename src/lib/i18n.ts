import { useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "bn" | "en";

/** Module-level copy so non-React code (canvas text, toBn) can read the language. */
let currentLang: Lang = "bn";
export const getLang = () => currentLang;

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

/**
 * skipHydration: the server always renders Bangla, so the saved choice is applied once after the first
 * client render (see <LangInit/>) — this avoids a hydration mismatch.
 */
export const useLang = create<LangState>()(
  persist(
    (set) => ({
      lang: "bn",
      setLang: (lang) => {
        currentLang = lang;
        if (typeof document !== "undefined") document.documentElement.lang = lang;
        set({ lang });
      },
    }),
    {
      name: "maisha-lang",
      skipHydration: true,
      onRehydrateStorage: () => (s) => {
        if (s) {
          currentLang = s.lang;
          if (typeof document !== "undefined") document.documentElement.lang = s.lang;
        }
      },
    }
  )
);

/** t("বাংলা", "English") — picks the string for the current language and re-renders on change. */
export function useT() {
  const lang = useLang((s) => s.lang);
  return useCallback((bn: string, en: string) => (lang === "en" ? en : bn), [lang]);
}

/** Non-hook helper (use only where a re-render is guaranteed some other way). */
export const tt = (bn: string, en: string) => (currentLang === "en" ? en : bn);
