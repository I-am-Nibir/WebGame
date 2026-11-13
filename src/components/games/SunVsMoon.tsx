"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

type Cell = null | "S" | "M"; // Sun = child, Moon = robot
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function findWinner(b: Cell[]) {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a] as "S" | "M", line };
  }
  return null;
}

/** A friendly robot: plays smart ~60% of the time so kids can win. */
function robotMove(b: Cell[]): number {
  const empty = b.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  const finish = (who: "S" | "M") =>
    empty.find((i) => {
      const t = [...b];
      t[i] = who;
      return findWinner(t)?.who === who;
    });
  if (Math.random() < 0.6) {
    const win = finish("M");
    if (win !== undefined) return win;
    const block = finish("S");
    if (block !== undefined) return block;
    if (!b[4]) return 4;
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function SunVsMoon() {
  const { active, addScore, finish } = useGame();
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"S" | "M">("S");
  const [over, setOver] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const result = findWinner(board);
  const full = board.every(Boolean);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  // detect end of game
  useEffect(() => {
    if (over || (!result && !full)) return;
    setOver(true);
    if (result?.who === "S") sounds.win();
    else if (result?.who === "M") sounds.wrong();
    else sounds.coin();
    const pts = result?.who === "S" ? 100 : result?.who === "M" ? 20 : 50;
    timers.current.push(
      setTimeout(() => {
        addScore(pts);
        finish();
      }, 1100)
    );
  }, [result, full, over, addScore, finish]);

  // robot's turn
  useEffect(() => {
    if (turn !== "M" || over || !active || result || full) return;
    const id = setTimeout(() => {
      setBoard((b) => {
        const move = robotMove(b);
        const next = [...b];
        next[move] = "M";
        return next;
      });
      sounds.pop(0.8);
      setTurn("S");
    }, 700);
    return () => clearTimeout(id);
  }, [turn, over, active, result, full]);

  const tap = (i: number) => {
    if (!active || turn !== "S" || board[i] || over) return;
    sounds.pop(1.2);
    setBoard((b) => b.map((c, k) => (k === i ? "S" : c)));
    setTurn("M");
  };

  const status = over
    ? result?.who === "S"
      ? "তুমি জিতে গেছো! 🎉"
      : result?.who === "M"
        ? "রোবট জিতল! 🤖"
        : "ড্র! 🤝"
    : turn === "S"
      ? "তোমার পালা ☀️"
      : "রোবট ভাবছে 🤖";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4">
      <p className="font-black text-2xl text-amber-950 bg-white/60 px-6 py-2 rounded-full" aria-live="polite">
        {status}
      </p>
      <div className="w-full max-w-sm" style={{ transform: "perspective(800px) rotateX(18deg)" }}>
        <div className="grid grid-cols-3 gap-3 p-3 rounded-[2rem] bg-orange-600/80 shadow-[0_14px_0_#9a3412]">
          {board.map((c, i) => {
            const win = result?.line.includes(i);
            return (
              <button
                key={i}
                onClick={() => tap(i)}
                aria-label={c === "S" ? "সূর্য" : c === "M" ? "চাঁদ" : "খালি ঘর"}
                className={`aspect-square rounded-2xl text-6xl flex items-center justify-center transition active:scale-95 ${
                  win ? "bg-yellow-200 shadow-[0_6px_0_#ca8a04] animate-bob" : "bg-amber-50 shadow-[0_6px_0_#d6b98a]"
                }`}
              >
                {c === "S" && <span className="animate-pop">☀️</span>}
                {c === "M" && <span className="animate-pop">🌙</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
