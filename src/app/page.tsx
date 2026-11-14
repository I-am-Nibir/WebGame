"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import GameShell from "@/components/ui/GameShell";
import HeroBanner from "@/components/ui/HeroBanner";
import MaishaMascot from "@/components/ui/MaishaMascot";
import MaishaFace from "@/components/ui/MaishaFace";
import { Ico, Rich } from "@/components/ui/Icons";
import { GAME_COMPONENTS } from "@/components/games";
import { GAMES, getGame, gameText } from "@/lib/games";
import { useLang, useT } from "@/lib/i18n";
import LangToggle from "@/components/ui/LangToggle";
import { AVATARS } from "@/lib/avatars";
import { useGameStore } from "@/lib/store";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";
import { useHydrated } from "@/lib/useHydrated";

const PANELS: Record<string, string> = {
  balloon: "from-sky-100 to-indigo-100",
  whack: "from-orange-100 to-amber-200",
  xylophone: "from-violet-100 to-fuchsia-100",
  catch: "from-pink-100 to-rose-200",
  maze: "from-teal-100 to-emerald-200",
  space: "from-indigo-200 to-purple-200",
  slice: "from-rose-100 to-pink-200",
  memory: "from-purple-100 to-violet-200",
  simon: "from-yellow-100 to-amber-200",
  math: "from-cyan-100 to-sky-200",
  tictactoe: "from-orange-100 to-yellow-200",
  doodle: "from-fuchsia-100 to-pink-200",
};

function Stars({ count }: { count: number }) {
  const t = useT();
  return (
    <span aria-label={t(`${count} তারা`, `${count} stars`)} className="text-lg tracking-wider">
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? "" : "grayscale opacity-30"}>
          <Ico n="⭐" size="1.15em" />
        </span>
      ))}
    </span>
  );
}

function AvatarPicker({ onClose }: { onClose: () => void }) {
  const { coins, avatar, unlockedAvatars, buyAvatar } = useGameStore();
  const t = useT();
  const [note, setNote] = useState(t("বন্ধু বেছে নাও! কয়েন দিয়ে নতুন বন্ধু আনলক করো।", "Pick a friend! Unlock new friends with coins."));

  const choose = (emoji: string, cost: number) => {
    const r = buyAvatar(emoji);
    if (r === "poor") {
      sounds.wrong();
      setNote(t(`আরও ${toBn(cost - coins)} কয়েন লাগবে। গেম খেলে কয়েন জমাও! 🎮`, `You need ${toBn(cost - coins)} more coins. Play games to earn coins! 🎮`));
    } else if (r === "bought") {
      sounds.win();
      setNote(t("নতুন বন্ধু আনলক হয়েছে! 🎉", "New friend unlocked! 🎉"));
    } else {
      sounds.pop();
      setNote(t("চমৎকার পছন্দ! 💖", "Great choice! 💖"));
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
        aria-label={t("আমার বন্ধু", "My friend")}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-[2rem] p-6 border-4 border-purple-200 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-purple-950 flex items-center gap-2"><Ico n="🧸" size="1.3em" /> {t("আমার বন্ধু", "My friend")}</h2>
          <button onClick={onClose} aria-label={t("বন্ধ করো", "Close")} className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-black text-xl hover:bg-red-200">
            <Ico n="close" size="1.2em" />
          </button>
        </div>
        <p className="text-slate-600 font-semibold mb-1"><Rich>{note}</Rich></p>
        <p className="text-amber-700 font-black mb-4 flex items-center gap-1"><Ico n="⭐" size="1.3em" /> {toBn(coins)} {t("কয়েন", "coins")}</p>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map(({ emoji, cost }) => {
            const owned = unlockedAvatars.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => choose(emoji, cost)}
                aria-label={owned ? t("বন্ধু", "Friend") : t(`বন্ধু, ${cost} কয়েন`, `Friend, ${cost} coins`)}
                className={`relative aspect-square rounded-2xl text-4xl flex items-center justify-center border-4 transition active:scale-95 ${
                  avatar === emoji ? "border-purple-500 bg-purple-50" : "border-purple-100 bg-white"
                }`}
              >
                <span className={owned ? "" : "opacity-40 grayscale"}>
                  <Ico n={emoji} size={46} />
                </span>
                {!owned && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-black bg-amber-300 text-amber-900 rounded-full px-2 py-0.5 whitespace-nowrap">
                    <Ico n="🔒" size="1.1em" /> {toBn(cost)}
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
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);

  const selected = selectedId ? getGame(selectedId) : null;
  const Game = selectedId ? GAME_COMPONENTS[selectedId] : null;

  const goToGames = () => {
    sounds.pop();
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen confetti-bg text-slate-800 pb-16">
      <nav className="sticky top-0 z-40 bg-[#fff8ee]/90 backdrop-blur-md px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-3 shadow-[0_4px_0_rgba(167,139,250,0.25)]">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <span className="flex items-center gap-2 select-none">
            <MaishaFace size={40} />
            <span className="hidden min-[430px]:inline text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 drop-shadow-[0_3px_0_#4c1d95]">
              Maisha
            </span>
          </span>
          <div className="hidden md:flex items-center gap-2 font-black text-lg text-purple-900">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-5 py-2 rounded-full bg-purple-100 hover:bg-purple-200 transition"
            >
              {t("হোম", "Home")}
            </button>
            <button onClick={goToGames} className="px-5 py-2 rounded-full hover:bg-purple-100 transition">
              {t("৩ডি গেমস", "3D Games")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <LangToggle />
          <button
            onClick={() => {
              sounds.pop();
              setShowAvatars(true);
            }}
            aria-label={t("আমার বন্ধু বদলাও", "Change my friend")}
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-purple-100 border-2 border-purple-300 text-2xl flex items-center justify-center hover:bg-purple-200 active:scale-95 transition"
          >
            <Ico n={hydrated ? avatar : "🐰"} size={34} />
          </button>
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? t("সাউন্ড বন্ধ করো", "Sound off") : t("সাউন্ড চালু করো", "Sound on")}
            className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-purple-100 border-2 border-purple-300 text-purple-700 flex items-center justify-center hover:bg-purple-200 active:scale-95 transition"
          >
            {hydrated && !soundEnabled ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          <div
            className="flex items-center gap-2 bg-gradient-to-b from-yellow-200 to-amber-400 border-2 border-amber-100 px-2.5 sm:px-5 h-10 sm:h-12 shrink-0 rounded-full shadow-[0_4px_0_#d97706,0_8px_16px_rgba(245,158,11,0.35)]"
            aria-label={t("কয়েন", "Coins")}
          >
            <Ico n="⭐" size={30} />
            <span className="font-black text-amber-950 text-xl">{toBn(hydrated ? coins : 0)}</span>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto mt-6 px-4">
        <HeroBanner>
          <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 pt-20 md:pt-6">
            <div className="max-w-lg space-y-4 text-center md:text-left md:pb-10">
              <p className="text-yellow-300 font-black text-xl md:text-2xl"><Rich>{t("খেলো, শেখো আর আনন্দ করো! ✨", "Play, learn and have fun! ✨")}</Rich></p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight text-white [text-shadow:0_4px_0_rgba(76,29,149,0.55)]">
                {t("মাইশার ৩ডি আর্কেডে", "Welcome to")}
                <br />
                <span className="text-yellow-300"><Rich>{t("স্বাগতম! 🎮", "Maisha's 3D Arcade! 🎮")}</Rich></span>
              </h1>
              <p className="text-purple-100 font-semibold text-lg">
                {t("৩ডি বন্ধুকে ছুঁয়ে দেখো, মজার গেম খেলো আর স্টার কয়েন জমাও!", "Tap your 3D friend, play fun games and collect star coins!")}
              </p>
              <button
                onClick={goToGames}
                className="mt-2 px-8 py-4 rounded-full font-black text-xl text-white clay-btn-orange"
              >
                <Rich>{t("খেলা শুরু করো! 🚀", "Start playing! 🚀")}</Rich>
              </button>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <MaishaMascot paused={!!selectedId || showAvatars} />
            </div>
          </div>
        </HeroBanner>
      </section>

      <section id="games" className="max-w-6xl mx-auto mt-12 px-4 scroll-mt-24">
        <div className="flex items-center justify-between mb-6 gap-2">
          <h2 className="text-2xl md:text-3xl font-black text-purple-950 flex items-center gap-3">
            <Ico n="🎮" size="1.3em" /> {t("জনপ্রিয় মিনি-গেমস", "Popular mini-games")}
          </h2>
          <span className="text-purple-700 font-bold bg-purple-100 px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
            {lang === "en" ? `${GAMES.length} fun games` : `${toBn(GAMES.length)}টি মজার খেলা`}
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
                className="group relative flex flex-col items-center text-center rounded-[2rem] border-[6px] border-violet-600 bg-[#fffaf1] p-4 shadow-[0_10px_0_#5b21b6,0_18px_28px_rgba(91,33,182,0.25)]"
                onClick={() => {
                  sounds.pop();
                  setSelectedId(game.id);
                }}
              >
                <h3 className="font-black text-xl text-purple-950 mb-3 leading-tight min-h-[3rem] flex items-center">
                  {gameText(game, lang).name}
                </h3>
                <div
                  className={`relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${PANELS[game.id] ?? "from-purple-100 to-pink-100"} flex items-center justify-center overflow-hidden`}
                >
                  <span
                    className={`absolute top-2 right-2 text-xs font-black px-2.5 py-1 rounded-full ${
                      game.is3d ? "bg-violet-600 text-white" : "bg-white/80 text-slate-600"
                    }`}
                  >
                    {game.is3d ? t("৩ডি", "3D") : t("২ডি", "2D")}
                  </span>
                  <span className="text-7xl drop-shadow-[0_8px_6px_rgba(76,29,149,0.25)] group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                    <Ico n={game.icon} size={84} />
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-semibold mt-3"><Rich>{gameText(game, lang).desc}</Rich></p>
                <div className="h-7 my-2 text-sm font-bold text-amber-700">
                  {game.freePlay ? (
                    <span className="text-emerald-600 flex items-center gap-1"><Ico n="🎶" size="1.2em" /> {t("ফ্রি খেলা", "Free play")}</span>
                  ) : best > 0 ? (
                    <span className="flex items-center gap-2">
                      <Stars count={stars} /> {toBn(best)}
                    </span>
                  ) : (
                    <span className="text-slate-400">{t("এখনো খেলোনি", "Not played yet")}</span>
                  )}
                </div>
                <span className="w-full py-3 rounded-full font-black text-white text-lg clay-btn-orange"><Rich>{t("খেলো এখনই 🚀", "Play now 🚀")}</Rich></span>
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
