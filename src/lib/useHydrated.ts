import { useEffect, useState } from "react";

/** True only after the first client render. Avoids SSR/localStorage hydration mismatches. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
