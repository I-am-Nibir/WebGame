"use client";

import React, { useId } from "react";

/**
 * Cartoon-clay icon set (outlined, glossy, soft-shaded) used instead of emoji everywhere.
 * <Ico n="⭐" /> accepts either an icon name or the original emoji.
 */

// ---------- colour helpers ----------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a: number[]) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const lt = (c: string, a = 0.45) => toHex(hex(c).map((v) => v + (255 - v) * a));
const lum = (c: string) => { const [r, g, b] = hex(c); return 0.3 * r + 0.59 * g + 0.11 * b; };
const dk = (c: string, a = 0.3) => toHex(hex(c).map((v) => v * (1 - a)));

interface Kit {
  f: (c: string) => string; // shaded fill
  o: (c: string) => string; // outline colour
  defs: React.ReactNode[];
}
function kit(uid: string): Kit {
  const defs: React.ReactNode[] = [];
  let n = 0;
  return {
    defs,
    o: (c) => dk(c, 0.5),
    f: (c) => {
      const id = `${uid}g${n++}`;
      defs.push(
        <radialGradient key={id} id={id} cx=".35" cy=".28" r=".9">
          <stop offset="0" stopColor={lt(c, 0.5)} />
          <stop offset=".5" stopColor={c} />
          <stop offset="1" stopColor={dk(c, lum(c) > 215 ? 0.1 : 0.28)} />
        </radialGradient>
      );
      return `url(#${id})`;
    },
  };
}

const W = 2.2; // outline width
const starPath = (cx: number, cy: number, R: number, r: number, n = 5, rot = -Math.PI / 2) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = rot + (i * Math.PI) / n;
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
};

type Draw = (k: Kit) => React.ReactNode;

const Gloss = ({ x, y, rx = 5, ry = 3, rot = -30 }: { x: number; y: number; rx?: number; ry?: number; rot?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" opacity=".6" transform={`rotate(${rot} ${x} ${y})`} />
);
const Eye = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill="#2a1a2e" />
    <circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.38} fill="#fff" />
  </g>
);
const Cheeks = ({ y, dx = 13, r = 3 }: { y: number; dx?: number; r?: number }) => (
  <>
    <ellipse cx={32 - dx} cy={y} rx={r} ry={r * 0.7} fill="#fb7185" opacity=".55" />
    <ellipse cx={32 + dx} cy={y} rx={r} ry={r * 0.7} fill="#fb7185" opacity=".55" />
  </>
);
const Smile = ({ y, w = 5 }: { y: number; w?: number }) => (
  <path d={`M${32 - w} ${y} Q32 ${y + w * 1.1} ${32 + w} ${y}`} stroke="#2a1a2e" strokeWidth="1.9" fill="none" strokeLinecap="round" />
);

// animal "face" helper: head ellipse drawn by caller
const animal = (k: Kit, p: { head: string; ear?: React.ReactNode; back?: React.ReactNode; deco?: React.ReactNode; hy?: number; rx?: number; ry?: number; nose?: string }) => {
  const hy = p.hy ?? 38;
  return (
    <>
      {p.back}
      {p.ear}
      <ellipse cx="32" cy={hy} rx={p.rx ?? 22} ry={p.ry ?? 19} fill={k.f(p.head)} stroke={k.o(p.head)} strokeWidth={W} />
      {p.deco}
      <Eye x={24} y={hy - 2} />
      <Eye x={40} y={hy - 2} />
      <ellipse cx="32" cy={hy + 4} rx="2.8" ry="2" fill={p.nose ?? "#be185d"} />
      <Smile y={hy + 7} w={4.5} />
      <Gloss x={20} y={hy - 12} />
    </>
  );
};

const fruitGloss = <Gloss x={22} y={24} rx={4.5} ry={2.6} />;

const DRAW: Record<string, Draw> = {
  star: (k) => (
    <>
      <path d={starPath(32, 34, 27, 12)} fill={k.f("#fbbf24")} stroke={k.o("#fbbf24")} strokeWidth={W} strokeLinejoin="round" />
      <Gloss x={25} y={24} rx={4} ry={2.4} />
      <Eye x={27} y={36} r={2} />
      <Eye x={37} y={36} r={2} />
      <path d="M29 41 Q32 44 35 41" stroke="#2a1a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  sparkle: (k) => (
    <>
      <path d="M30 6 Q33 28 54 31 Q33 34 30 56 Q27 34 6 31 Q27 28 30 6Z" fill={k.f("#fde047")} stroke={k.o("#fde047")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M50 8 Q51 14 56 15 Q51 16 50 22 Q49 16 44 15 Q49 14 50 8Z" fill={k.f("#f9a8d4")} stroke={k.o("#f9a8d4")} strokeWidth="1.5" strokeLinejoin="round" />
    </>
  ),
  heart: (k) => (
    <>
      <path d="M32 56 C8 40 4 24 11 16 C18 8 29 11 32 20 C35 11 46 8 53 16 C60 24 56 40 32 56Z" fill={k.f("#fb4f78")} stroke={k.o("#fb4f78")} strokeWidth={W} strokeLinejoin="round" />
      <Gloss x={19} y={22} rx={5} ry={3} rot={-40} />
    </>
  ),
  rocket: (k) => (
    <g transform="rotate(40 32 32)">
      <path d="M20 40 L10 52 L24 48Z M44 40 L54 52 L40 48Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M26 50 Q32 66 38 50Z" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 3 C46 14 47 34 43 48 L21 48 C17 34 18 14 32 3Z" fill={k.f("#f8fafc")} stroke={k.o("#94a3b8")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 3 C38 8 42 13 43 19 L21 19 C22 13 26 8 32 3Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="32" cy="30" r="6.5" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth={W} />
      <Gloss x={30} y={28} rx={2} ry={1.2} />
    </g>
  ),
  gamepad: (k) => (
    <>
      <path d="M14 20 H50 Q60 20 60 32 L58 48 Q57 54 51 52 L44 44 H20 L13 52 Q7 54 6 48 L4 32 Q4 20 14 20Z" fill={k.f("#8b5cf6")} stroke={k.o("#8b5cf6")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M17 26 H21 V30 H25 V34 H21 V38 H17 V34 H13 V30 H17Z" fill="#fff" />
      <circle cx="43" cy="28" r="3.4" fill={k.f("#fde047")} stroke={k.o("#fde047")} strokeWidth="1.5" />
      <circle cx="50" cy="34" r="3.4" fill={k.f("#fb7185")} stroke={k.o("#fb7185")} strokeWidth="1.5" />
      <circle cx="43" cy="39" r="3.4" fill={k.f("#34d399")} stroke={k.o("#34d399")} strokeWidth="1.5" />
      <Gloss x={16} y={23} rx={5} ry={1.6} rot={0} />
    </>
  ),
  party: (k) => (
    <>
      <path d="M6 58 L22 22 L42 42Z" fill={k.f("#fbbf24")} stroke={k.o("#fbbf24")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M14 42 L28 36 M10 52 L34 44" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 14 Q42 6 46 14 T56 12" stroke="#ec4899" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M46 28 Q54 22 58 30" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="8" r="3" fill="#a78bfa" />
      <circle cx="54" cy="44" r="3" fill="#34d399" />
      <rect x="44" y="4" width="5" height="5" rx="1" fill="#fb923c" transform="rotate(20 46 6)" />
      <rect x="52" y="20" width="5" height="5" rx="1" fill="#fde047" transform="rotate(-20 54 22)" />
    </>
  ),
  balloon: (k) => (
    <>
      <path d="M32 46 Q26 54 33 58 Q38 62 32 63" stroke="#94a3b8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M32 44 L27 51 H37Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M32 3 C48 3 53 17 49 28 C46 37 38 44 32 45 C26 44 18 37 15 28 C11 17 16 3 32 3Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      <Gloss x={23} y={16} rx={4} ry={7} rot={25} />
    </>
  ),
  sun: (k) => (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="29.5" y="2" width="5" height="10" rx="2.5" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth="1.5" transform={`rotate(${i * 45} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="16" fill={k.f("#fbbf24")} stroke={k.o("#fbbf24")} strokeWidth={W} />
      <Eye x={26} y={30} r={2.4} />
      <Eye x={38} y={30} r={2.4} />
      <Cheeks y={36} dx={11} r={3} />
      <Smile y={36} w={4} />
      <Gloss x={25} y={22} rx={4} ry={2.4} />
    </>
  ),
  moon: (k) => (
    <>
      <path d="M40 6 A26 26 0 1 0 58 44 A21 21 0 0 1 40 6Z" fill={k.f("#fde68a")} stroke={k.o("#f59e0b")} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="22" cy="40" r="3.2" fill="#fcd34d" opacity=".8" />
      <circle cx="30" cy="26" r="2.2" fill="#fcd34d" opacity=".8" />
      <Eye x={23} y={32} r={2} />
      <path d="M21 42 Q26 46 31 43" stroke="#2a1a2e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Gloss x={20} y={22} rx={4} ry={2} rot={-50} />
    </>
  ),
  unicorn: (k) => (
    <>
      <path d="M32 2 L37 22 H27Z" fill={k.f("#fde047")} stroke={k.o("#f59e0b")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M29.5 12 L34.5 14 M28.5 17 L35.5 19" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M17 26 L14 12 L26 21Z M47 26 L50 12 L38 21Z" fill={k.f("#fff")} stroke={k.o("#cbd5e1")} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="13" cy="34" r="8" fill={k.f("#f472b6")} stroke={k.o("#f472b6")} strokeWidth={W} />
      <circle cx="15" cy="46" r="7" fill={k.f("#a78bfa")} stroke={k.o("#a78bfa")} strokeWidth={W} />
      <circle cx="51" cy="34" r="8" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth={W} />
      <ellipse cx="32" cy="38" rx="20" ry="19" fill={k.f("#fdf4ff")} stroke={k.o("#d8b4fe")} strokeWidth={W} />
      <Eye x={24} y={36} />
      <Eye x={40} y={36} />
      <Cheeks y={43} dx={14} r={3.2} />
      <ellipse cx="29.5" cy="46" rx="1.2" ry="1.6" fill="#be185d" />
      <ellipse cx="34.5" cy="46" rx="1.2" ry="1.6" fill="#be185d" />
      <Smile y={50} w={4} />
    </>
  ),
  pointer: (k) => (
    <>
      <path d="M26 6 Q32 4 33 10 V30 L44 28 Q52 28 52 36 V50 Q52 60 42 60 H30 Q22 60 16 52 L9 42 Q7 38 11 36 Q15 35 19 40 L21 42 V10 Q22 6 26 6Z" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M33 30 V34 M40 31 V36" stroke={k.o("#f4b88f")} strokeWidth="1.8" strokeLinecap="round" />
      <Gloss x={25} y={14} rx={1.8} ry={4} rot={0} />
    </>
  ),
  lion: (k) => animal(k, {
    head: "#fcd34d",
    back: <circle cx="32" cy="36" r="29" fill={k.f("#f59e0b")} stroke={k.o("#f59e0b")} strokeWidth={W} />,
    ear: <><circle cx="14" cy="14" r="6" fill={k.f("#fcd34d")} stroke={k.o("#f59e0b")} strokeWidth={W} /><circle cx="50" cy="14" r="6" fill={k.f("#fcd34d")} stroke={k.o("#f59e0b")} strokeWidth={W} /></>,
    deco: <ellipse cx="32" cy="46" rx="9" ry="6" fill="#fff7e0" opacity=".9" />,
    rx: 19, ry: 17, hy: 38, nose: "#7c2d12",
  }),
  rabbit: (k) => animal(k, {
    head: "#f9a8d4",
    ear: <>
      <ellipse cx="22" cy="16" rx="7" ry="15" fill={k.f("#f9a8d4")} stroke={k.o("#f9a8d4")} strokeWidth={W} />
      <ellipse cx="42" cy="16" rx="7" ry="15" fill={k.f("#f9a8d4")} stroke={k.o("#f9a8d4")} strokeWidth={W} />
      <ellipse cx="22" cy="17" rx="3.2" ry="10" fill="#fff1f7" />
      <ellipse cx="42" cy="17" rx="3.2" ry="10" fill="#fff1f7" />
    </>,
    deco: <Cheeks y={41} dx={15} r={3.6} />, hy: 40, rx: 22, ry: 18,
  }),
  teddy: (k) => animal(k, {
    head: "#c08457",
    ear: <><circle cx="15" cy="20" r="9" fill={k.f("#c08457")} stroke={k.o("#c08457")} strokeWidth={W} /><circle cx="49" cy="20" r="9" fill={k.f("#c08457")} stroke={k.o("#c08457")} strokeWidth={W} /><circle cx="15" cy="20" r="4.5" fill="#f1c9a5" /><circle cx="49" cy="20" r="4.5" fill="#f1c9a5" /></>,
    deco: <ellipse cx="32" cy="44" rx="10" ry="8" fill="#f1c9a5" />, nose: "#3b1d0e", hy: 38,
  }),
  cat: (k) => animal(k, {
    head: "#fdba74",
    ear: <><path d="M10 28 L12 6 L28 18Z" fill={k.f("#fdba74")} stroke={k.o("#fdba74")} strokeWidth={W} strokeLinejoin="round" /><path d="M54 28 L52 6 L36 18Z" fill={k.f("#fdba74")} stroke={k.o("#fdba74")} strokeWidth={W} strokeLinejoin="round" /><path d="M14 20 L15 12 L21 17Z M50 20 L49 12 L43 17Z" fill="#fda4af" /></>,
    deco: <><path d="M26 22 V27 M32 21 V26 M38 22 V27" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" /><path d="M6 40 H16 M6 45 L16 43 M58 40 H48 M58 45 L48 43" stroke="#9a3412" strokeWidth="1.3" strokeLinecap="round" /></>,
    nose: "#f43f5e",
  }),
  dog: (k) => animal(k, {
    head: "#e9c9a0",
    back: <><ellipse cx="11" cy="32" rx="8" ry="15" fill={k.f("#8b5a2b")} stroke={k.o("#8b5a2b")} strokeWidth={W} transform="rotate(12 11 32)" /><ellipse cx="53" cy="32" rx="8" ry="15" fill={k.f("#8b5a2b")} stroke={k.o("#8b5a2b")} strokeWidth={W} transform="rotate(-12 53 32)" /></>,
    deco: <><ellipse cx="32" cy="45" rx="10" ry="7.5" fill="#fff7ed" /><path d="M30 55 Q32 61 34 55Z" fill="#fb7185" stroke="#be123c" strokeWidth="1.2" /></>,
    nose: "#1c1917", hy: 38,
  }),
  panda: (k) => animal(k, {
    head: "#ffffff",
    ear: <><circle cx="14" cy="17" r="8" fill={k.f("#334155")} stroke="#0f172a" strokeWidth={W} /><circle cx="50" cy="17" r="8" fill={k.f("#334155")} stroke="#0f172a" strokeWidth={W} /></>,
    deco: <><ellipse cx="24" cy="36" rx="5.5" ry="7" fill="#334155" transform="rotate(20 24 36)" /><ellipse cx="40" cy="36" rx="5.5" ry="7" fill="#334155" transform="rotate(-20 40 36)" /></>,
    nose: "#1c1917", hy: 38, rx: 22, ry: 19,
  }),
  frog: (k) => (
    <>
      <ellipse cx="32" cy="42" rx="25" ry="17" fill={k.f("#4ade80")} stroke={k.o("#22c55e")} strokeWidth={W} />
      {[18, 46].map((x) => (
        <g key={x}>
          <circle cx={x} cy="22" r="10" fill={k.f("#4ade80")} stroke={k.o("#22c55e")} strokeWidth={W} />
          <circle cx={x} cy="22" r="6.5" fill="#fff" />
          <circle cx={x + 1} cy="23" r="3.4" fill="#2a1a2e" />
          <circle cx={x + 2} cy="21.5" r="1.1" fill="#fff" />
        </g>
      ))}
      <path d="M14 44 Q32 58 50 44" stroke="#14532d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="28" cy="38" r="1.1" fill="#14532d" />
      <circle cx="36" cy="38" r="1.1" fill="#14532d" />
      <ellipse cx="14" cy="46" rx="3.5" ry="2.5" fill="#fb7185" opacity=".5" />
      <ellipse cx="50" cy="46" rx="3.5" ry="2.5" fill="#fb7185" opacity=".5" />
    </>
  ),
  tiger: (k) => animal(k, {
    head: "#fb923c",
    ear: <><circle cx="14" cy="17" r="8" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth={W} /><circle cx="50" cy="17" r="8" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth={W} /><circle cx="14" cy="17" r="3.5" fill="#fff7ed" /><circle cx="50" cy="17" r="3.5" fill="#fff7ed" /></>,
    deco: <><path d="M32 20 V28 M25 22 L27 28 M39 22 L37 28 M11 36 H17 M12 43 L18 41 M53 36 H47 M52 43 L46 41" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round" /><ellipse cx="32" cy="46" rx="10" ry="7" fill="#fff7ed" /></>,
    nose: "#7c2d12",
  }),
  octopus: (k) => (
    <>
      {[10, 21, 32, 43, 54].map((x, i) => (
        <path key={x} d={`M${x} 40 Q${x + (i % 2 ? 6 : -6)} 52 ${x} 58`} stroke={k.o("#a855f7")} strokeWidth="9" fill="none" strokeLinecap="round" />
      ))}
      {[10, 21, 32, 43, 54].map((x, i) => (
        <path key={x} d={`M${x} 40 Q${x + (i % 2 ? 6 : -6)} 52 ${x} 58`} stroke="#c084fc" strokeWidth="6" fill="none" strokeLinecap="round" />
      ))}
      <path d="M8 40 C6 16 18 5 32 5 C46 5 58 16 56 40Z" fill={k.f("#c084fc")} stroke={k.o("#a855f7")} strokeWidth={W} strokeLinejoin="round" />
      <Eye x={24} y={30} r={3.4} />
      <Eye x={40} y={30} r={3.4} />
      <Cheeks y={37} dx={17} r={3.4} />
      <Smile y={36} w={4.5} />
      <Gloss x={20} y={15} rx={5} ry={2.6} />
    </>
  ),
  hamster: (k) => animal(k, {
    head: "#fcd9a8",
    ear: <><circle cx="15" cy="20" r="7" fill={k.f("#e7a96b")} stroke={k.o("#e7a96b")} strokeWidth={W} /><circle cx="49" cy="20" r="7" fill={k.f("#e7a96b")} stroke={k.o("#e7a96b")} strokeWidth={W} /></>,
    deco: <><path d="M26 22 Q32 14 38 22" fill="#e7a96b" /><ellipse cx="32" cy="45" rx="9" ry="7" fill="#fff7ed" /><rect x="30" y="50" width="4" height="4.5" rx="1" fill="#fff" stroke="#9a3412" strokeWidth="1" /></>,
    hy: 39, rx: 24, ry: 19, nose: "#f43f5e",
  }),
  butterfly: (k) => (
    <>
      <ellipse cx="18" cy="24" rx="14" ry="16" fill={k.f("#f472b6")} stroke={k.o("#f472b6")} strokeWidth={W} transform="rotate(-20 18 24)" />
      <ellipse cx="46" cy="24" rx="14" ry="16" fill={k.f("#f472b6")} stroke={k.o("#f472b6")} strokeWidth={W} transform="rotate(20 46 24)" />
      <ellipse cx="21" cy="44" rx="10" ry="11" fill={k.f("#a78bfa")} stroke={k.o("#a78bfa")} strokeWidth={W} transform="rotate(20 21 44)" />
      <ellipse cx="43" cy="44" rx="10" ry="11" fill={k.f("#a78bfa")} stroke={k.o("#a78bfa")} strokeWidth={W} transform="rotate(-20 43 44)" />
      <circle cx="16" cy="22" r="4.5" fill="#fff" opacity=".7" />
      <circle cx="48" cy="22" r="4.5" fill="#fff" opacity=".7" />
      <rect x="28.5" y="14" width="7" height="38" rx="3.5" fill={k.f("#6d28d9")} stroke={k.o("#6d28d9")} strokeWidth="1.8" />
      <path d="M30 14 Q26 5 20 4 M34 14 Q38 5 44 4" stroke="#4c1d95" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  robot: (k) => (
    <>
      <path d="M32 4 V13" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="5" r="3.6" fill={k.f("#fb7185")} stroke={k.o("#fb7185")} strokeWidth="1.8" />
      <rect x="6" y="28" width="6" height="12" rx="3" fill={k.f("#94a3b8")} stroke={k.o("#94a3b8")} strokeWidth="1.8" />
      <rect x="52" y="28" width="6" height="12" rx="3" fill={k.f("#94a3b8")} stroke={k.o("#94a3b8")} strokeWidth="1.8" />
      <rect x="10" y="13" width="44" height="40" rx="12" fill={k.f("#7dd3fc")} stroke={k.o("#38bdf8")} strokeWidth={W} />
      <rect x="15" y="20" width="34" height="19" rx="8" fill="#1e293b" />
      <circle cx="25" cy="29" r="4.2" fill="#67e8f9" />
      <circle cx="39" cy="29" r="4.2" fill="#67e8f9" />
      <circle cx="26.2" cy="27.8" r="1.4" fill="#fff" />
      <circle cx="40.2" cy="27.8" r="1.4" fill="#fff" />
      <path d="M22 45 H42" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3" />
      <Gloss x={18} y={17} rx={5} ry={1.8} rot={0} />
    </>
  ),
  horse: (k) => (
    <>
      <path d="M20 6 L16 22 L28 16Z M44 6 L48 22 L36 16Z" fill={k.f("#a16207")} stroke={k.o("#a16207")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 6 C20 6 14 18 16 34 C14 46 18 58 32 58 C46 58 50 46 48 34 C50 18 44 6 32 6Z" fill={k.f("#c48a4a")} stroke={k.o("#a16207")} strokeWidth={W} />
      <path d="M32 6 C26 4 22 10 24 18 C28 14 34 14 40 18 C42 10 38 4 32 6Z" fill={k.f("#5b3a1a")} stroke={k.o("#5b3a1a")} strokeWidth={W} />
      <ellipse cx="32" cy="48" rx="12" ry="9" fill={k.f("#e9c08b")} stroke={k.o("#a16207")} strokeWidth="1.8" />
      <ellipse cx="28" cy="48" rx="1.6" ry="2.4" fill="#5b3a1a" />
      <ellipse cx="36" cy="48" rx="1.6" ry="2.4" fill="#5b3a1a" />
      <Eye x={24} y={32} />
      <Eye x={40} y={32} />
    </>
  ),
  watermelon: (k) => (
    <>
      <path d="M6 28 A26 26 0 0 0 58 28Z" fill={k.f("#22c55e")} stroke={k.o("#16a34a")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M10 28 A22 22 0 0 0 54 28Z" fill="#dcfce7" />
      <path d="M13 28 A19 19 0 0 0 51 28Z" fill={k.f("#fb4f6b")} />
      {[[22, 35], [32, 40], [42, 35], [27, 31], [37, 31]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.8" ry="2.8" fill="#2a1a2e" transform={`rotate(${i % 2 ? 20 : -20} ${x} ${y})`} />
      ))}
      <path d="M6 28 H58" stroke={k.o("#16a34a")} strokeWidth={W} strokeLinecap="round" />
      <Gloss x={20} y={31} rx={4} ry={1.4} rot={20} />
    </>
  ),
  strawberry: (k) => (
    <>
      <path d="M32 58 C10 46 8 26 14 22 C20 18 26 22 32 22 C38 22 44 18 50 22 C56 26 54 46 32 58Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      {[[22, 32], [32, 30], [42, 32], [26, 42], [38, 42], [32, 50]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.5" ry="2.3" fill="#fde68a" />
      ))}
      <path d="M32 22 L22 14 L28 20 L24 8 L32 18 L40 8 L36 20 L42 14Z" fill={k.f("#22c55e")} stroke={k.o("#22c55e")} strokeWidth="1.8" strokeLinejoin="round" />
      <Gloss x={19} y={29} rx={3} ry={5} rot={20} />
    </>
  ),
  apple: (k) => (
    <>
      <path d="M32 18 C20 10 6 18 8 34 C10 50 22 60 32 54 C42 60 54 50 56 34 C58 18 44 10 32 18Z" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 18 Q32 10 36 5" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M36 10 Q46 2 52 8 Q44 16 36 10Z" fill={k.f("#22c55e")} stroke={k.o("#22c55e")} strokeWidth="1.8" strokeLinejoin="round" />
      <Gloss x={18} y={28} rx={3} ry={6} rot={20} />
    </>
  ),
  donut: (k) => (
    <>
      <path fillRule="evenodd" d="M32 6 A26 26 0 1 1 31.9 6Z M32 24 A8 8 0 1 0 32.1 24Z" fill={k.f("#e9a85a")} stroke={k.o("#e9a85a")} strokeWidth={W} />
      <path fillRule="evenodd" d="M32 10 C40 8 46 12 50 18 C58 24 56 36 50 44 C44 54 30 56 20 50 C10 44 8 28 14 20 C18 12 24 11 32 10Z M32 25 A7 7 0 1 0 32.1 25Z" fill={k.f("#f472b6")} stroke={k.o("#f472b6")} strokeWidth="1.8" />
      {[[22, 20, 20], [40, 18, -30], [48, 32, 60], [44, 44, 10], [22, 42, -50], [15, 31, 40]].map(([x, y, r], i) => (
        <rect key={i} x={x - 3} y={y - 1} width="6" height="2.6" rx="1.3" fill={["#fde047", "#38bdf8", "#fff", "#a3e635", "#fb923c", "#fff"][i]} transform={`rotate(${r} ${x} ${y})`} />
      ))}
    </>
  ),
  cupcake: (k) => (
    <>
      <path d="M12 32 L18 58 H46 L52 32Z" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M24 34 L26 56 M32 34 V56 M40 34 L38 56" stroke={k.o("#38bdf8")} strokeWidth="1.6" opacity=".6" />
      <path d="M8 34 C4 24 14 20 18 22 C16 12 26 10 32 12 C38 8 48 14 46 22 C54 22 58 30 54 34Z" fill={k.f("#f9a8d4")} stroke={k.o("#f9a8d4")} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="32" cy="9" r="5" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth="1.8" />
      <path d="M32 5 Q34 0 38 1" stroke="#16a34a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Gloss x={20} y={22} rx={4} ry={1.8} rot={-10} />
    </>
  ),
  lemon: (k) => (
    <>
      <path d="M6 32 Q10 24 16 20 C26 10 42 12 50 22 Q56 24 58 30 Q54 38 50 42 C40 54 24 52 16 44 Q8 40 6 32Z" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M44 14 Q52 8 58 12 Q52 20 44 14Z" fill={k.f("#22c55e")} stroke={k.o("#22c55e")} strokeWidth="1.8" strokeLinejoin="round" />
      <Gloss x={24} y={24} rx={5} ry={2.4} rot={-25} />
    </>
  ),
  orange: (k) => (
    <>
      <circle cx="32" cy="36" r="24" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth={W} />
      <path d="M32 14 Q34 8 38 6" stroke="#78350f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M34 12 Q44 4 52 10 Q44 18 34 12Z" fill={k.f("#22c55e")} stroke={k.o("#22c55e")} strokeWidth="1.8" strokeLinejoin="round" />
      <Gloss x={21} y={26} rx={4.5} ry={2.6} />
    </>
  ),
  grapes: (k) => (
    <>
      {[[20, 24], [32, 22], [44, 24], [26, 35], [38, 35], [20, 45], [32, 46], [44, 45], [32, 56]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y - (i > 4 ? 0 : 0)} r="9" fill={k.f("#a855f7")} stroke={k.o("#a855f7")} strokeWidth="1.8" />
          <Gloss x={x - 3} y={y - 4} rx={2.4} ry={1.4} />
        </g>
      )).slice(0, 8)}
      <path d="M32 14 Q32 7 36 4" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M36 8 Q46 0 54 6 Q46 14 36 8Z" fill={k.f("#22c55e")} stroke={k.o("#22c55e")} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  candy: (k) => (
    <>
      <path d="M14 20 L4 12 V34Z" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} strokeLinejoin="round" transform="translate(0 6)" />
      <path d="M50 44 L60 52 V30Z" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} strokeLinejoin="round" transform="translate(0 -6) rotate(0)" />
      <circle cx="32" cy="32" r="19" fill={k.f("#ec4899")} stroke={k.o("#ec4899")} strokeWidth={W} />
      <path d="M32 13 A19 19 0 0 1 32 51 A10 19 0 0 0 32 13Z" fill="#fff" opacity=".45" />
      <circle cx="32" cy="32" r="8" fill="none" stroke="#fff" strokeWidth="3" opacity=".7" />
      <Gloss x={22} y={22} rx={4} ry={2.4} />
    </>
  ),
  rainbow: (k) => (
    <>
      {["#ef4444", "#fb923c", "#fde047", "#4ade80", "#38bdf8", "#a78bfa"].map((c, i) => (
        <path key={c} d={`M${4 + i * 3.4} 50 A${28 - i * 3.4} ${28 - i * 3.4} 0 0 1 ${60 - i * 3.4} 50`} stroke={c} strokeWidth="3.8" fill="none" />
      ))}
      <path d="M2 50 A30 30 0 0 1 62 50" stroke={k.o("#ef4444")} strokeWidth="1" fill="none" opacity=".5" />
      <path d="M2 54 C0 46 10 42 14 46 C16 40 26 40 28 48 C30 54 20 58 12 56 C8 58 4 58 2 54Z" fill={k.f("#fff")} stroke={k.o("#94a3b8")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M36 54 C34 46 44 42 48 46 C50 40 60 40 62 48 C64 54 54 58 46 56 C42 58 38 58 36 54Z" fill={k.f("#fff")} stroke={k.o("#94a3b8")} strokeWidth={W} strokeLinejoin="round" />
    </>
  ),
  blossom: (k) => (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="32" cy="15" rx="9" ry="12" fill={k.f("#f9a8d4")} stroke={k.o("#f472b6")} strokeWidth="1.8" transform={`rotate(${i * 72} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="8" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth="1.8" />
      <Gloss x={29} y={29} rx={2.4} ry={1.4} />
    </>
  ),
  lock: (k) => (
    <>
      <path d="M20 28 V20 A12 12 0 0 1 44 20 V28" stroke={k.o("#94a3b8")} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M20 28 V20 A12 12 0 0 1 44 20 V28" stroke="#cbd5e1" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <rect x="9" y="26" width="46" height="32" rx="9" fill={k.f("#fbbf24")} stroke={k.o("#fbbf24")} strokeWidth={W} />
      <circle cx="32" cy="40" r="4.5" fill="#78350f" />
      <rect x="30" y="42" width="4" height="8" rx="2" fill="#78350f" />
      <Gloss x={18} y={31} rx={5} ry={1.8} rot={0} />
    </>
  ),
  notes: (k) => (
    <>
      <path d="M24 46 V14 L52 8 V40" stroke={k.o("#8b5cf6")} strokeWidth="4.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M24 46 V14 L52 8 V40" stroke="#a78bfa" strokeWidth="2.4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M24 20 L52 14" stroke="#8b5cf6" strokeWidth="5" />
      <ellipse cx="17" cy="47" rx="9" ry="7" fill={k.f("#8b5cf6")} stroke={k.o("#8b5cf6")} strokeWidth={W} transform="rotate(-20 17 47)" />
      <ellipse cx="45" cy="41" rx="9" ry="7" fill={k.f("#ec4899")} stroke={k.o("#ec4899")} strokeWidth={W} transform="rotate(-20 45 41)" />
    </>
  ),
  crystal: (k) => (
    <>
      <path d="M14 58 Q32 48 50 58 L46 62 H18Z" fill={k.f("#7c3aed")} stroke={k.o("#7c3aed")} strokeWidth={W} strokeLinejoin="round" />
      <circle cx="32" cy="30" r="24" fill={k.f("#c084fc")} stroke={k.o("#9333ea")} strokeWidth={W} />
      <path d={starPath(32, 31, 9, 4)} fill="#fde047" />
      <circle cx="20" cy="40" r="1.8" fill="#fff" opacity=".8" />
      <circle cx="43" cy="22" r="1.6" fill="#fff" opacity=".8" />
      <Gloss x={22} y={17} rx={6} ry={3} rot={-35} />
    </>
  ),
  bulb: (k) => (
    <>
      {[-60, -30, 0, 30, 60].map((r) => (
        <rect key={r} x="30.5" y="1" width="3" height="7" rx="1.5" fill="#fbbf24" transform={`rotate(${r} 32 26)`} />
      ))}
      <path d="M32 8 C46 8 54 20 50 32 C48 38 42 40 42 46 H22 C22 40 16 38 14 32 C10 20 18 8 32 8Z" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} strokeLinejoin="round" />
      <rect x="22" y="46" width="20" height="6" rx="3" fill={k.f("#94a3b8")} stroke={k.o("#94a3b8")} strokeWidth="1.8" />
      <rect x="25" y="52" width="14" height="6" rx="3" fill={k.f("#64748b")} stroke={k.o("#64748b")} strokeWidth="1.8" />
      <path d="M28 40 L30 30 L34 36 L36 28" stroke="#f59e0b" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Gloss x={22} y={20} rx={3} ry={5.5} rot={25} />
    </>
  ),
  numbers: (k) => (
    <>
      <rect x="6" y="10" width="52" height="46" rx="12" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth={W} />
      <text x="32" y="43" textAnchor="middle" fontSize="25" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#fff" stroke="#0369a1" strokeWidth="1.2" paintOrder="stroke">123</text>
      <Gloss x={17} y={17} rx={6} ry={1.8} rot={0} />
    </>
  ),
  palette: (k) => (
    <>
      <path d="M32 6 C14 6 4 20 6 34 C8 48 22 58 36 58 C44 58 44 50 40 46 C36 42 40 36 48 36 H54 C60 36 60 28 58 24 C54 12 44 6 32 6Z" fill={k.f("#e2b27a")} stroke={k.o("#c4863f")} strokeWidth={W} strokeLinejoin="round" />
      {[[18, 28, "#ef4444"], [28, 17, "#fde047"], [42, 18, "#4ade80"], [50, 28, "#38bdf8"], [20, 44, "#a855f7"]].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="5" fill={k.f(c as string)} stroke={k.o(c as string)} strokeWidth="1.6" />
      ))}
      <Gloss x={14} y={20} rx={4} ry={1.6} rot={-40} />
    </>
  ),
  brush: (k) => (
    <g transform="rotate(35 32 32)">
      <rect x="27" y="26" width="10" height="34" rx="5" fill={k.f("#f59e0b")} stroke={k.o("#f59e0b")} strokeWidth={W} />
      <rect x="26" y="20" width="12" height="9" rx="2" fill={k.f("#cbd5e1")} stroke={k.o("#94a3b8")} strokeWidth={W} />
      <path d="M26 20 C24 10 30 4 32 2 C34 4 40 10 38 20Z" fill={k.f("#ec4899")} stroke={k.o("#ec4899")} strokeWidth={W} strokeLinejoin="round" />
      <Gloss x={30} y={40} rx={1.6} ry={6} rot={0} />
    </g>
  ),
  hammer: (k) => (
    <g transform="rotate(-35 32 32)">
      <rect x="27" y="22" width="10" height="40" rx="5" fill={k.f("#d97706")} stroke={k.o("#d97706")} strokeWidth={W} />
      <rect x="10" y="6" width="44" height="22" rx="8" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} />
      <rect x="10" y="12" width="6" height="10" fill="#fde047" opacity=".9" />
      <rect x="48" y="12" width="6" height="10" fill="#fde047" opacity=".9" />
      <Gloss x={26} y={12} rx={9} ry={1.8} rot={0} />
    </g>
  ),
  sprout: (k) => (
    <>
      <ellipse cx="32" cy="56" rx="24" ry="6" fill={k.f("#a16207")} stroke={k.o("#a16207")} strokeWidth={W} />
      <path d="M32 56 Q31 40 32 28" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M32 34 C20 36 8 28 8 14 C22 12 32 22 32 34Z" fill={k.f("#4ade80")} stroke={k.o("#22c55e")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 28 C34 16 44 8 56 10 C56 24 46 32 32 28Z" fill={k.f("#22c55e")} stroke={k.o("#16a34a")} strokeWidth={W} strokeLinejoin="round" />
    </>
  ),
  piano: (k) => (
    <>
      <rect x="4" y="12" width="56" height="42" rx="9" fill={k.f("#f8fafc")} stroke={k.o("#94a3b8")} strokeWidth={W} />
      {[16, 28, 40, 52].map((x) => (
        <path key={x} d={`M${x - 0.0} 32 V54`} stroke="#94a3b8" strokeWidth="1.6" />
      ))}
      {[16, 28, 40].map((x) => (
        <rect key={x} x={x - 4} y="12" width="8" height="26" rx="3" fill={k.f("#334155")} stroke="#0f172a" strokeWidth="1.6" />
      ))}
      <rect x="4" y="12" width="56" height="7" rx="4" fill={k.f("#ef4444")} />
    </>
  ),
  swirl: (k) => (
    <>
      <path d="M32 32 C32 26 40 26 40 32 C40 42 24 42 24 30 C24 16 44 14 48 28 C52 44 38 54 24 52 C10 50 6 32 12 20" stroke={k.o("#8b5cf6")} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M32 32 C32 26 40 26 40 32 C40 42 24 42 24 30 C24 16 44 14 48 28 C52 44 38 54 24 52 C10 50 6 32 12 20" stroke="#c084fc" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M32 32 C32 26 40 26 40 32" stroke="#67e8f9" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  planet: (k) => (
    <>
      <path d="M6 44 C-2 34 18 24 40 22 C58 20 66 26 58 32" stroke={k.o("#f472b6")} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".0" />
      <circle cx="32" cy="32" r="18" fill={k.f("#fb923c")} stroke={k.o("#fb923c")} strokeWidth={W} />
      <path d="M16 28 Q32 34 48 26 M15 38 Q32 44 49 36" stroke="#fdba74" strokeWidth="3" fill="none" opacity=".8" />
      <ellipse cx="32" cy="34" rx="29" ry="8" fill="none" stroke={k.o("#f472b6")} strokeWidth="6.5" transform="rotate(-22 32 34)" />
      <ellipse cx="32" cy="34" rx="29" ry="8" fill="none" stroke="#f9a8d4" strokeWidth="3.5" transform="rotate(-22 32 34)" />
      <Gloss x={25} y={22} rx={4} ry={2.2} />
    </>
  ),
  reddot: (k) => (
    <>
      <circle cx="32" cy="32" r="24" fill={k.f("#ef4444")} stroke={k.o("#ef4444")} strokeWidth={W} />
      <Gloss x={23} y={22} rx={6} ry={3.4} />
    </>
  ),
  bluedot: (k) => (
    <>
      <circle cx="32" cy="32" r="24" fill={k.f("#3b82f6")} stroke={k.o("#3b82f6")} strokeWidth={W} />
      <Gloss x={23} y={22} rx={6} ry={3.4} />
    </>
  ),
  plus: (k) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="16" fill={k.f("#34d399")} stroke={k.o("#34d399")} strokeWidth={W} />
      <path d="M32 18 V46 M18 32 H46" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <Gloss x={17} y={14} rx={6} ry={1.8} rot={0} />
    </>
  ),
  minus: (k) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="16" fill={k.f("#fb7185")} stroke={k.o("#fb7185")} strokeWidth={W} />
      <path d="M18 32 H46" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <Gloss x={17} y={14} rx={6} ry={1.8} rot={0} />
    </>
  ),
  wave: (k) => (
    <>
      <path d="M8 22 Q2 30 6 38 M14 14 Q6 12 4 18" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g transform="rotate(18 34 36)">
        <rect x="14" y="26" width="9" height="26" rx="4.5" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} transform="rotate(-8 18 40)" />
        <rect x="24" y="8" width="9" height="34" rx="4.5" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} />
        <rect x="34" y="6" width="9" height="36" rx="4.5" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} />
        <rect x="44" y="12" width="9" height="30" rx="4.5" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} />
        <path d="M14 42 C14 58 24 62 34 62 C46 62 54 52 54 40 V36 H14Z" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} strokeLinejoin="round" />
      </g>
    </>
  ),
  giggle: (k) => (
    <>
      <circle cx="32" cy="32" r="26" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} />
      <path d="M17 26 Q23 20 29 25 M35 25 Q41 20 47 26" stroke="#2a1a2e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Cheeks y={38} dx={17} r={4} />
      <rect x="24" y="36" width="19" height="14" rx="7" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth="1.8" />
      <path d="M27 42 H40" stroke={k.o("#f4b88f")} strokeWidth="1.5" />
      <Gloss x={20} y={16} rx={5} ry={2.4} />
    </>
  ),
  clap: (k) => (
    <>
      <path d="M8 6 L12 14 M20 2 V10 M30 4 L26 12 M56 6 L52 14 M44 2 V10 M34 4 L38 12" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(-25 24 38)">
        <rect x="14" y="14" width="19" height="36" rx="9.5" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} />
      </g>
      <g transform="rotate(25 40 38)">
        <rect x="31" y="14" width="19" height="36" rx="9.5" fill={k.f("#f8c9a5")} stroke={k.o("#f4b88f")} strokeWidth={W} />
      </g>
      <ellipse cx="32" cy="54" rx="14" ry="4" fill="#000" opacity=".1" />
    </>
  ),
  flex: (k) => (
    <>
      <path d="M8 56 C8 40 14 32 20 24 C16 16 20 6 30 6 C42 6 46 18 40 26 C50 24 58 30 56 42 C54 54 44 58 30 58 Z" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M30 20 C36 22 40 28 36 34" stroke={k.o("#f4b88f")} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Gloss x={24} y={14} rx={4} ry={2} rot={-30} />
    </>
  ),
  handshake: (k) => (
    <>
      <rect x="2" y="22" width="14" height="26" rx="4" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth={W} />
      <rect x="48" y="22" width="14" height="26" rx="4" fill={k.f("#f472b6")} stroke={k.o("#f472b6")} strokeWidth={W} />
      <path d="M16 26 L28 22 L40 28 L48 26 V44 L38 52 L30 48 L22 50 L16 44Z" fill={k.f("#f4b88f")} stroke={k.o("#f4b88f")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M26 34 L32 38 M30 30 L38 36 M24 42 L30 44" stroke={k.o("#f4b88f")} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  trophy: (k) => (
    <>
      <path d="M16 14 C4 14 4 30 18 32 M48 14 C60 14 60 30 46 32" stroke={k.o("#fbbf24")} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M16 6 H48 V22 C48 34 40 42 32 42 C24 42 16 34 16 22Z" fill={k.f("#fbbf24")} stroke={k.o("#fbbf24")} strokeWidth={W} strokeLinejoin="round" />
      <rect x="28" y="40" width="8" height="10" fill={k.f("#f59e0b")} stroke={k.o("#f59e0b")} strokeWidth="1.8" />
      <rect x="16" y="50" width="32" height="10" rx="4" fill={k.f("#b45309")} stroke={k.o("#b45309")} strokeWidth={W} />
      <path d={starPath(32, 22, 7, 3)} fill="#fff" opacity=".9" />
      <Gloss x={22} y={14} rx={2.2} ry={6} rot={5} />
    </>
  ),
  fire: (k) => (
    <>
      <path d="M32 3 C34 14 48 20 48 38 C48 52 40 60 32 60 C22 60 14 52 14 40 C14 32 18 28 22 24 C22 30 26 32 28 30 C26 20 28 10 32 3Z" fill={k.f("#fb923c")} stroke={k.o("#ef4444")} strokeWidth={W} strokeLinejoin="round" />
      <path d="M32 30 C36 36 42 40 40 48 C38 56 26 56 24 48 C22 42 28 40 32 30Z" fill={k.f("#fde047")} />
    </>
  ),
  eyes: (k) => (
    <>
      {[18, 46].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="32" rx="13" ry="18" fill={k.f("#fff")} stroke={k.o("#94a3b8")} strokeWidth={W} />
          <circle cx={x + 2} cy="35" r="7" fill="#2a1a2e" />
          <circle cx={x + 4.5} cy="32" r="2.2" fill="#fff" />
        </g>
      ))}
    </>
  ),
  sweat: (k) => (
    <>
      <circle cx="30" cy="34" r="25" fill={k.f("#fde047")} stroke={k.o("#eab308")} strokeWidth={W} />
      <path d="M16 24 L25 22 M35 22 L44 24" stroke="#2a1a2e" strokeWidth="2.2" strokeLinecap="round" />
      <Eye x={21} y={30} r={2.6} />
      <Eye x={39} y={30} r={2.6} />
      <path d="M20 44 Q30 52 40 42 Q30 46 20 44Z" fill="#7f1d1d" stroke="#7f1d1d" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M52 8 C56 14 58 18 54 22 C50 24 47 20 49 16Z" fill={k.f("#38bdf8")} stroke={k.o("#38bdf8")} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),
  pause: (k) => (
    <>
      <rect x="12" y="8" width="16" height="48" rx="6" fill={k.f("#8b5cf6")} stroke={k.o("#8b5cf6")} strokeWidth={W} />
      <rect x="36" y="8" width="16" height="48" rx="6" fill={k.f("#8b5cf6")} stroke={k.o("#8b5cf6")} strokeWidth={W} />
      <Gloss x={17} y={18} rx={1.8} ry={6} rot={0} />
      <Gloss x={41} y={18} rx={1.8} ry={6} rot={0} />
    </>
  ),
  close: (k) => (
    <>
      <path d="M14 14 L50 50 M50 14 L14 50" stroke={k.o("#a78bfa")} strokeWidth="14" strokeLinecap="round" />
      <path d="M14 14 L50 50 M50 14 L14 50" stroke="#c4b5fd" strokeWidth="9" strokeLinecap="round" />
    </>
  ),
  check: (k) => (
    <path d="M12 34 L26 48 L52 16" stroke={k.o("#22c55e")} strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
};
// check icon: add the inner stroke
const _check = DRAW.check;
DRAW.check = (k) => (
  <>
    {_check(k)}
    <path d="M12 34 L26 48 L52 16" stroke="#4ade80" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
void fruitGloss;

// ---------- emoji → icon name ----------
const EMOJI_MAP: Record<string, string> = {
  "⭐": "star", "🌟": "star", "✨": "sparkle", "❤": "heart", "💖": "heart", "🚀": "rocket", "🎮": "gamepad", "🎉": "party",
  "🎈": "balloon", "☀": "sun", "🌙": "moon", "🦄": "unicorn", "👆": "pointer", "🦁": "lion", "🐰": "rabbit", "🧸": "teddy",
  "🐱": "cat", "🐶": "dog", "🐼": "panda", "🐸": "frog", "🐯": "tiger", "🐙": "octopus", "🐹": "hamster", "🦋": "butterfly",
  "🤖": "robot", "🐎": "horse", "🍉": "watermelon", "🍓": "strawberry", "🍎": "apple", "🍩": "donut", "🧁": "cupcake",
  "🍋": "lemon", "🍊": "orange", "🍇": "grapes", "🍬": "candy", "🌈": "rainbow", "🌸": "blossom", "🔒": "lock",
  "🎶": "notes", "🎵": "notes", "🔮": "crystal", "💡": "bulb", "🔢": "numbers", "🎨": "palette", "🖌": "brush",
  "🔨": "hammer", "🌱": "sprout", "🎹": "piano", "🌀": "swirl", "🪐": "planet", "🔴": "reddot", "🔵": "bluedot",
  "➕": "plus", "➖": "minus", "👋": "wave", "🤭": "giggle", "👏": "clap", "💪": "flex", "🤝": "handshake", "🏆": "trophy",
  "🔥": "fire", "👀": "eyes", "😅": "sweat", "⏸": "pause", "✕": "close", "✔": "check",
};
const clean = (s: string) => s.replace(/️/g, "");
export const iconName = (n: string): string | null => {
  const c = clean(n);
  if (DRAW[c]) return c;
  return EMOJI_MAP[c] ?? null;
};

const SvgFrame = ({ name, uid, size, className, style, title }: { name: string; uid: string; size?: number | string; className?: string; style?: React.CSSProperties; title?: string }) => {
  const k = kit(uid);
  const body = DRAW[name](k);
  return (
    <svg
      viewBox="0 0 64 64"
      width={size ?? "1em"}
      height={size ?? "1em"}
      className={className}
      style={{ display: "inline-block", verticalAlign: "-0.14em", flexShrink: 0, ...style }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>{k.defs}</defs>
      <ellipse cx="32" cy="61" rx="16" ry="2.4" fill="#000" opacity=".12" />
      {body}
    </svg>
  );
};

export function Ico({ n, size, className, style, title }: { n: string; size?: number | string; className?: string; style?: React.CSSProperties; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const name = iconName(n);
  if (!name) return <span className={className} style={style}>{n}</span>;
  return <SvgFrame name={name} uid={"i" + uid} size={size} className={className} style={style} title={title} />;
}

/** SVG markup string — used to draw icons on <canvas>. */
export function iconSvgString(n: string, renderToString: (el: React.ReactElement) => string): string | null {
  const name = iconName(n);
  if (!name) return null;
  const el = <SvgFrame name={name} uid={"c" + name} size={128} />;
  return renderToString(el).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
}

const EMOJI_RE = new RegExp(`(${Object.keys(EMOJI_MAP).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\uFE0F?`, "gu");

/** Renders a string, swapping any emoji for the matching cartoon icon. */
export function Rich({ children, size }: { children: string; size?: number | string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  EMOJI_RE.lastIndex = 0;
  while ((m = EMOJI_RE.exec(children))) {
    if (m.index > last) parts.push(children.slice(last, m.index));
    parts.push(<Ico key={m.index} n={m[1]} size={size ?? "1.15em"} />);
    last = m.index + m[0].length;
  }
  if (last < children.length) parts.push(children.slice(last));
  return <>{parts}</>;
}

export const ALL_ICON_NAMES = Object.keys(DRAW);
