"use client";

import React, { useCallback, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import MaishaChar from "@/components/ui/MaishaChar";
import { Ico } from "@/components/ui/Icons";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";
import { toBn } from "@/lib/format";
import { useT } from "@/lib/i18n";

type Msg = { icon: string; bn: string; en: string; tone: string };

// icon = 3D cartoon icon shown in the badge, tone = bubble accent colour
const MESSAGES: Msg[] = [
  { icon: "👋", bn: "হাই! আমি মাইশা!", en: "Hi! I'm Maisha!", tone: "from-pink-400 to-rose-500" },
  { icon: "🎮", bn: "চলো, একসাথে খেলি!", en: "Let's play together!", tone: "from-violet-400 to-purple-600" },
  { icon: "🤭", bn: "হি হি, সুড়সুড়ি লাগছে!", en: "Hehe, that tickles!", tone: "from-amber-300 to-orange-500" },
  { icon: "💖", bn: "তুমি কত মিষ্টি!", en: "Aww, you're so sweet!", tone: "from-pink-400 to-fuchsia-500" },
  { icon: "🏆", bn: "তুমিই আজকের চ্যাম্পিয়ন!", en: "You're today's champion!", tone: "from-yellow-300 to-amber-500" },
  { icon: "🚀", bn: "রকেট রান খেলে দেখো!", en: "Try Rocket Run!", tone: "from-sky-400 to-indigo-500" },
  { icon: "🎈", bn: "বেলুনগুলো ফাটিয়ে দাও!", en: "Pop all the balloons!", tone: "from-rose-400 to-red-500" },
  { icon: "🦄", bn: "জানো? ইউনিকর্ন আমার বন্ধু!", en: "Unicorns are my friends!", tone: "from-fuchsia-400 to-purple-500" },
  { icon: "🌈", bn: "আজকের দিনটা রংধনুর মতো!", en: "Today is rainbow-bright!", tone: "from-cyan-400 to-emerald-500" },
  { icon: "🎨", bn: "চলো, রঙিন ছবি আঁকি!", en: "Let's draw something!", tone: "from-orange-400 to-pink-500" },
  { icon: "💪", bn: "তুমি অনেক স্মার্ট!", en: "You're smart and strong!", tone: "from-emerald-400 to-teal-600" },
  { icon: "🎵", bn: "সুর বাজিয়ে গান গাই!", en: "Let's play a song!", tone: "from-indigo-400 to-violet-600" },
];

const HEART = "M12 21s-7-4.6-9.3-9.1C1 8.4 3 5 6.3 5c2 0 3.7 1.1 4.7 2.9C12 6.1 13.700 5 15.700 5 19 5 21 8.400 19.300 11.900 17 16.400 12 21 12 21z";
const STAR = "M12 2l2.900 6.300 6.900.8-5.100 4.700 1.400 6.800L12 17.200 5.900 20.600l1.400-6.800L2.200 9.100l6.900-.8z";

export default function MaishaMascot({ paused = false }: { paused?: boolean }) {
  const t = useT();
  const [msg, setMsg] = useState<Msg>({ icon: "👆", bn: "আমাকে ছুঁয়ে দেখো!", en: "Touch me!", tone: "from-purple-400 to-fuchsia-500" });
  const lastIdx = useRef(-1);
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
      setMsg({ icon: "🎉", bn: `বোনাস! +${toBn(5)} কয়েন পেলে!`, en: `Bonus! +${toBn(5)} coins!`, tone: "from-yellow-300 to-orange-500" });
      confetti({ particleCount: 40, spread: 70, origin, zIndex: 40 });
    } else {
      let i = Math.floor(Math.random() * MESSAGES.length);
      if (i === lastIdx.current) i = (i + 1) % MESSAGES.length; // never repeat the same line twice in a row
      lastIdx.current = i;
      setMsg(MESSAGES[i]);
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
    <div ref={wrapRef} className="relative w-full h-[22rem] md:h-[28rem] flex items-end justify-center pt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={msgKey}
          initial={{ opacity: 0, y: 14, scale: 0.7, rotate: -4 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 z-10 pointer-events-none w-max max-w-[88%]"
        >
          <div className={`relative flex items-center gap-3 rounded-3xl bg-gradient-to-br ${msg.tone} p-[3px] shadow-[0_8px_0_rgba(88,28,135,0.35),0_14px_24px_rgba(0,0,0,0.25)]`}>
            <div className="flex items-center gap-3 rounded-[1.35rem] bg-white pl-2 pr-5 py-2">
              <span className={`shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${msg.tone} flex items-center justify-center shadow-inner`}>
                <motion.span
                  key={msgKey}
                  initial={{ scale: 0.4, rotate: -25 }}
                  animate={{ scale: [0.4, 1.3, 1], rotate: [-25, 12, 0] }}
                  transition={{ duration: 0.55 }}
                  className="inline-flex"
                >
                  <Ico n={msg.icon} size={46} />
                </motion.span>
              </span>
              <span className="text-purple-900 font-black text-lg md:text-xl leading-tight text-left">{t(msg.bn, msg.en)}</span>
            </div>
            {/* speech-bubble tail pointing at Maisha */}
            <span className="absolute left-1/2 -bottom-[9px] -translate-x-1/2 w-5 h-5 rotate-45 bg-white border-r-[3px] border-b-[3px] border-white rounded-br-md shadow-[4px_4px_0_rgba(88,28,135,0.2)]" />
          </div>
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
