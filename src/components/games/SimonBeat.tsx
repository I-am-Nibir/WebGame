"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Ico, Rich } from "@/components/ui/Icons";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

const PADS = [
  { name: "লাল", freq: 261.63, from: "#fb7185", to: "#e11d48", shade: "#9f1239" },
  { name: "নীল", freq: 329.63, from: "#60a5fa", to: "#2563eb", shade: "#1e3a8a" },
  { name: "সবুজ", freq: 392.0, from: "#4ade80", to: "#16a34a", shade: "#14532d" },
  { name: "হলুদ", freq: 523.25, from: "#fde047", to: "#eab308", shade: "#854d0e" },
];

type Phase = "idle" | "watch" | "play";

export default function SimonBeat() {
  const { active, addScore, finish } = useGame();
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState(-1);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(0);

  const seq = useRef<number[]>([]);
  const input = useRef(0);
  const livesRef = useRef(3);
  const started = useRef(false);
  const cancelled = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
    };
  }, []);

  /** Wait `ms` of *active* time, so pausing the game pauses the sequence. */
  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        let acc = 0;
        const id = setInterval(() => {
          if (cancelled.current) {
            clearInterval(id);
            resolve();
            return;
          }
          if (activeRef.current) acc += 50;
          if (acc >= ms) {
            clearInterval(id);
            resolve();
          }
        }, 50);
      }),
    []
  );

  const playSequence = useCallback(async () => {
    setPhase("watch");
    await wait(700);
    for (const p of seq.current) {
      if (cancelled.current) return;
      setLit(p);
      sounds.note(PADS[p].freq);
      await wait(450);
      setLit(-1);
      await wait(200);
    }
    if (cancelled.current) return;
    input.current = 0;
    setPhase("play");
  }, [wait]);

  useEffect(() => {
    if (active && !started.current) {
      started.current = true;
      seq.current = [Math.floor(Math.random() * 4)];
      setRound(1);
      void playSequence();
    }
  }, [active, playSequence]);

  const press = async (i: number) => {
    if (phase !== "play" || !active) return;
    setLit(i);
    sounds.note(PADS[i].freq);
    setTimeout(() => setLit(-1), 220);

    if (seq.current[input.current] === i) {
      input.current += 1;
      if (input.current === seq.current.length) {
        setPhase("idle");
        addScore(10);
        sounds.coin();
        await wait(800);
        if (cancelled.current) return;
        seq.current = [...seq.current, Math.floor(Math.random() * 4)];
        setRound(seq.current.length);
        void playSequence();
      }
    } else {
      sounds.wrong();
      livesRef.current -= 1;
      setLives(livesRef.current);
      setPhase("idle");
      if (livesRef.current <= 0) {
        setTimeout(finish, 600);
      } else {
        await wait(900);
        if (cancelled.current) return;
        void playSequence();
      }
    }
  };

  const status =
    phase === "watch" ? "দেখো 👀" : phase === "play" ? "এবার তুমি! 👆" : lives < 3 && lives > 0 ? "ভুল! আবার দেখো 😅" : "...";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-4">
      <div className="flex items-center gap-4 text-white font-black text-xl">
        <span className="bg-white/15 px-4 py-1.5 rounded-full">রাউন্ড {toBn(round)}</span>
        <span aria-label={`${lives} জীবন`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < lives ? "" : "grayscale opacity-30"}>
              <Ico n="❤️" size={30} />
            </span>
          ))}
        </span>
      </div>
      <p className="text-yellow-300 font-black text-2xl min-h-8" aria-live="polite">
        <Rich>{status}</Rich>
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm aspect-square">
        {PADS.map((p, i) => {
          const on = lit === i;
          return (
            <button
              key={p.name}
              onPointerDown={() => void press(i)}
              aria-label={p.name}
              disabled={phase !== "play"}
              className="rounded-[2rem] border-4 border-white/70 transition-all duration-100 disabled:cursor-default"
              style={{
                background: `linear-gradient(180deg, ${p.from}, ${p.to})`,
                boxShadow: on ? `0 2px 0 ${p.shade}, 0 0 50px ${p.from}` : `0 10px 0 ${p.shade}`,
                transform: on ? "translateY(8px) scale(1.04)" : "none",
                filter: on ? "brightness(1.35)" : phase === "play" ? "none" : "brightness(0.8)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
