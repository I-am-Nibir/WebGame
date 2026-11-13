"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Scene3D from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

const COLORS = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];
let uid = 0;

interface B {
  id: number;
  x: number;
  startPos: [number, number, number];
  color: string;
  speed: number;
  star: boolean;
  scale: number;
  phase: number;
}

function Balloon({
  b,
  onPop,
  onGone,
}: {
  b: B;
  onPop: (b: B, pos: THREE.Vector3) => void;
  onGone: (id: number) => void;
}) {
  const ref = useRef<THREE.Group>(null!);
  const gone = useRef(false);
  const { active } = useGame();
  const viewport = useThree((s) => s.viewport);
  const starGeo = useMemo(() => (b.star ? makeStarGeometry(0.32, 0.14, 0.1) : null), [b.star]);
  const color = b.star ? "#fbbf24" : b.color;

  useFrame((state, dt) => {
    if (!active) return;
    const g = ref.current;
    g.position.y += b.speed * Math.min(dt, 0.05);
    const t = state.clock.elapsedTime + b.phase;
    g.position.x = b.x + Math.sin(t * 1.6) * 0.18;
    g.rotation.z = Math.sin(t * 1.6) * 0.1;
    if (g.position.y > viewport.height / 2 + 2 && !gone.current) {
      gone.current = true;
      onGone(b.id);
    }
  });

  return (
    <group
      ref={ref}
      position={b.startPos}
      scale={b.scale}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (!active) return;
        onPop(b, ref.current.position);
      }}
    >
      {/* generous invisible hit area for little fingers */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[1.0, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh scale={[1, 1.2, 1]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
      </mesh>
      <mesh position={[-0.2, 0.3, 0.45]} scale={[0.5, 0.75, 0.3]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.17, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.25, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
      </mesh>
      {starGeo && (
        <mesh geometry={starGeo} position={[0, 0.05, 0.52]}>
          <meshStandardMaterial color="#ffffff" emissive="#fff7ae" emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  );
}

function Clouds() {
  const refs = useRef<THREE.Group[]>([]);
  const viewport = useThree((s) => s.viewport);
  const clouds = useMemo(
    () => [
      { x: -3, y: 2.6, s: 1.1, v: 0.12 },
      { x: 2, y: 0.6, s: 0.8, v: 0.08 },
      { x: 4, y: -2, s: 1.3, v: 0.1 },
      { x: -4, y: -1.2, s: 0.9, v: 0.06 },
    ],
    []
  );
  useFrame((_, dt) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.x += clouds[i].v * Math.min(dt, 0.05);
      const edge = viewport.width / 2 + 3;
      if (g.position.x > edge) g.position.x = -edge;
    });
  });
  return (
    <>
      {clouds.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[c.x, c.y, -4]}
          scale={c.s}
        >
          {[
            [0, 0, 0.9],
            [0.9, -0.1, 0.65],
            [-0.9, -0.15, 0.6],
            [0.4, 0.4, 0.55],
          ].map(([x, y, r], k) => (
            <mesh key={k} position={[x, y, 0]}>
              <sphereGeometry args={[r, 14, 14]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

function Field() {
  const { active, addScore } = useGame();
  const viewport = useThree((s) => s.viewport);
  const [list, setList] = useState<B[]>([]);
  const timers = useRef({ spawn: 0, elapsed: 0, combo: 0, lastPop: 0 });
  const { spawn, node } = useBursts();

  useFrame((_, rawDt) => {
    if (!active) return;
    const dt = Math.min(rawDt, 0.05);
    const t = timers.current;
    t.elapsed += dt;
    t.spawn -= dt;
    if (t.spawn <= 0) {
      t.spawn = Math.max(0.4, 0.75 - t.elapsed * 0.007);
      const half = Math.max(0.5, viewport.width / 2 - 0.9);
      const x = (Math.random() * 2 - 1) * half;
      setList((p) => [
        ...p.slice(-16),
        {
          id: ++uid,
          x,
          startPos: [x, -viewport.height / 2 - 1.8, 0],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          speed: 2.2 + Math.random() * 1.2 + Math.min(1, t.elapsed * 0.02),
          star: Math.random() < 0.1,
          scale: 0.85 + Math.random() * 0.3,
          phase: Math.random() * 6,
        },
      ]);
    }
  });

  const onPop = useCallback(
    (b: B, pos: THREE.Vector3) => {
      const t = timers.current;
      const now = performance.now();
      t.combo = now - t.lastPop < 1000 ? Math.min(t.combo + 1, 10) : 0;
      t.lastPop = now;
      if (b.star) sounds.star();
      else sounds.pop(1 + t.combo * 0.08);
      spawn(pos.x, pos.y, pos.z, b.star ? "#fde047" : b.color, b.star ? 22 : 14);
      addScore(b.star ? 15 : 5);
      setList((p) => p.filter((x) => x.id !== b.id));
    },
    [addScore, spawn]
  );
  const onGone = useCallback((id: number) => setList((p) => p.filter((x) => x.id !== id)), []);

  return (
    <>
      <Clouds />
      {list.map((b) => (
        <Balloon key={b.id} b={b} onPop={onPop} onGone={onGone} />
      ))}
      {node}
    </>
  );
}

export default function BalloonPop() {
  return (
    <Scene3D cameraPosition={[0, 0, 10]}>
      <Field />
    </Scene3D>
  );
}
