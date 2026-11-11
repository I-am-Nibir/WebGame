"use client";

import React, { useRef, useEffect, useState } from "react";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";

interface Item {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  emoji: string;
  sliced: boolean;
}

export default function FruitSlice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const addCoins = useGameStore((s) => s.addCoins);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let items: Item[] = [];
    let trail: { x: number; y: number }[] = [];
    let isMouseDown = false;

    const emojis = ["🍉", "🍓", "🍎", "🍩", "🧁", "🍋"];

    const spawnItem = () => {
      items.push({
        x: Math.random() * (canvas.width - 80) + 40,
        y: canvas.height + 30,
        vx: (Math.random() - 0.5) * 5,
        vy: -(Math.random() * 4 + 11),
        size: 45,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        sliced: false,
      });
    };

    const interval = setInterval(spawnItem, 800);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isMouseDown = true;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      trail = [{ x: clientX - rect.left, y: clientY - rect.top }];
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const currentPos = { x: clientX - rect.left, y: clientY - rect.top };
      trail.push(currentPos);
      if (trail.length > 8) trail.shift();

      items.forEach((item) => {
        if (!item.sliced) {
          const dist = Math.hypot(item.x - currentPos.x, item.y - currentPos.y);
          if (dist < item.size) {
            item.sliced = true;
            sounds.playSlice();
            setScore((prev) => prev + 10);
            addCoins(2);
          }
        }
      });
    };

    const handlePointerUp = () => {
      isMouseDown = false;
      trail = [];
    };

    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    canvas.addEventListener("touchstart", handlePointerDown);
    canvas.addEventListener("touchmove", handlePointerMove);
    window.addEventListener("touchend", handlePointerUp);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      items.forEach((item, index) => {
        item.x += item.vx;
        item.y += item.vy;
        item.vy += 0.25;

        ctx.font = `${item.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (item.sliced) {
          ctx.globalAlpha = 0.4;
          ctx.fillText("✨", item.x, item.y);
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillText(item.emoji, item.x, item.y);
        }

        if (item.y > canvas.height + 60) {
          items.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handlePointerDown);
      canvas.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, [addCoins]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-lg mb-3 px-4 text-purple-900 font-black text-xl">
        <span>স্কোর: {score}</span>
        <span>লক্ষ্য: ক্যান্ডি স্লাইস করো! 🍉</span>
      </div>
      <canvas
        ref={canvasRef}
        width={550}
        height={380}
        className="w-full max-w-lg bg-gradient-to-b from-indigo-900 to-purple-950 rounded-3xl shadow-2xl border-4 border-yellow-300 touch-none cursor-crosshair"
      />
    </div>
  );
}
