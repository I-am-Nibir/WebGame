"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { drawIcon, getIconImage } from "@/lib/iconImage";
import { Ico } from "@/components/ui/Icons";
import { Download, Eraser, Trash2, Undo2 } from "lucide-react";
import { sounds } from "@/lib/audioEngine";

interface Pt {
  x: number;
  y: number;
}
interface Stroke {
  points: Pt[];
  color: string;
  size: number;
  rainbow: boolean;
  eraser: boolean;
  stamp?: string;
}

const BG = "#0b0724";
const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#fb923c", "#ffffff", "#f87171"];
const SIZES = [6, 12, 22];
const STAMPS = ["⭐", "❤️", "🌈", "🦄", "🌸"];
if (typeof window !== "undefined") STAMPS.forEach((e) => getIconImage(e));

function drawSegment(ctx: CanvasRenderingContext2D, s: Stroke, a: Pt, b: Pt, idx: number) {
  const color = s.eraser ? BG : s.rainbow ? `hsl(${(idx * 14) % 360} 95% 62%)` : s.color;
  ctx.strokeStyle = color;
  ctx.shadowColor = s.eraser ? "transparent" : color;
  ctx.shadowBlur = s.eraser ? 0 : s.size * 1.6;
  ctx.lineWidth = s.size;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (s.stamp) {
    ctx.shadowColor = "rgba(255,255,255,.5)";
    ctx.shadowBlur = 18;
    drawIcon(ctx, s.stamp, s.points[0].x, s.points[0].y, s.size * 4.4);
  } else if (s.points.length === 1) {
    const p = s.points[0];
    drawSegment(ctx, s, p, { x: p.x + 0.01, y: p.y }, 0);
  } else {
    for (let i = 1; i < s.points.length; i++) drawSegment(ctx, s, s.points[i - 1], s.points[i], i);
  }
  ctx.restore();
}

export default function GlowDoodle() {
  const t = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<Stroke | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [rainbow, setRainbow] = useState(false);
  const [eraser, setEraser] = useState(false);
  const [stamp, setStamp] = useState<string | null>(null);
  const tool = useRef({ color, size, rainbow, eraser, stamp });
  tool.current = { color, size, rainbow, eraser, stamp };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h } = sizeRef.current;
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    strokes.current.forEach((s) => drawStroke(ctx, s));
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: wrap.clientWidth, h: wrap.clientHeight };
      canvas.width = Math.round(wrap.clientWidth * dpr);
      canvas.height = Math.round(wrap.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const pos = (e: PointerEvent): Pt => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e: PointerEvent) => {
      sounds.unlock();
      canvas.setPointerCapture?.(e.pointerId);
      const t = tool.current;
      const p = pos(e);
      const s: Stroke = t.stamp
        ? { points: [p], color: t.color, size: t.size, rainbow: false, eraser: false, stamp: t.stamp }
        : { points: [p], color: t.color, size: t.size, rainbow: t.rainbow, eraser: t.eraser };
      if (t.stamp) {
        sounds.pop(1.1);
        strokes.current.push(s);
        drawStroke(ctx, s);
        return;
      }
      current.current = s;
      drawStroke(ctx, s);
    };
    const move = (e: PointerEvent) => {
      const s = current.current;
      if (!s) return;
      const p = pos(e);
      const prev = s.points[s.points.length - 1];
      if (Math.hypot(p.x - prev.x, p.y - prev.y) < 2) return;
      s.points.push(p);
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      drawSegment(ctx, s, prev, p, s.points.length);
      ctx.restore();
    };
    const up = () => {
      if (current.current) strokes.current.push(current.current);
      current.current = null;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [redraw]);

  const undo = () => {
    strokes.current.pop();
    sounds.pop(0.8);
    redraw();
  };
  const clear = () => {
    strokes.current = [];
    sounds.thud();
    redraw();
  };
  const save = () => {
    const a = document.createElement("a");
    a.download = "maisha-art.png";
    a.href = canvasRef.current!.toDataURL("image/png");
    a.click();
    sounds.coin();
  };

  const pickColor = (c: string) => {
    sounds.pop();
    setColor(c);
    setRainbow(false);
    setEraser(false);
    setStamp(null);
  };

  const toolBtn = (on: boolean) =>
    `w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-2xl transition active:scale-95 ${
      on ? "bg-white text-purple-700 ring-4 ring-yellow-300" : "bg-white/15 text-white"
    }`;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div ref={wrapRef} className="relative flex-1 min-h-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full touch-none cursor-crosshair" />
      </div>
      <div className="bg-black/40 backdrop-blur px-3 py-2 flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => pickColor(c)}
              aria-label={t(`রঙ ${c}`, `Colour ${c}`)}
              className={`w-12 h-12 shrink-0 rounded-full border-4 transition active:scale-95 ${
                color === c && !rainbow && !eraser && !stamp ? "border-white scale-110" : "border-white/30"
              }`}
              style={{ background: c, boxShadow: `0 0 14px ${c}` }}
            />
          ))}
          <button
            onClick={() => {
              sounds.pop();
              setRainbow(true);
              setEraser(false);
              setStamp(null);
            }}
            aria-label={t("রংধনু ব্রাশ", "Rainbow brush")}
            className={`w-12 h-12 shrink-0 rounded-full border-4 transition active:scale-95 ${rainbow && !stamp ? "border-white scale-110" : "border-white/30"}`}
            style={{ background: "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)" }}
          />
        </div>
        <div className="flex gap-2 items-center overflow-x-auto">
          {SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)} aria-label={t(`ব্রাশ ${s}`, `Brush ${s}`)} className={toolBtn(size === s)}>
              <span className="rounded-full bg-current" style={{ width: s * 0.9 + 4, height: s * 0.9 + 4 }} />
            </button>
          ))}
          <span className="w-px h-8 bg-white/30 shrink-0" />
          {STAMPS.map((s) => (
            <button
              key={s}
              onClick={() => {
                sounds.pop();
                setStamp(stamp === s ? null : s);
                setEraser(false);
              }}
              aria-label={t("স্ট্যাম্প", "Stamp")}
              className={toolBtn(stamp === s)}
            >
              <Ico n={s} size={28} />
            </button>
          ))}
          <span className="w-px h-8 bg-white/30 shrink-0" />
          <button
            onClick={() => {
              setEraser(!eraser);
              setStamp(null);
              setRainbow(false);
            }}
            aria-label={t("রাবার", "Eraser")}
            className={toolBtn(eraser)}
          >
            <Eraser size={24} />
          </button>
          <button onClick={undo} aria-label={t("আগের ধাপে যাও", "Undo")} className={toolBtn(false)}>
            <Undo2 size={24} />
          </button>
          <button onClick={clear} aria-label={t("সব মুছে ফেলো", "Clear all")} className={toolBtn(false)}>
            <Trash2 size={24} />
          </button>
          <button onClick={save} aria-label={t("ছবি সেভ করো", "Save picture")} className={toolBtn(false)}>
            <Download size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
