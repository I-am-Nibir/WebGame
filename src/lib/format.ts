const BN = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert western digits to Bangla digits. */
export const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN[Number(d)]);
