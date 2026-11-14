"use client";

import React, { useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import MaishaChar from "@/components/ui/MaishaChar";
import { Rich } from "@/components/ui/Icons";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";
import { toBn } from "@/lib/format";
import { useT } from "@/lib/i18n";

const MESSAGES: [string, string][] = [
  ["হাই! আমি মাইশা! 👋", "Hi! I'm Maisha! 👋"],
  ["চলো খেলি! 🎮", "Let's play! 🎮"],
  ["হি হি, সুড়সুড়ি লাগে! 🤭", "Hehe, that tickles! 🤭"],
  ["আমাকে আবার ছোঁও! 💖", "Tap me again! 💖"],
  ["তুমি দারুণ খেলো! ⭐", "You play so well! ⭐"],
];

const HEART = "M12 21s-7-4.6-9.3-9.1C1 8.4 3 5 6.3 5c2 0 3.7 1.1 4.7 2.9C12 6.1 13.700 5 15.700 5 19 5 21 8.400 19.300 11.900 17 16.400 12 21 12 21z";
const STAR = "M12 2l2.900 6.300 6.900.8-5.100 4.700 1.400 6.800L12 17.200 5.900 20.600l1.400-6.800L2.200 9.100l6.900-.8z";

export default function MaishaMascot({ paused = false }: { paused?: boolean }) {
  const t = useT();
  const [msg, setMsg] = useState<[string, string]>(["আমাকে ছুঁয়ে দেখো! 👆", "Touch me! 👆"]);
  const [msgKey, setMsgKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const claim = useGameStore((s) => s.claimMascotBonus);

  const onTap = useCallback(() => {
    if (paused) return;
    sounds.giggle();
    const rect = wrapRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height * 0.3) / window.innerHeight }
      : { x: 0.5, y: 0.4 };
    if (claim()) {
      sounds.coin();
      setMsg([`বোনাস! +${toBn(5)} ⭐ কয়েন 🎉`, `Bonus! +${toBn(5)} ⭐ coins 🎉`]);
      confetti({ particleCount: 40, spread: 70, origin, zIndex: 40 });
    } else {
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      confetti({
        particleCount: 10,
        spread: 55,
        origin,
        scalar: 1.6,
        zIndex: 40,
        colors: ["#fb4f78", "#fbbf24", "#a78bfa"],
        shapes: [confetti.shapeFromPath({ path: HEART }), confetti.shapeFromPath({ path: STAR })],
      });
    }
    setMsgKey((k) => k + 1);
  }, [claim, paused]);

  return (
    <div ref={wrapRef} className="relative w-full h-80 md:h-[26rem] flex items-end justify-center pt-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={msgKey}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 px-4 py-2 rounded-2xl bg-white text-purple-900 font-black text-base shadow-lg pointer-events-none whitespace-nowrap z-10"
        >
          <Rich>{t(msg[0], msg[1])}</Rich>
        </motion.div>
      </AnimatePresence>
      <div className="md:hidden">
        <MaishaChar mode="chill" height={250} onTap={onTap} />
      </div>
      <div className="hidden md:block">
        <MaishaChar mode="chill" height={330} onTap={onTap} />
      </div>
    </div>
  );
}
