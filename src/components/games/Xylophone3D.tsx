"use client";

import React from "react";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";

const BARS = [
  { note: "C", freq: 261.63, color: "bg-red-500", shadow: "#991b1b", height: "h-64" },
  { note: "D", freq: 293.66, color: "bg-orange-500", shadow: "#9a3412", height: "h-60" },
  { note: "E", freq: 329.63, color: "bg-yellow-400", shadow: "#854d0e", height: "h-56" },
  { note: "F", freq: 349.23, color: "bg-green-500", shadow: "#166534", height: "h-52" },
  { note: "G", freq: 392.00, color: "bg-teal-500", shadow: "#115e59", height: "h-48" },
  { note: "A", freq: 440.00, color: "bg-blue-500", shadow: "#1e40af", height: "h-44" },
  { note: "B", freq: 493.88, color: "bg-indigo-500", shadow: "#3730a3", height: "h-40" },
  { note: "C2", freq: 523.25, color: "bg-purple-500", shadow: "#581c87", height: "h-36" },
];

export default function Xylophone3D() {
  const addCoins = useGameStore((s) => s.addCoins);

  const playBar = (freq: number) => {
    sounds.playNote(freq);
    addCoins(1);
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-black text-purple-900 mb-4">🎵 রেইনবো জাইলোফোন বাজাও!</h3>
      <div className="flex items-end justify-center gap-2 p-6 bg-amber-100 rounded-3xl border-4 border-amber-300 shadow-inner">
        {BARS.map((bar) => (
          <button
            key={bar.note}
            onClick={() => playBar(bar.freq)}
            style={{ boxShadow: `0 8px 0 ${bar.shadow}` }}
            className={`${bar.color} ${bar.height} w-11 md:w-14 rounded-2xl flex flex-col justify-between items-center py-3 text-white font-black active:translate-y-2 transition-transform shadow-lg`}
          >
            <span className="w-3 h-3 bg-white/70 rounded-full" />
            <span className="text-lg">{bar.note}</span>
            <span className="w-3 h-3 bg-white/70 rounded-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
