import { getLang } from "./i18n";

const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Format a number for the current language (Bangla digits in Bangla, normal digits in English). */
export const toBn = (n: number | string) =>
  getLang() === "en" ? String(n) : String(n).replace(/\d/g, (d) => BN[Number(d)]);
