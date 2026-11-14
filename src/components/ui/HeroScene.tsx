import React from "react";

/**
 * Purely decorative, CSS-animated night-sky behind the home banner:
 * twinkling stars, a sleepy swinging moon, drifting clouds, a flying unicorn,
 * a rocket, rising balloons and a shooting star. No JS, transforms only.
 */

const STARS = [
  { x: 4, y: 12, s: 14, d: 0, c: "#fde047" },
  { x: 11, y: 70, s: 10, d: 1.2, c: "#ffffff" },
  { x: 17, y: 30, s: 8, d: 2.1, c: "#fbcfe8" },
  { x: 24, y: 88, s: 16, d: 0.6, c: "#fde047" },
  { x: 31, y: 8, s: 10, d: 1.8, c: "#ffffff" },
  { x: 38, y: 52, s: 8, d: 2.6, c: "#a5f3fc" },
  { x: 45, y: 18, s: 18, d: 0.3, c: "#fde047" },
  { x: 52, y: 80, s: 9, d: 1.5, c: "#ffffff" },
  { x: 58, y: 40, s: 8, d: 2.9, c: "#fbcfe8" },
  { x: 64, y: 10, s: 12, d: 0.9, c: "#ffffff" },
  { x: 70, y: 62, s: 16, d: 2.3, c: "#fde047" },
  { x: 76, y: 24, s: 9, d: 1.1, c: "#a5f3fc" },
  { x: 82, y: 86, s: 11, d: 0.4, c: "#ffffff" },
  { x: 88, y: 14, s: 15, d: 1.9, c: "#fde047" },
  { x: 93, y: 50, s: 9, d: 2.7, c: "#fbcfe8" },
  { x: 97, y: 76, s: 12, d: 0.7, c: "#ffffff" },
  { x: 8, y: 48, s: 7, d: 1.4, c: "#ffffff" },
  { x: 49, y: 94, s: 8, d: 2.0, c: "#fde047" },
  { x: 67, y: 90, s: 7, d: 0.2, c: "#a5f3fc" },
  { x: 35, y: 34, s: 7, d: 3.1, c: "#ffffff" },
];

function Star({ s, c }: { s: number; c: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />
    </svg>
  );
}

function Cloud({ w }: { w: number }) {
  return (
    <svg width={w} height={w / 2} viewBox="0 0 120 60" aria-hidden>
      <g fill="#ffffff" opacity="0.9">
        <circle cx="30" cy="38" r="18" />
        <circle cx="55" cy="28" r="24" />
        <circle cx="82" cy="36" r="20" />
        <rect x="25" y="38" width="70" height="20" rx="10" />
      </g>
    </svg>
  );
}

export default function HeroScene() {
  return (
    <div
      aria-hidden
      className="hero-scene pointer-events-none absolute inset-0 overflow-hidden"
      style={{ containerType: "inline-size" }}
    >
      {/* sky */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4c1fb8] via-[#6a3fe0] to-[#3a3fd0]" />
      <div className="absolute -right-24 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-fuchsia-400/30 blur-3xl" />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      {/* twinkling stars */}
      {STARS.map((st, i) => (
        <span
          key={i}
          className="absolute animate-twinkle"
          style={{ left: `${st.x}%`, top: `${st.y}%`, animationDelay: `${st.d}s`, animationDuration: `${2.6 + (i % 4) * 0.7}s` }}
        >
          <Star s={st.s} c={st.c} />
        </span>
      ))}

      {/* sleepy hanging moon */}
      <div className="absolute right-[34%] top-0 origin-top animate-swing sm:right-[38%]">
        <div className="mx-auto h-8 w-px bg-white/50 sm:h-12" />
        <div className="relative -mt-0.5">
          <svg viewBox="0 0 100 100" className="h-20 w-20 drop-shadow-[0_0_18px_rgba(253,230,138,0.8)] sm:h-28 sm:w-28">
            <path d="M74 18 A40 40 0 1 0 74 82 A34 34 0 0 1 74 18 Z" fill="#fde68a" />
            <path d="M28 46 q5 5 10 0" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="26" cy="58" r="4.5" fill="#fb923c" opacity="0.55" />
            <path d="M30 63 q4 4 8 0" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
          <span className="absolute -right-2 top-2 animate-bob text-sm font-black text-white/80 sm:text-lg">z</span>
          <span className="absolute -right-6 -top-1 animate-bob text-xs font-black text-white/60 sm:text-sm" style={{ animationDelay: "0.6s" }}>
            z
          </span>
        </div>
      </div>

      {/* clouds */}
      <div className="absolute left-0 top-[10%] animate-drift opacity-80" style={{ animationDuration: "46s", animationDelay: "-12s" }}>
        <Cloud w={120} />
      </div>
      <div className="absolute left-0 top-[48%] animate-drift opacity-60" style={{ animationDuration: "62s", animationDelay: "-40s" }}>
        <Cloud w={170} />
      </div>
      <div className="absolute left-0 top-[76%] animate-drift opacity-70" style={{ animationDuration: "54s", animationDelay: "-25s" }}>
        <Cloud w={100} />
      </div>

      {/* flying unicorn */}
      <div className="absolute left-0 top-[62%] animate-drift-rev" style={{ animationDuration: "30s", animationDelay: "-8s" }}>
        <span className="block animate-bob text-4xl drop-shadow-lg sm:text-5xl">🦄</span>
      </div>

      {/* rocket */}
      <div className="absolute bottom-2 left-0 animate-rocket" style={{ animationDuration: "24s", animationDelay: "-4s" }}>
        <span className="block text-3xl drop-shadow-lg sm:text-4xl">🚀</span>
      </div>

      {/* rising balloons */}
      {[
        { x: 6, d: 0, t: 17 },
        { x: 20, d: 6, t: 21 },
        { x: 91, d: 3, t: 19 },
      ].map((b, i) => (
        <span
          key={i}
          className="absolute -bottom-12 animate-rise text-3xl sm:text-4xl"
          style={{ left: `${b.x}%`, animationDuration: `${b.t}s`, animationDelay: `${b.d}s` }}
        >
          🎈
        </span>
      ))}

      {/* shooting star */}
      <div
        className="absolute right-[18%] top-[8%] h-[3px] w-28 animate-shoot rounded-full bg-gradient-to-r from-transparent to-white"
        style={{ animationDuration: "9s", animationDelay: "2s" }}
      />
    </div>
  );
}
