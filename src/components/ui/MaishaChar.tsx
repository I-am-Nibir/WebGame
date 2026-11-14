"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Ico } from "@/components/ui/Icons";

/**
 * Maisha — the animated cartoon mascot, built from the character-design art.
 *  chill   : breathing/swaying idle, now and then waves hello (two-frame wave)
 *  victory : jumping with arms up + falling confetti icons
 *  explore : walking bob (backpack + map)
 * `onTap` makes her hop when tapped.
 */
export type MaishaMode = "chill" | "victory" | "explore";

const POSES = {
  stand: { src: "maisha/stand.webp", w: 287, h: 760, head: 0.54 },
  wave: { src: "maisha/wave.webp", w: 339, h: 742, head: 0.435 },
  explore: { src: "maisha/explore.webp", w: 350, h: 687, head: 0.5 },
  victory: { src: "maisha/victory.webp", w: 320, h: 657, head: 0.55 },
} as const;
type PoseKey = keyof typeof POSES;

const SPARKS: { icon: string; x: string; y: string; s: number; d: string }[] = [
  { icon: "⭐", x: "4%", y: "12%", s: 0.17, d: "0s" },
  { icon: "✨", x: "84%", y: "18%", s: 0.15, d: "0.7s" },
  { icon: "💖", x: "88%", y: "56%", s: 0.13, d: "1.4s" },
  { icon: "🌸", x: "0%", y: "58%", s: 0.13, d: "0.3s" },
];

export default function MaishaChar({
  mode = "chill",
  height = 280,
  onTap,
  className = "",
  sparkles = true,
}: {
  mode?: MaishaMode;
  height?: number;
  onTap?: () => void;
  className?: string;
  sparkles?: boolean;
}) {
  const [frame, setFrame] = useState(0);
  const [hop, setHop] = useState(0);

  // chill: every ~6.5s wave for ~2.2s by flipping between two frames
  useEffect(() => {
    if (mode !== "chill") return;
    let flip: number | undefined;
    const wave = () => {
      let n = 0;
      if (flip) window.clearInterval(flip);
      flip = window.setInterval(() => {
        n++;
        if (n >= 5) {
          window.clearInterval(flip);
          setFrame(0);
        } else setFrame(n % 2);
      }, 450);
      setFrame(1);
    };
    const first = window.setTimeout(wave, 900);
    const every = window.setInterval(wave, 6500);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(every);
      if (flip) window.clearInterval(flip);
    };
  }, [mode]);

  const tap = useCallback(() => {
    setHop((h) => h + 1);
    onTap?.();
  }, [onTap]);

  const k = height / 742; // px per sprite pixel
  const boxW = Math.round(height * 0.78);
  const cx = boxW / 2;

  const main: PoseKey = mode === "victory" ? "victory" : mode === "explore" ? "explore" : "stand";
  const frames: PoseKey[] = mode === "chill" ? ["stand", "wave"] : [main];
  const showIdx = mode === "chill" ? frame : 0;
  const anim = mode === "victory" ? "maisha-victory" : mode === "explore" ? "maisha-walk" : hop > 0 ? "maisha-tap" : "maisha-chill";

  return (
    <div
      className={`relative select-none ${onTap ? "cursor-pointer" : ""} ${className}`}
      style={{ width: boxW, height: height + 14 }}
      onPointerDown={onTap ? tap : undefined}
      role={onTap ? "button" : "img"}
      aria-label="Maisha"
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-indigo-950/30 blur-[2px]"
        style={{ bottom: 0, width: boxW * 0.62, height: Math.max(8, height * 0.04) }}
      />
      {sparkles &&
        mode !== "victory" &&
        SPARKS.map((s, i) => (
          <span key={i} className="absolute maisha-twinkle" style={{ left: s.x, top: s.y, ["--d" as string]: s.d }}>
            <Ico n={s.icon} size={height * s.s} />
          </span>
        ))}
      {mode === "victory" &&
        Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute maisha-fall" style={{ left: `${4 + i * 10.5}%`, top: 0, ["--d" as string]: `${(i * 0.37) % 2}s` }}>
            <Ico n={["⭐", "🎉", "💖", "✨", "🌸"][i % 5]} size={height * 0.11} />
          </span>
        ))}
      <div key={`${mode}-${hop}`} className={`absolute bottom-[10px] left-0 ${anim}`} style={{ width: boxW, height }}>
        {frames.map((fk, i) => {
          const p = POSES[fk];
          const w = p.w * k;
          const h = p.h * k;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={fk}
              src={p.src}
              alt=""
              draggable={false}
              className="absolute bottom-0"
              style={{ left: cx - p.head * w, width: w, height: h, opacity: i === showIdx ? 1 : 0, pointerEvents: "none" }}
            />
          );
        })}
      </div>
    </div>
  );
}
