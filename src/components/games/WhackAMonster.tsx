"use client";

import React, { useState, useEffect } from "react";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";

export default function WhackAMonster() {
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const addCoins = useGameStore((s) => s.addCoins);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * 9));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const whack = (idx: number) => {
    if (idx === activeHole) {
      sounds.playPop();
      setScore((s) => s + 10);
      addCoins(2);
      setActiveHole(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-md mb-4 text-purple-900 font-black text-xl px-2">
        <span>স্কোর: {score}</span>
        <span>🐹 মনস্টারে ট্যাপ করো!</span>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 bg-emerald-100 rounded-3xl border-4 border-emerald-300">
        {[...Array(9)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => whack(idx)}
            className="w-24 h-24 bg-amber-900 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-inner border-4 border-amber-950 active:scale-95 transition"
          >
            <div className="w-16 h-8 bg-amber-950/60 rounded-full absolute bottom-1" />
            {activeHole === idx && (
              <span className="text-4xl animate-bounce transform -translate-y-1">
                🐹
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
