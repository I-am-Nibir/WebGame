"use client";

import React from "react";
import { useLang, type Lang } from "@/lib/i18n";
import { sounds } from "@/lib/audioEngine";

/** Little pill: বাংলা | EN */
export default function LangToggle({ className = "" }: { className?: string }) {
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);
  const opt = (l: Lang, label: string) => (
    <button
      onClick={() => {
        sounds.pop();
        setLang(l);
      }}
      aria-pressed={lang === l}
      className={`px-2 sm:px-3 h-8 sm:h-9 rounded-full font-black text-xs sm:text-sm transition ${
        lang === l ? "bg-violet-600 text-white shadow-[0_3px_0_#4c1d95]" : "text-purple-800 hover:bg-purple-200"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className={`flex items-center gap-1 bg-purple-100 border-2 border-purple-300 rounded-full p-0.5 sm:p-1 shrink-0 ${className}`} role="group" aria-label="Language / ভাষা">
      {opt("bn", "বাংলা")}
      {opt("en", "EN")}
    </div>
  );
}
