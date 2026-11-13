import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AVATARS } from "./avatars";

const MASCOT_COOLDOWN_MS = 45_000;

interface GameState {
  coins: number;
  avatar: string;
  unlockedAvatars: string[];
  soundEnabled: boolean;
  highScores: Record<string, number>;
  bestStars: Record<string, number>;
  lastMascotBonus: number;
  addCoins: (amount: number) => void;
  /** Select an owned avatar, or buy it if affordable. */
  buyAvatar: (emoji: string) => "owned" | "bought" | "poor";
  setAvatar: (avatar: string) => void;
  toggleSound: () => void;
  recordResult: (gameId: string, score: number, stars: number) => void;
  /** Returns true if the bonus was granted (rate limited so it can't be farmed). */
  claimMascotBonus: () => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 20,
      avatar: "🐰",
      unlockedAvatars: ["🐰", "🐱"],
      soundEnabled: true,
      highScores: {},
      bestStars: {},
      lastMascotBonus: 0,
      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),
      buyAvatar: (emoji) => {
        const s = get();
        if (s.unlockedAvatars.includes(emoji)) {
          set({ avatar: emoji });
          return "owned";
        }
        const cost = AVATARS.find((a) => a.emoji === emoji)?.cost ?? Infinity;
        if (s.coins < cost) return "poor";
        set({
          coins: s.coins - cost,
          unlockedAvatars: [...s.unlockedAvatars, emoji],
          avatar: emoji,
        });
        return "bought";
      },
      setAvatar: (avatar) => set({ avatar }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      recordResult: (gameId, score, stars) =>
        set((s) => ({
          highScores: { ...s.highScores, [gameId]: Math.max(s.highScores[gameId] ?? 0, score) },
          bestStars: { ...s.bestStars, [gameId]: Math.max(s.bestStars[gameId] ?? 0, stars) },
        })),
      claimMascotBonus: () => {
        const now = Date.now();
        if (now - get().lastMascotBonus < MASCOT_COOLDOWN_MS) return false;
        set((s) => ({ coins: s.coins + 5, lastMascotBonus: now }));
        return true;
      },
    }),
    { name: "maisha-arcade-storage" }
  )
);
