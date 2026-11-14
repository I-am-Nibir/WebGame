"use client";

import React from "react";
import { Ico } from "@/components/ui/Icons";

/** Inline CSS variables (animation duration / delay) without fighting TypeScript. */
const vars = (o: Record<string, string | number>) => o as React.CSSProperties;

/* Fixed data (no Math.random) so server and client render exactly the same markup. */
const STARS = [
  { x: 5, y: 14, s: 18, c: "#fde047", d: 2.4, l: 0 },
  { x: 12, y: 58, s: 11, c: "#ffffff", d: 3.1, l: -1 },
  { x: 19, y: 30, s: 14, c: "#f9a8d4", d: 2.8, l: -2 },
  { x: 27, y: 8, s: 10, c: "#ffffff", d: 3.4, l: -0.5 },
  { x: 33, y: 72, s: 16, c: "#fde047", d: 2.2, l: -1.4 },
  { x: 41, y: 20, s: 12, c: "#a5f3fc", d: 3.6, l: -2.2 },
  { x: 47, y: 52, s: 9, c: "#ffffff", d: 2.6, l: -0.8 },
  { x: 55, y: 10, s: 17, c: "#fde047", d: 3, l: -1.9 },
  { x: 62, y: 40, s: 10, c: "#f9a8d4", d: 2.9, l: -0.3 },
  { x: 69, y: 78, s: 13, c: "#ffffff", d: 3.3, l: -2.6 },
  { x: 76, y: 16, s: 11, c: "#a5f3fc", d: 2.5, l: -1.1 },
  { x: 83, y: 48, s: 15, c: "#fde047", d: 3.2, l: -0.6 },
  { x: 90, y: 26, s: 10, c: "#ffffff", d: 2.7, l: -1.7 },
  { x: 95, y: 64, s: 14, c: "#f9a8d4", d: 3.5, l: -2.4 },
  { x: 8, y: 84, s: 9, c: "#ffffff", d: 2.3, l: -0.9 },
  { x: 58, y: 88, s: 10, c: "#fde047", d: 3.1, l: -1.5 },
];

const CLOUDS = [
  { y: 3, w: 150, o: 0.9, d: 70, l: -12, phone: false },
  { y: 58, w: 120, o: 0.75, d: 52, l: -40, phone: true },
  { y: 70, w: 170, o: 0.5, d: 85, l: -60, phone: false },
];

const BALLOONS = [
  { x: 46, hue: 0, d: 17, l: -4 },
  { x: 58, hue: 200, d: 21, l: -11 },
  { x: 70, hue: 110, d: 19, l: -16 },
];

function StarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" />
    </svg>
  );
}

function Cloud() {
  return (
    <svg viewBox="0 0 120 60" className="w-full h-auto" aria-hidden>
      <g fill="#ffffff">
        <circle cx="35" cy="35" r="22" />
        <circle cx="62" cy="26" r="26" />
        <circle cx="88" cy="36" r="20" />
        <rect x="25" y="36" width="75" height="21" rx="10" />
      </g>
    </svg>
  );
}

/** A sleepy crescent moon with a little face. */
function Moon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden>
      <defs>
        <mask id="hero-moon-mask">
          <rect width="100" height="100" fill="white" />
          <circle cx="66" cy="38" r="33" fill="black" />
        </mask>
      </defs>
      <g style={{ filter: "drop-shadow(0 0 14px rgba(253,230,138,.85))" }}>
        <circle cx="50" cy="50" r="40" fill="#fde68a" mask="url(#hero-moon-mask)" />
      </g>
      <path d="M22 50 q5 5 10 0" stroke="#b45309" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="21" cy="60" r="4.2" fill="#fb923c" opacity=".55" />
      <path d="M27 66 q4 4 8 0" stroke="#b45309" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Purple banner whose background is alive: twinkling stars, a sleepy moon, drifting clouds,
 * a galloping horse, a flying unicorn, rising balloons and a rocket.
 * Everything is CSS transform/opacity only, and switches off for prefers-reduced-motion.
 */
export default function HeroBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl bg-gradient-to-br from-[#4c1d95] via-[#6d28d9] to-[#4338ca]">
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {/* soft glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_35%,rgba(255,255,255,0.20),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(253,230,138,0.20),transparent_40%)]" />

        {/* twinkling stars */}
        {STARS.map((s, i) => (
          <span
            key={i}
            className={`absolute hero-twinkle ${i % 3 === 0 ? "" : "hidden sm:block"}`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, ...vars({ "--d": `${s.d}s`, "--delay": `${s.l}s` }) }}
          >
            <StarIcon size={s.s} color={s.c} />
          </span>
        ))}

        {/* shooting star */}
        <div
          className="absolute top-[8%] right-[6%] hero-shoot hidden sm:block"
          style={vars({ "--d": "9s", "--delay": "-2s" })}
        >
          <div className="h-[3px] w-28 rounded-full bg-gradient-to-l from-white via-white/60 to-transparent" />
        </div>

        {/* moon */}
        <div className="absolute left-[5%] top-[2%] w-14 h-14 sm:left-[46%] sm:top-[4%] sm:w-24 sm:h-24 hero-moon">
          <Moon />
        </div>

        {/* drifting clouds */}
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={`absolute left-0 w-full hero-drift ${c.phone ? "" : "hidden sm:block"}`}
            style={{ top: `${c.y}%`, ...vars({ "--d": `${c.d}s`, "--delay": `${c.l}s` }) }}
          >
            <div className="absolute right-0" style={{ width: c.w, opacity: c.o }}>
              <Cloud />
            </div>
          </div>
        ))}

        {/* flying unicorn with sparkle trail (moves left to right) */}
        <div className="absolute left-0 top-[62%] sm:top-[18%] w-full hero-drift" style={vars({ "--d": "42s", "--delay": "-14s" })}>
          <div className="absolute right-0 hero-bob text-4xl sm:text-5xl" style={vars({ "--d": "3s" })}>
            <Ico n="✨" size="0.8em" /><Ico n="🦄" size="1em" />
          </div>
        </div>

        {/* rising balloons */}
        {BALLOONS.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-y-0 w-10 hero-rise ${i === 0 ? "" : "hidden sm:block"}`}
            style={{ left: `${b.x}%`, ...vars({ "--d": `${b.d}s`, "--delay": `${b.l}s` }) }}
          >
            <span
              className="absolute bottom-0 text-4xl hero-sway"
              style={{ filter: `hue-rotate(${b.hue}deg)`, ...vars({ "--delay": `${b.l}s` }) }}
            >
              <Ico n="🎈" size="1em" />
            </span>
          </div>
        ))}

        {/* rocket flying up and to the right */}
        <div className="absolute inset-0 hero-rocket hidden sm:block" style={vars({ "--d": "17s", "--delay": "-6s" })}>
          <span className="absolute left-[40%] bottom-0 text-4xl opacity-90"><Ico n="🚀" size="1em" /></span>
        </div>

        {/* butterflies */}
        <span className="absolute left-[44%] top-[62%] text-3xl hero-flutter hidden sm:block" style={vars({ "--d": "9s" })}>
          <Ico n="🦋" size="1em" />
        </span>
        <span
          className="absolute left-[52%] top-[30%] text-2xl hero-flutter hidden md:block"
          style={vars({ "--d": "11s", "--delay": "-4s" })}
        >
          <Ico n="🦋" size="1em" />
        </span>

        {/* rolling hills */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 md:h-36"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path d="M0 105 Q 220 30 470 88 T 930 66 T 1200 98 V160 H0Z" fill="#7c3aed" opacity="0.55" />
          <path d="M0 140 Q 300 82 620 126 T 1200 112 V160 H0Z" fill="#5b21b6" />
        </svg>

        {/* galloping horse along the hill (runs right to left) */}
        <div className="absolute left-0 bottom-[6%] w-full hero-gallop" style={vars({ "--d": "24s", "--delay": "-8s" })}>
          <div className="absolute left-0 bottom-0 hero-hop text-5xl md:text-6xl"><Ico n="🐰" size="1em" /></div>
        </div>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
