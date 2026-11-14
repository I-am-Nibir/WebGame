"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Rich } from "@/components/ui/Icons";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

interface Question {
  text: string;
  answer: number;
  options: number[];
}

const BUBBLE_COLORS = [
  ["#f9a8d4", "#ec4899"],
  ["#fde68a", "#f59e0b"],
  ["#86efac", "#16a34a"],
  ["#c4b5fd", "#7c3aed"],
];

function makeQuestion(solved: number): Question {
  const max = solved < 4 ? 10 : solved < 9 ? 20 : 30;
  const sub = solved >= 3 && Math.random() < 0.45;
  let a: number;
  let b: number;
  let answer: number;
  let text: string;
  if (sub) {
    a = 2 + Math.floor(Math.random() * (max - 1));
    b = 1 + Math.floor(Math.random() * a);
    answer = a - b;
    text = `${toBn(a)} − ${toBn(b)}`;
  } else {
    a = 1 + Math.floor(Math.random() * Math.floor(max / 2));
    b = 1 + Math.floor(Math.random() * Math.floor(max / 2));
    answer = a + b;
    text = `${toBn(a)} + ${toBn(b)}`;
  }
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const d = (1 + Math.floor(Math.random() * 4)) * (Math.random() < 0.5 ? -1 : 1);
    const v = answer + d;
    if (v >= 0) set.add(v);
  }
  return { text, answer, options: Array.from(set).sort(() => Math.random() - 0.5) };
}

export default function MathBubbles() {
  const t = useT();
  const { active, addScore } = useGame();
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [q, setQ] = useState<Question>(() => makeQuestion(0));
  const [wrong, setWrong] = useState<number[]>([]);
  const [popped, setPopped] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const choose = useCallback(
    (v: number) => {
      if (!active || popped !== null || wrong.includes(v)) return;
      if (v === q.answer) {
        const s = streak + 1;
        setStreak(s);
        setPopped(v);
        sounds.pop(1.3);
        sounds.coin();
        addScore(10 + (s >= 3 ? 5 : 0));
        timer.current = setTimeout(() => {
          setSolved((n) => n + 1);
          setQ(makeQuestion(solved + 1));
          setWrong([]);
          setPopped(null);
        }, 450);
      } else {
        sounds.wrong();
        setStreak(0);
        setWrong((w) => [...w, v]);
      }
    },
    [active, popped, wrong, q.answer, streak, addScore, solved]
  );

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <div className="bg-white rounded-[2rem] px-8 py-5 shadow-xl border-4 border-sky-200">
          <p className="text-5xl sm:text-6xl font-black text-sky-700 tracking-wide">{q.text} = ?</p>
        </div>
        <p className="mt-3 h-7 text-white font-black text-lg">{streak >= 3 ? <Rich>{t(`🔥 ধারাবাহিক ${toBn(streak)}!`, `🔥 Streak ${toBn(streak)}!`)}</Rich> : ""}</p>
      </div>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        {q.options.map((v, i) => {
          const [from, to] = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
          const isWrong = wrong.includes(v);
          const isPopped = popped === v;
          return (
            <div key={v} className="animate-bob" style={{ animationDelay: `${i * 0.4}s` }}>
              <button
                onPointerDown={() => choose(v)}
                disabled={isWrong}
                aria-label={String(v)}
                className={`relative w-full aspect-square rounded-full text-5xl font-black text-white border-4 border-white/80 transition-all duration-300 ${
                  isWrong ? "opacity-25 scale-75 animate-shake" : ""
                } ${isPopped ? "scale-150 opacity-0" : ""}`}
                style={{
                  background: `radial-gradient(circle at 30% 28%, #ffffffcc 0 12%, ${from} 13%, ${to} 100%)`,
                  boxShadow: `0 10px 24px ${to}77`,
                  textShadow: "0 3px 6px rgba(0,0,0,.3)",
                }}
              >
                {toBn(v)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
