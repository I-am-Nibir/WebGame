import React from "react";

/** Soft decorative confetti along the page edges (large screens only). */
const BITS = [
  { side: "left", x: 1.5, y: 6, w: 10, h: 18, c: "#fbbf24", r: 20 },
  { side: "left", x: 4, y: 14, w: 12, h: 12, c: "#f472b6", r: 0, round: true },
  { side: "left", x: 2, y: 24, w: 8, h: 22, c: "#a78bfa", r: -35 },
  { side: "left", x: 5, y: 36, w: 14, h: 14, c: "#34d399", r: 0, round: true },
  { side: "left", x: 1.5, y: 48, w: 10, h: 20, c: "#f87171", r: 40 },
  { side: "left", x: 4.5, y: 60, w: 12, h: 12, c: "#60a5fa", r: 0, round: true },
  { side: "left", x: 2, y: 72, w: 8, h: 20, c: "#fbbf24", r: -20 },
  { side: "left", x: 5, y: 84, w: 14, h: 14, c: "#f472b6", r: 0, round: true },
  { side: "right", x: 1.5, y: 9, w: 12, h: 12, c: "#60a5fa", r: 0, round: true },
  { side: "right", x: 4.5, y: 18, w: 8, h: 22, c: "#f472b6", r: 30 },
  { side: "right", x: 2, y: 30, w: 14, h: 14, c: "#fbbf24", r: 0, round: true },
  { side: "right", x: 5, y: 42, w: 10, h: 20, c: "#34d399", r: -40 },
  { side: "right", x: 1.5, y: 54, w: 12, h: 12, c: "#a78bfa", r: 0, round: true },
  { side: "right", x: 4, y: 66, w: 8, h: 22, c: "#f87171", r: 25 },
  { side: "right", x: 2, y: 78, w: 14, h: 14, c: "#60a5fa", r: 0, round: true },
  { side: "right", x: 5, y: 90, w: 10, h: 18, c: "#fbbf24", r: -30 },
] as const;

export default function SideConfetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {BITS.map((b, i) => (
        <span
          key={i}
          className="absolute animate-bob opacity-80"
          style={{
            [b.side]: `${b.x}%`,
            top: `${b.y}%`,
            width: b.w,
            height: b.h,
            background: b.c,
            borderRadius: "round" in b && b.round ? "9999px" : 4,
            transform: `rotate(${b.r}deg)`,
            animationDuration: `${4 + (i % 5)}s`,
            animationDelay: `${(i % 7) * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
