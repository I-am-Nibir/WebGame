"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Rich } from "@/components/ui/Icons";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene3D from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

type Kind = "cupcake" | "donut" | "candy" | "star";
const KINDS: Kind[] = ["cupcake", "donut", "candy", "cupcake", "donut", "candy", "star"];
const POINTS: Record<Kind, number> = { cupcake: 5, donut: 5, candy: 5, star: 15 };
const BURST: Record<Kind, string> = { cupcake: "#f9a8d4", donut: "#f472b6", candy: "#38bdf8", star: "#fde047" };
let uid = 0;

interface Item {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  speed: number;
  spin: number;
}

function Sweet({ kind }: { kind: Kind }) {
  const starGeo = useMemo(() => (kind === "star" ? makeStarGeometry(0.4, 0.18, 0.14) : null), [kind]);
  if (kind === "cupcake") {
    return (
      <group>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.38, 0.26, 0.38, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0]} scale={[1, 0.8, 1]}>
          <sphereGeometry args={[0.4, 18, 18]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
      </group>
    );
  }
  if (kind === "donut") {
    return (
      <mesh rotation={[0.55, 0, 0]}>
        <torusGeometry args={[0.32, 0.17, 14, 24]} />
        <meshStandardMaterial color="#f472b6" roughness={0.35} />
      </mesh>
    );
  }
  if (kind === "candy") {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.3} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.4, 0, 0]} rotation={[0, 0, (-s * Math.PI) / 2]}>
            <coneGeometry args={[0.2, 0.28, 10]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.4} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <mesh geometry={starGeo ?? undefined}>
      <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} roughness={0.3} />
    </mesh>
  );
}

function Falling({
  it,
  basketX,
  basketTop,
  onCatch,
  onGone,
}: {
  it: Item;
  basketX: React.MutableRefObject<number>;
  basketTop: number;
  onCatch: (it: Item, x: number, y: number) => void;
  onGone: (id: number) => void;
}) {
  const ref = useRef<THREE.Group>(null!);
  const dead = useRef(false);
  const { active } = useGame();
  const viewport = useThree((s) => s.viewport);

  useFrame((_, dt) => {
    if (!active || dead.current) return;
    const g = ref.current;
    g.position.y -= it.speed * Math.min(dt, 0.05);
    g.rotation.y += it.spin * dt;
    const y = g.position.y;
    if (y < basketTop && y > basketTop - 0.6 && Math.abs(g.position.x - basketX.current) < 0.95) {
      dead.current = true;
      onCatch(it, g.position.x, y);
    } else if (y < -viewport.height / 2 - 1) {
      dead.current = true;
      onGone(it.id);
    }
  });

  return (
    <group ref={ref} position={[it.x, it.y, 0]} scale={1.1}>
      <Sweet kind={it.kind} />
    </group>
  );
}

function Basket({ x, y }: { x: React.MutableRefObject<number>; y: number }) {
  const ref = useRef<THREE.Group>(null!);
  const { active } = useGame();
  const viewport = useThree((s) => s.viewport);
  const keys = useRef({ left: false, right: false });
  const lastMove = useRef(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((state, dt) => {
    const limit = viewport.width / 2 - 0.9;
    const k = keys.current;
    let target = x.current;
    if (k.left || k.right) {
      target += ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 9 * Math.min(dt, 0.05);
      lastMove.current = performance.now();
    } else if (active) {
      target = state.pointer.x * (viewport.width / 2);
    }
    target = THREE.MathUtils.clamp(target, -limit, limit);
    const prev = x.current;
    x.current = THREE.MathUtils.lerp(prev, target, 1 - Math.pow(0.0001, Math.min(dt, 0.05)));
    ref.current.position.x = x.current;
    ref.current.rotation.z = THREE.MathUtils.clamp((prev - x.current) * 2.5, -0.35, 0.35);
  });

  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.95, 0.65, 0.8, 24, 1, true]} />
        <meshStandardMaterial color="#c2813a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshStandardMaterial color="#a16207" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.07, 10, 28]} />
        <meshStandardMaterial color="#7c4a14" roughness={0.7} />
      </mesh>
      {/* weave stripes */}
      {[-0.35, -0.05].map((yy) => (
        <mesh key={yy} position={[0, yy, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.85 - (0.15 - yy) * 0.2, 0.025, 6, 28]} />
          <meshStandardMaterial color="#7c4a14" />
        </mesh>
      ))}
    </group>
  );
}

function Field() {
  const { active, addScore } = useGame();
  const viewport = useThree((s) => s.viewport);
  const [list, setList] = useState<Item[]>([]);
  const basketX = useRef(0);
  const timers = useRef({ spawn: 0.4, elapsed: 0, combo: 0, lastCatch: 0 });
  const { spawn, node } = useBursts();
  const basketY = -viewport.height / 2 + 1.0;
  const basketTop = basketY + 0.1;

  useFrame((_, rawDt) => {
    if (!active) return;
    const dt = Math.min(rawDt, 0.05);
    const t = timers.current;
    t.elapsed += dt;
    t.spawn -= dt;
    if (t.spawn <= 0) {
      t.spawn = Math.max(0.35, 0.8 - t.elapsed * 0.01);
      const half = Math.max(0.5, viewport.width / 2 - 0.9);
      setList((p) => [
        ...p.slice(-14),
        {
          id: ++uid,
          kind: KINDS[Math.floor(Math.random() * KINDS.length)],
          x: (Math.random() * 2 - 1) * half,
          y: viewport.height / 2 + 1,
          speed: 3.2 + Math.random() * 1.3 + Math.min(2, t.elapsed * 0.05),
          spin: 1 + Math.random() * 2,
        },
      ]);
    }
  });

  const onCatch = useCallback(
    (it: Item, x: number, y: number) => {
      const t = timers.current;
      const now = performance.now();
      t.combo = now - t.lastCatch < 1200 ? Math.min(t.combo + 1, 8) : 0;
      t.lastCatch = now;
      if (it.kind === "star") sounds.star();
      else sounds.pop(1 + t.combo * 0.07);
      spawn(x, y, 0.5, BURST[it.kind], it.kind === "star" ? 20 : 12);
      addScore(POINTS[it.kind]);
      setList((p) => p.filter((i) => i.id !== it.id));
    },
    [addScore, spawn]
  );
  const onGone = useCallback((id: number) => setList((p) => p.filter((i) => i.id !== id)), []);

  return (
    <>
      {list.map((it) => (
        <Falling key={it.id} it={it} basketX={basketX} basketTop={basketTop} onCatch={onCatch} onGone={onGone} />
      ))}
      <Basket x={basketX} y={basketY} />
      {node}
    </>
  );
}

export default function SweetsCatcher() {
  const t = useT();
  return (
    <>
      <Scene3D cameraPosition={[0, 0, 10]}>
        <Field />
      </Scene3D>
      <div className="absolute bottom-2 inset-x-0 text-center text-white/80 font-bold pointer-events-none text-sm">
        <Rich>{t("👆 আঙুল বা মাউস সরাও", "👆 Move your finger or mouse")}</Rich>
      </div>
    </>
  );
}
