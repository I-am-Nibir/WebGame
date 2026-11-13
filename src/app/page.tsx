"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import GameShell from "@/components/ui/GameShell";
import { GAME_COMPONENTS } from "@/components/games";
import { GAMES, getGame } from "@/lib/games";
import { AVATARS } from "@/lib/avatars";
import { useGameStore } from "@/lib/store";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";

const MascotCanvas = dynamic(() => import("@/components/3d/MascotCanvas"), {
  ssr: false,
  loading: () => <div className="h-72 md:h-96 grid place-items-center text-7xl animate-bounce">🧸</div>,
});

function Stars({ count }: { count: number }) {
  return (
    <span aria-label={`${count} তারা`} className="text-lg tracking-wider">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "" : "grayscale opacity-30"}>
          ⭐
        </span>
      ))}
    </span>
  );
}

function AvatarPicker({ onClose }: { onClose: () => void }) {
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

export default function ArcadeHome() {
  const hydrated = useHydrated();
  const { coins, avatar, soundEnabled, toggleSound, highScores, bestStars } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);

  const selected = selectedId ? getGame(selectedId) : null;
  const Game = selectedId ? GAME_COMPONENTS[selectedId] : null;

  return (
    <main className="min-h-screen bg-[#f7f5ff] text-slate-800 pb-16">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-4 border-purple-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl sm:text-4xl animate-bob">🧸</span>
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400">
            Maisha
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              sounds.pop();
              setShowAvatars(true);
            }}
            aria-label="আমার বন্ধু বদলাও"
            className="w-12 h-12 rounded-full bg-purple-50 border-2 border-purple-200 text-2xl flex items-center justify-center hover:bg-purple-100 active:scale-95 transition"
          >
            {hydrated ? avatar : "🐰"}
          </button>
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "সাউন্ড বন্ধ করো" : "সাউন্ড চালু করো"}
            className="w-12 h-12 rounded-full bg-purple-50 border-2 border-purple-200 text-purple-700 flex items-center justify-center hover:bg-purple-100 active:scale-95 transition"
          >
            {hydrated && !soundEnabled ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <div className="flex items-center gap-2 bg-amber-100 border-2 border-amber-300 px-3 sm:px-4 h-12 rounded-2xl shadow-sm" aria-label="কয়েন">
            <span className="text-2xl">⭐</span>
            <span className="font-black text-amber-800 text-lg">{toBn(hydrated ? coins : 0)}</span>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto mt-6 px-4">
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between">
          <div className="z-10 max-w-lg space-y-4 text-center md:text-left">
            <span className="inline-block px-4 py-1.5 bg-yellow-300 text-purple-950 font-black rounded-full text-sm">
              ✨ বাচ্চাদের নিরাপদ গেমিং জোন
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">মাইশার সাথে খেলো, শেখো এবং আনন্দ করো!</h1>
            <p className="text-purple-100 font-medium text-lg">
              ৩ডি বন্ধুকে ছুঁয়ে দেখো। মাঝে মাঝে বোনাস স্টার কয়েন পাবে!
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <MascotCanvas paused={!!selectedId || showAvatars} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-10 px-4">
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-purple-950 flex items-center gap-3">
            <span>🎮</span> জনপ্রিয় গেমস
          </h2>
          <span className="text-purple-700 font-bold bg-purple-100 px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
            {toBn(GAMES.length)}টি মজার খেলা
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {GAMES.map((game) => {
            const stars = hydrated ? bestStars[game.id] ?? 0 : 0;
            const best = hydrated ? highScores[game.id] ?? 0 : 0;
            return (
              <motion.button
                key={game.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="clay-card relative p-6 flex flex-col items-center text-center group"
                onClick={() => {
                  sounds.pop();
                  setSelectedId(game.id);
                }}
              >
                <span
                  className={`absolute top-3 right-3 text-xs font-black px-2.5 py-1 rounded-full ${
                    game.is3d ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {game.is3d ? "৩ডি" : "২ডি"}
                </span>
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-4xl shadow-md mb-4 group-hover:rotate-6 transition`}
                >
                  {game.icon}
                </div>
                <h3 className="font-black text-xl text-slate-800 mb-1">{game.name}</h3>
                <p className="text-slate-500 text-sm font-medium mb-3">{game.desc}</p>
                <div className="h-7 mb-3 text-sm font-bold text-amber-700">
                  {game.freePlay ? (
                    <span className="text-emerald-600">🎶 ফ্রি খেলা</span>
                  ) : best > 0 ? (
                    <span className="flex items-center gap-2">
                      <Stars count={stars} /> {toBn(best)}
                    </span>
                  ) : (
                    <span className="text-slate-400">এখনো খেলোনি</span>
                  )}
                </div>
                <span className="w-full py-2.5 rounded-xl font-black text-white clay-btn-purple text-base">খেলো এখনই 🚀</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <AnimatePresence>{showAvatars && <AvatarPicker onClose={() => setShowAvatars(false)} />}</AnimatePresence>

      {selected && Game && (
        <GameShell key={selected.id} meta={selected} onClose={() => setSelectedId(null)}>
          <Game />
        </GameShell>
      )}
    </main>
  );
}
