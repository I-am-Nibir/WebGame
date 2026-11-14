"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AVATARS } from "@/lib/avatars";
import { useGameStore } from "@/lib/store";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

export default function AvatarPicker({ onClose }: { onClose: () => void }) {
  const { coins, avatar, unlockedAvatars, buyAvatar } = useGameStore();
  const [note, setNote] = useState("বন্ধু বেছে নাও! কয়েন দিয়ে নতুন বন্ধু আনলক করো।");

  const choose = (emoji: string, cost: number) => {
    const r = buyAvatar(emoji);
    if (r === "poor") {
      sounds.wrong();
      setNote(`আরও ${toBn(cost - coins)} কয়েন লাগবে। গেম খেলে কয়েন জমাও! 🎮`);
    } else if (r === "bought") {
      sounds.win();
      setNote("নতুন বন্ধু আনলক হয়েছে! 🎉");
    } else {
      sounds.pop();
      setNote("চমৎকার পছন্দ! 💖");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-label="আমার বন্ধু"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-[2rem] p-6 border-4 border-purple-200 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-purple-950">🧸 আমার বন্ধু</h2>
          <button onClick={onClose} aria-label="বন্ধ করো" className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-black text-xl hover:bg-red-200">
            ✕
          </button>
        </div>
        <p className="text-slate-600 font-semibold mb-1">{note}</p>
        <p className="text-amber-700 font-black mb-4">⭐ {toBn(coins)} কয়েন</p>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map(({ emoji, cost }) => {
            const owned = unlockedAvatars.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => choose(emoji, cost)}
                aria-label={owned ? emoji : `${emoji}, ${cost} কয়েন`}
                className={`relative aspect-square rounded-2xl text-4xl flex items-center justify-center border-4 transition active:scale-95 ${
                  avatar === emoji ? "border-purple-500 bg-purple-50" : "border-purple-100 bg-white"
                }`}
              >
                <span className={owned ? "" : "opacity-40 grayscale"}>{emoji}</span>
                {!owned && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-black bg-amber-300 text-amber-900 rounded-full px-2 py-0.5 whitespace-nowrap">
                    🔒 {toBn(cost)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
