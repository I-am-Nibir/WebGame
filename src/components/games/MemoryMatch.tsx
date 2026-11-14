"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ico, iconName } from "@/components/ui/Icons";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

const ANIMALS = ["🐶", "🐱", "🐼", "🦁", "🐸", "🦄"];

function shuffled() {
  const cards = [...ANIMALS, ...ANIMALS];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  // ids are assigned AFTER shuffling so that deck[id] is always the card shown at position id
  return cards.map((emoji, id) => ({ id, emoji }));
}

export default function MemoryMatch() {
  const { active, addScore, finish } = useGame();
  const deck = useMemo(shuffled, []);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const flip = (id: number) => {
    if (!active || lock.current || flipped.includes(id)) return;
    const card = deck[id];
    if (matched.includes(card.emoji)) return;
    sounds.pop(1.2);
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length < 2) return;

    lock.current = true;
    const newMoves = moves + 1;
    setMoves(newMoves);
    const [a, b] = next.map((i) => deck[i]);
    if (a.emoji === b.emoji) {
      timers.current.push(
        setTimeout(() => {
          sounds.coin();
          addScore(20);
          const nowMatched = [...matched, a.emoji];
          setMatched(nowMatched);
          setFlipped([]);
          lock.current = false;
          if (nowMatched.length === ANIMALS.length) {
            addScore(Math.max(0, 50 - (newMoves - ANIMALS.length) * 5));
            timers.current.push(setTimeout(finish, 700));
          }
        }, 450)
      );
    } else {
      timers.current.push(
        setTimeout(() => {
          sounds.wrong();
          setFlipped([]);
          lock.current = false;
        }, 850)
      );
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 gap-4">
      <div className="font-black text-white text-xl bg-black/20 px-5 py-2 rounded-full">চাল: {toBn(moves)}</div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-md">
        {deck.map((card) => {
          const open = flipped.includes(card.id) || matched.includes(card.emoji);
          const done = matched.includes(card.emoji);
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              aria-label={open ? iconName(card.emoji) ?? "কার্ড" : "বন্ধ কার্ড"}
              className="aspect-square [perspective:700px]"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                  open ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 border-4 border-white/80 shadow-[0_6px_0_#581c87] flex items-center justify-center text-4xl text-white [backface-visibility:hidden]">
                  <Ico n="⭐" size={44} />
                </div>
                <div
                  className={`absolute inset-0 rounded-2xl border-4 flex items-center justify-center text-5xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                    done ? "bg-emerald-100 border-emerald-400 shadow-[0_6px_0_#059669]" : "bg-white border-yellow-300 shadow-[0_6px_0_#ca8a04]"
                  }`}
                >
                  <Ico n={card.emoji} size={60} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
