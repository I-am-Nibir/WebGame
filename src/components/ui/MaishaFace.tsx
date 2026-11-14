import React from "react";

/** Cartoon Maisha (hand-drawn SVG — no photo is embedded). */
export default function MaishaFace({ size = 40, rounded = true, bg = true }: { size?: number; rounded?: boolean; bg?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="মাইশা">
      <defs>
        <linearGradient id="mf-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#f0abfc" />
        </linearGradient>
      </defs>
      {bg && <rect width="100" height="100" rx={rounded ? 24 : 0} fill="url(#mf-bg)" />}
      {/* dress */}
      <path d="M12 100 C14 82 32 76 50 76 C68 76 86 82 88 100Z" fill="#1e3a8a" />
      <circle cx="30" cy="90" r="2.2" fill="#f9a8d4" />
      <circle cx="68" cy="88" r="2.2" fill="#f9a8d4" />
      <circle cx="50" cy="96" r="2" fill="#99f6e4" />
      {/* neck */}
      <rect x="43" y="68" width="14" height="12" rx="5" fill="#e9a577" />
      {/* hair back + bun */}
      <circle cx="50" cy="48" r="34" fill="#1a1226" />
      <circle cx="50" cy="13" r="12.5" fill="#1a1226" />
      <rect x="42" y="22" width="16" height="4" rx="2" fill="#f472b6" />
      {/* face */}
      <ellipse cx="50" cy="55" rx="27" ry="27" fill="#f4b88f" />
      {/* bangs & side locks */}
      <path d="M22 52 C18 22 40 18 50 20 C64 18 82 26 78 52 C72 42 62 36 50 37 C38 38 29 43 22 52Z" fill="#1a1226" />
      <ellipse cx="22.5" cy="62" rx="5.2" ry="17" fill="#1a1226" />
      <ellipse cx="77.5" cy="62" rx="5.2" ry="17" fill="#1a1226" />
      {/* eyes */}
      {[39, 61].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="55" rx="7" ry="7.6" fill="#fff" />
          <circle cx={x} cy="55.5" r="5.4" fill="#1a1226" />
          <circle cx={x + 1.8} cy="53.2" r="1.7" fill="#fff" />
        </g>
      ))}
      <path d="M31 46 Q39 42 46 45 M54 45 Q61 42 69 46" stroke="#1a1226" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* bindi */}
      <circle cx="50" cy="42" r="2.1" fill="#fb923c" />
      {/* cheeks, nose, lips */}
      <circle cx="32" cy="68" r="4.5" fill="#fb7185" opacity=".35" />
      <circle cx="68" cy="68" r="4.5" fill="#fb7185" opacity=".35" />
      <path d="M48 64 Q50 66 52 64" stroke="#c9825a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M42 72 Q50 80 58 72 Q50 74.5 42 72Z" fill="#ef4f35" stroke="#ef4f35" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
