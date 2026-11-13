"use client";

import React, { useEffect, useRef } from "react";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";
import { toBn } from "@/lib/format";

interface Item {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  emoji: string;
  color: string;
  sliced: boolean;
}
interface Half {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  emoji: string;
  side: -1 | 1;
  life: number;
}
interface Drop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
interface Pop {
  x: number;
  y: number;
  text: string;
  life: number;
}

const FRUITS: [string, string][] = [
  ["🍉", "#f43f5e"],
  ["🍓", "#ef4444"],
  ["🍎", "#dc2626"],
  ["🍩", "#f9a8d4"],
  ["🧁", "#f472b6"],
  ["🍋", "#facc15"],
  ["🍊", "#fb923c"],
  ["🍇", "#a855f7"],
];
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export default function FruitSlice() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useGame();
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let items: Item[] = [];
    let halves: Half[] = [];
    let drops: Drop[] = [];
    let pops: Pop[] = [];
    let trail: { x: number; y: number; t: number }[] = [];
    let down = false;
    let last: { x: number; y: number } | null = null;
    let spawnT = 0.5;
    let elapsed = 0;
    let combo = 0;
    let lastSlice = 0;
    let raf = 0;
    let prev = performance.now();

    const size = () => Math.max(44, Math.min(72, H * 0.13));

    const spawn = () => {
      const [emoji, color] = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      const g = H * 2.2;
      const x = W * (0.12 + Math.random() * 0.76);
      const apex = H * (0.6 + Math.random() * 0.28);
      items.push({
        x,
        y: H + 40,
        vx: ((W / 2 - x) / 1.7) * (0.3 + Math.random() * 0.6),
        vy: -Math.sqrt(2 * g * apex),
        rot: 0,
        vr: (Math.random() - 0.5) * 6,
        emoji,
        color,
        sliced: false,
      });
    };

    const slice = (it: Item) => {
      it.sliced = true;
      const now = performance.now();
      combo = now - lastSlice < 700 ? combo + 1 : 1;
      lastSlice = now;
      sounds.slice();
      const pts = 10 + (combo >= 3 ? 5 : 0);
      gameRef.current.addScore(pts);
      for (const side of [-1, 1] as const) {
        halves.push({
          x: it.x,
          y: it.y,
          vx: it.vx + side * 120,
          vy: it.vy * 0.4,
          rot: it.rot,
          vr: side * 4,
          emoji: it.emoji,
          side,
          life: 1.2,
        });
      }
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 80 + Math.random() * 200;
        drops.push({ x: it.x, y: it.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.6, color: it.color });
      }
      pops.push({ x: it.x, y: it.y - 30, text: combo >= 3 ? `কম্বো ×${toBn(combo)}!` : `+${toBn(pts)}`, life: 0.9 });
    };

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      sounds.unlock();
      down = true;
      canvas.setPointerCapture?.(e.pointerId);
      last = pos(e);
      trail = [{ ...last, t: performance.now() }];
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const p = pos(e);
      trail.push({ ...p, t: performance.now() });
      if (trail.length > 14) trail.shift();
      if (gameRef.current.active && last) {
        const r = size() * 0.6;
        for (const it of items) {
          if (!it.sliced && distToSegment(it.x, it.y, last.x, last.y, p.x, p.y) < r) slice(it);
        }
      }
      last = p;
    };
    const onUp = () => {
      down = false;
      last = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const loop = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.033);
      prev = now;
      const act = gameRef.current.active;
      const g = H * 2.2;

      if (act) {
        elapsed += dt;
        spawnT -= dt;
        if (spawnT <= 0) {
          const n = 1 + (Math.random() < 0.35 ? 1 : 0) + (elapsed > 20 && Math.random() < 0.3 ? 1 : 0);
          for (let i = 0; i < n; i++) spawn();
          spawnT = Math.max(0.55, 1.0 + Math.random() * 0.4 - Math.min(0.4, elapsed * 0.01));
        }
        for (const it of items) {
          it.x += it.vx * dt;
          it.y += it.vy * dt;
          it.vy += g * dt;
          it.rot += it.vr * dt;
        }
        for (const h of halves) {
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.vy += g * dt;
          h.rot += h.vr * dt;
          h.life -= dt;
        }
        for (const d of drops) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.vy += g * 0.5 * dt;
          d.life -= dt;
        }
        for (const p of pops) p.life -= dt;
        items = items.filter((i) => i.y < H + 80 || i.vy < 0);
        halves = halves.filter((h) => h.life > 0 && h.y < H + 80);
        drops = drops.filter((d) => d.life > 0);
        pops = pops.filter((p) => p.life > 0);
      }
      trail = trail.filter((p) => now - p.t < 180);

      // draw
      ctx.clearRect(0, 0, W, H);
      const sz = size();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const d of drops) {
        ctx.globalAlpha = Math.max(0, d.life / 0.6);
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.font = `${sz}px ${EMOJI_FONT}`;
      for (const it of items) {
        if (it.sliced) continue;
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.rot);
        ctx.fillText(it.emoji, 0, 0);
        ctx.restore();
      }
      for (const h of halves) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, h.life * 2);
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.beginPath();
        ctx.rect(h.side < 0 ? -sz : 0, -sz, sz, sz * 2);
        ctx.clip();
        ctx.fillText(h.emoji, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // glowing trail
      if (trail.length > 1) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "#7dd3fc";
        ctx.shadowBlur = 16;
        for (let i = 1; i < trail.length; i++) {
          const k = i / trail.length;
          ctx.strokeStyle = `rgba(186,230,253,${k})`;
          ctx.lineWidth = 2 + k * 8;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.font = `900 ${Math.round(sz * 0.45)}px ${EMOJI_FONT}`;
      for (const p of pops) {
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "rgba(0,0,0,.4)";
        ctx.lineWidth = 4;
        const y = p.y - (0.9 - p.life) * 40;
        ctx.strokeText(p.text, p.x, y);
        ctx.fillText(p.text, p.x, y);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none cursor-crosshair" />
    </div>
  );
}
