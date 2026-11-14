"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Rich } from "@/components/ui/Icons";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene3D from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { Toy } from "@/components/3d/toy";
import { wickerTexture, stripeTexture } from "@/components/3d/textures";
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

const SPRINKLES = ["#ef4444", "#fde047", "#22c55e", "#38bdf8", "#ffffff", "#a855f7"];
const sprinkleSpots = Array.from({ length: 14 }, (_, i) => {
  const a = i * 2.4;
  const r = 0.16 + ((i * 37) % 10) / 70;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: a, c: SPRINKLES[i % SPRINKLES.length] };
});

function Sweet({ kind }: { kind: Kind }) {
  const starGeo = useMemo(() => (kind === "star" ? makeStarGeometry(0.4, 0.18, 0.14) : null), [kind]);
  const stripe = useMemo(() => (kind === "candy" ? stripeTexture("#ef4444", "#ffffff", 6) : null), [kind]);
  if (kind === "cupcake") {
    return (
      <group>
        {/* paper wrapper */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.26, 0.38, 24, 1]} />
          <meshPhysicalMaterial color="#f59e0b" roughness={0.45} sheen={1} sheenColor="#fde68a" clearcoat={0.4} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i / 12) * Math.PI * 2) * 0.32, -0.15, Math.sin((i / 12) * Math.PI * 2) * 0.32]} rotation={[0, -(i / 12) * Math.PI * 2, 0.17]}>
            <boxGeometry args={[0.012, 0.36, 0.05]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
        ))}
        {/* swirled frosting */}
        {[
          [0.12, 0.38, 0.17],
          [0.3, 0.32, 0.14],
          [0.46, 0.22, 0.12],
        ].map(([y, r, t], i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, i * 0.8]} castShadow>
            <torusGeometry args={[r, t, 18, 32]} />
            <Toy color="#f9a8d4" roughness={0.3} glow={0.2} />
          </mesh>
        ))}
        {sprinkleSpots.slice(0, 8).map((p, i) => (
          <mesh key={i} position={[p.x * 1.1, 0.5 - (p.x * p.x + p.z * p.z) * 1.2, p.z * 1.1]} rotation={[0.6, p.rot, 0.4]}>
            <capsuleGeometry args={[0.012, 0.045, 4, 6]} />
            <meshStandardMaterial color={p.c} roughness={0.4} emissive={p.c} emissiveIntensity={0.2} />
          </mesh>
        ))}
        {/* cherry */}
        <mesh position={[0, 0.58, 0]} castShadow>
          <sphereGeometry args={[0.1, 20, 16]} />
          <Toy color="#dc2626" roughness={0.12} glow={0.3} />
        </mesh>
        <mesh position={[0.02, 0.7, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.008, 0.008, 0.14, 5]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>
    );
  }
  if (kind === "donut") {
    return (
      <group rotation={[0.55, 0, 0]}>
        {/* dough */}
        <mesh castShadow>
          <torusGeometry args={[0.32, 0.17, 24, 40]} />
          <meshPhysicalMaterial color="#e2a35b" roughness={0.65} sheen={0.5} sheenColor="#fde68a" />
        </mesh>
        {/* glossy icing */}
        <mesh position={[0, 0, 0.055]} scale={[1, 1, 0.62]}>
          <torusGeometry args={[0.32, 0.178, 24, 40]} />
          <Toy color="#f472b6" roughness={0.18} glow={0.22} />
        </mesh>
        {sprinkleSpots.map((p, i) => {
          const a = i * 0.45;
          return (
            <mesh key={i} position={[Math.cos(a) * (0.32 + Math.sin(i * 5) * 0.09), Math.sin(a) * (0.32 + Math.sin(i * 5) * 0.09), 0.17]} rotation={[0, 0, a + i]}>
              <capsuleGeometry args={[0.012, 0.05, 4, 6]} />
              <meshStandardMaterial color={p.c} roughness={0.4} emissive={p.c} emissiveIntensity={0.25} />
            </mesh>
          );
        })}
      </group>
    );
  }
  if (kind === "candy") {
    return (
      <group>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 32, 24]} />
          <Toy color="#ffffff" map={stripe ?? undefined} roughness={0.12} glow={0.1} />
        </mesh>
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh position={[sd * 0.38, 0, 0]} rotation={[0, 0, (-sd * Math.PI) / 2]} castShadow>
              <coneGeometry args={[0.19, 0.3, 14]} />
              <Toy color="#38bdf8" roughness={0.15} transparent opacity={0.92} glow={0.2} />
            </mesh>
            <mesh position={[sd * 0.56, 0, 0]} rotation={[0, 0, (-sd * Math.PI) / 2]}>
              <coneGeometry args={[0.16, 0.14, 14, 1, true]} />
              <Toy color="#7dd3fc" roughness={0.2} transparent opacity={0.8} side={THREE.DoubleSide} glow={0.2} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }
  return (
    <mesh geometry={starGeo ?? undefined} castShadow>
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1.8} metalness={0.6} roughness={0.2} />
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
  const wicker = useMemo(() => wickerTexture([5, 1.2]), []);
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
      {/* woven wicker body */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.95, 0.65, 0.8, 40, 1, true]} />
        <meshStandardMaterial map={wicker} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.64, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshStandardMaterial map={wicker} roughness={0.85} />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.075, 16, 48]} />
        <meshStandardMaterial color="#8a5316" roughness={0.55} />
      </mesh>
      {/* red gingham ribbon + bow */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.885, 0.84, 0.17, 40, 1, true]} />
        <Toy color="#ef4444" roughness={0.45} side={THREE.DoubleSide} glow={0.1} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[sd * 0.1, -0.05, 0.9]} rotation={[0, 0, sd * 0.5]} scale={[1, 0.7, 0.5]}>
          <sphereGeometry args={[0.13, 16, 12]} />
          <Toy color="#ef4444" glow={0.2} />
        </mesh>
      ))}
      <mesh position={[0, -0.05, 0.93]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <Toy color="#dc2626" glow={0.2} />
      </mesh>
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
      <Scene3D cameraPosition={[0, 0, 10]} mood="toy" bloom={0.5}>
        <Field />
      </Scene3D>
      <div className="absolute bottom-2 inset-x-0 text-center text-white/80 font-bold pointer-events-none text-sm">
        <Rich>{t("👆 আঙুল বা মাউস সরাও", "👆 Move your finger or mouse")}</Rich>
      </div>
    </>
  );
}
