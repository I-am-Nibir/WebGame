"use client";

import React, { useState, useEffect } from "react";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";

interface Balloon {
  id: number;
  x: number;
  color: string;
  speed: number;
  y: number;
}

export default function BalloonPop() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const addCoins = useGameStore((s) => s.addCoins);

  const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons((prev) => [
        ...prev.slice(-15),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 1.5 + 2,
          y: 110,
        },
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  const pop = (id: number) => {
    sounds.playPop();
    setScore((s) => s + 5);
    addCoins(1);
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-lg mb-3 px-4 font-black text-purple-900 text-xl">
        <span>স্কোর: {score}</span>
        <span>🎈 বেলুন স্পর্শ করো!</span>
      </div>
      <div className="relative w-full max-w-lg h-96 bg-gradient-to-b from-sky-200 to-sky-400 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
        {balloons.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            style={{
              left: `${b.x}%`,
              backgroundColor: b.color,
              animation: `floatUp ${5 / b.speed}s linear forwards`,
            }}
            className="absolute bottom-[-60px] w-14 h-16 rounded-full shadow-lg flex items-center justify-center transform -translate-x-1/2 cursor-pointer active:scale-125 transition-transform"
          >
            <div className="w-2 h-4 bg-white/40 rounded-full absolute top-2 left-3 transform -rotate-45" />
          </button>
        ))}
      </div>
      <style jsx>{`
        @keyframes floatUp {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-480px);
          }
        }
      `}</style>
    </div>
  );
}
