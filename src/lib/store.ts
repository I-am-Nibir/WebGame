import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  coins: number;
  activeGame: string | null;
  soundEnabled: boolean;
  avatar: string;
  addCoins: (amount: number) => void;
  setActiveGame: (gameId: string | null) => void;
  toggleSound: () => void;
  setAvatar: (avatar: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      coins: 150,
      activeGame: null,
      soundEnabled: true,
      avatar: "🐰",
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      setActiveGame: (gameId) => set({ activeGame: gameId }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setAvatar: (avatar) => set({ avatar }),
    }),
    { name: "maisha-arcade-storage" }
  )
);
