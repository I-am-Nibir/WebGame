"use client";

import { useEffect } from "react";
import { useLang } from "@/lib/i18n";

/** Applies the saved language after hydration. */
export default function LangInit() {
  useEffect(() => {
    void useLang.persist.rehydrate();
  }, []);
  return null;
}
