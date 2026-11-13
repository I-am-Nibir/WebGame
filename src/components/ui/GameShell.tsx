"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { COINS_BY_STARS, type GameMeta } from "@/lib/games";
import { useGameStore } from "@/lib/store";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

export type GameStatus = "ready" | "playing" | "over";

export interface GameApi {
  /** True only while the round is running and not paused. */
  active: boolean;
  status: GameStatus;
  round: number;
  addScore: (n: number) => void;
  /** End the round (computes stars + coins). Safe to call more than once. */
  finish: () => void;
  scoreRef: React.MutableRefObject<number>;
  timeLeftRef: React.MutableRefObject<number>;
}

export const GameCtx = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside <GameShell>");
  return ctx;
}

interface Result {
  score: number;
  stars: number;
  coins: number;
  best: number;
  newBest: boolean;
}

const iconBtn =
  "w-12 h-12 shrink-0 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 flex items-center justify-center text-white transition";

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/45 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl border-4 border-purple-200"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function GameShell({
  meta,
  onClose,
  children,
}: {
  meta: GameMeta;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const addCoins = useGameStore((s) => s.addCoins);
  const recordResult = useGameStore((s) => s.recordResult);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const duration = meta.duration ?? 0;
  const [status, setStatus] = useState<GameStatus>(meta.freePlay ? "playing" : "ready");
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [result, setResult] = useState<Result | null>(null);

  const statusRef = useRef<GameStatus>(status);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(duration);

  const changeStatus = useCallback((s: GameStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const addScore = useCallback((n: number) => {
    if (statusRef.current !== "playing") return;
    scoreRef.current += n;
    setScore(scoreRef.current);
  }, []);

  const finish = useCallback(() => {
    if (statusRef.current !== "playing" || meta.freePlay) return;
    statusRef.current = "over";
    const finalScore = scoreRef.current;
    const stars = meta.stars.filter((t) => finalScore >= t).length;
    const coins = COINS_BY_STARS[stars];
    const prevBest = useGameStore.getState().highScores[meta.id] ?? 0;
    addCoins(coins);
    recordResult(meta.id, finalScore, stars);
    setResult({ score: finalScore, stars, coins, best: Math.max(prevBest, finalScore), newBest: finalScore > prevBest });
    setStatus("over");
    sounds.win();
    if (stars >= 2) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 }, zIndex: 100 });
    }
  }, [meta, addCoins, recordResult]);

  const begin = useCallback(() => {
    sounds.unlock();
    scoreRef.current = 0;
    timeLeftRef.current = duration;
    setScore(0);
    setTimeLeft(duration);
    setResult(null);
    setPaused(false);
    setRound((r) => r + 1);
    changeStatus("playing");
  }, [duration, changeStatus]);

  const active = status === "playing" && !paused;

  // countdown
  useEffect(() => {
    if (!active || !duration) return;
    const id = setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 0.1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) finish();
    }, 100);
    return () => clearInterval(id);
  }, [active, duration, finish]);

  // lock page scroll while a game is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // pause on Escape or when the tab is hidden
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && statusRef.current === "playing" && !meta.freePlay) setPaused((p) => !p);
    };
    const onVis = () => {
      if (document.hidden && statusRef.current === "playing") setPaused(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [meta.freePlay]);

  const api = useMemo<GameApi>(
    () => ({ active, status, round, addScore, finish, scoreRef, timeLeftRef }),
    [active, status, round, addScore, finish]
  );

  const pct = duration ? (timeLeft / duration) * 100 : 0;
  const hurry = duration > 0 && timeLeft <= 10;

  return (
    <GameCtx.Provider value={api}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={meta.name}
        className={`fixed inset-0 z-50 flex flex-col animate-fade-in ${meta.bg}`}
      >
        <header className="flex items-center gap-2 px-3 py-2 bg-black/25 backdrop-blur text-white">
          <button onClick={onClose} aria-label="ফিরে যাও" className={iconBtn}>
            <ArrowLeft size={26} />
          </button>
          <div className="flex items-center gap-2 font-black text-lg min-w-0">
            <span className="text-2xl">{meta.icon}</span>
            <span className="truncate">{meta.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!meta.freePlay && (
              <div className="px-3 h-10 rounded-full bg-white/20 font-black flex items-center gap-1" aria-live="polite">
                ⭐ {toBn(score)}
              </div>
            )}
            {!meta.freePlay && status === "playing" && (
              <button onClick={() => setPaused((p) => !p)} aria-label={paused ? "চালিয়ে যাও" : "বিরতি"} className={iconBtn}>
                {paused ? <Play size={24} /> : <Pause size={24} />}
              </button>
            )}
            <button onClick={toggleSound} aria-label={soundEnabled ? "সাউন্ড বন্ধ করো" : "সাউন্ড চালু করো"} className={iconBtn}>
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>
        </header>

        {duration > 0 && status !== "ready" && (
          <div className="h-3 bg-black/25" aria-hidden>
            <div
              className={`h-full transition-[width] duration-100 ease-linear ${hurry ? "bg-red-400" : "bg-yellow-300"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        <div className="relative flex-1 min-h-0">
          <React.Fragment key={round}>{children}</React.Fragment>

          {status === "ready" && (
            <Overlay>
              <div className="text-7xl mb-2">{meta.icon}</div>
              <h2 className="text-2xl font-black text-purple-950 mb-2">{meta.name}</h2>
              <p className="text-slate-600 font-semibold mb-5 leading-relaxed">{meta.howTo}</p>
              <button onClick={begin} className="w-full py-4 rounded-2xl font-black text-2xl text-purple-950 clay-btn-yellow">
                শুরু করো! 🚀
              </button>
            </Overlay>
          )}

          {status === "playing" && paused && (
            <Overlay>
              <div className="text-6xl mb-2">⏸️</div>
              <h2 className="text-2xl font-black text-purple-950 mb-5">বিরতি</h2>
              <div className="space-y-3">
                <button onClick={() => setPaused(false)} className="w-full py-4 rounded-2xl font-black text-xl text-purple-950 clay-btn-yellow">
                  চালিয়ে যাও ▶
                </button>
                <button onClick={onClose} className="w-full py-3 rounded-2xl font-black text-lg text-white clay-btn-purple">
                  বাইরে যাও
                </button>
              </div>
            </Overlay>
          )}

          {status === "over" && result && (
            <Overlay>
              <h2 className="text-2xl font-black text-purple-950 mb-1">
                {result.stars === 3 ? "দারুণ! 🎉" : result.stars >= 1 ? "খুব ভালো! 👏" : "আবার চেষ্টা করো! 💪"}
              </h2>
              <div className="flex justify-center gap-2 my-3" aria-label={`${result.stars} তারা`}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 * i, type: "spring", stiffness: 300 }}
                    className={`text-6xl ${i < result.stars ? "" : "grayscale opacity-30"}`}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <p className="text-xl font-black text-slate-800">স্কোর: {toBn(result.score)}</p>
              <p className="text-amber-600 font-black text-lg">+{toBn(result.coins)} কয়েন ⭐</p>
              <p className="text-slate-500 font-bold mb-5">
                {result.newBest ? "🏆 নতুন রেকর্ড!" : `সেরা স্কোর: ${toBn(result.best)}`}
              </p>
              <div className="space-y-3">
                <button onClick={begin} className="w-full py-4 rounded-2xl font-black text-xl text-purple-950 clay-btn-yellow flex items-center justify-center gap-2">
                  <RotateCcw size={22} /> আবার খেলো
                </button>
                <button onClick={onClose} className="w-full py-3 rounded-2xl font-black text-lg text-white clay-btn-purple">
                  অন্য গেম
                </button>
              </div>
            </Overlay>
          )}
        </div>
      </div>
    </GameCtx.Provider>
  );
}
