"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Scene3D, { useFit } from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

const HOLES = Array.from({ length: 9 }, (_, i) => ({
  x: ((i % 3) - 1) * 2.0,
  z: (Math.floor(i / 3) - 1) * 1.75,
}));
const MONSTER_COLORS = ["#7c5cff", "#22c55e", "#f97316", "#06b6d4", "#ec4899"];

interface Slot {
  life: number; // seconds remaining up
  hit: number; // seconds remaining in "bonked" state
  type: number;
}

function Monster({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} scale={[1, 1.1, 1]}>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {/* horns */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.35, 1.2, 0]} rotation={[0, 0, -s * 0.4]}>
          <coneGeometry args={[0.13, 0.35, 10]} />
          <meshStandardMaterial color="#fde68a" roughness={0.4} />
        </mesh>
      ))}
      {/* eyes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.22, 0.72, 0.5]}>
          <mesh scale={[1, 1, 0.6]}>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#1e1b4b" />
          </mesh>
        </group>
      ))}
      {/* smile */}
      <mesh position={[0, 0.42, 0.56]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.15, 0.035, 10, 20, Math.PI]} />
        <meshBasicMaterial color="#1e1b4b" />
      </mesh>
    </group>
  );
}

function Hole({ i, slots, onHit }: { i: number; slots: React.MutableRefObject<Slot[]>; onHit: (i: number) => void }) {
  const mon = useRef<THREE.Group>(null!);
  const color = useMemo(() => MONSTER_COLORS[i % MONSTER_COLORS.length], [i]);
  const hole = HOLES[i];
  const monsterColor = useRef(color);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = slots.current[i];
    const up = s.life > 0 && s.hit <= 0;
    const targetY = up ? 0 : -1.5;
    const g = mon.current;
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 1 - Math.pow(0.0005, dt));
    g.scale.y = s.hit > 0 ? 0.55 : THREE.MathUtils.lerp(g.scale.y, 1, 0.25);
    g.scale.x = g.scale.z = s.hit > 0 ? 1.25 : 1;
    g.visible = g.position.y > -1.45;
    monsterColor.current = MONSTER_COLORS[s.type % MONSTER_COLORS.length];
  });

  return (
    <group position={[hole.x, 0, hole.z]}>
      {/* the dark hole sits just above the ground and hides the sunk monster */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="#3b1d0e" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[1, 1, 0.45]}>
        <torusGeometry args={[0.88, 0.14, 12, 32]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <group ref={mon} position={[0, -1.5, 0]}>
        <MonsterSwitch slots={slots} i={i} />
      </group>
      {/* big forgiving hit area */}
      <mesh
        position={[0, 0.6, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onHit(i);
        }}
      >
        <cylinderGeometry args={[1.0, 1.0, 1.6, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Renders all monster variants but only shows the one for the current slot type. */
function MonsterSwitch({ slots, i }: { slots: React.MutableRefObject<Slot[]>; i: number }) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    const t = slots.current[i].type % MONSTER_COLORS.length;
    groups.current.forEach((g, k) => {
      if (g) g.visible = k === t;
    });
  });
  return (
    <>
      {MONSTER_COLORS.map((c, k) => (
        <group
          key={c}
          ref={(el) => {
            groups.current[k] = el;
          }}
          visible={k === 0}
        >
          <Monster color={c} />
        </group>
      ))}
    </>
  );
}

function Field() {
  const { active, addScore } = useGame();
  const fit = useFit(6.6, 6);
  const slots = useRef<Slot[]>(Array.from({ length: 9 }, () => ({ life: 0, hit: 0, type: 0 })));
  const timers = useRef({ spawn: 0.6, elapsed: 0 });
  const { spawn, node } = useBursts();

  useFrame((_, rawDt) => {
    if (!active) return;
    const dt = Math.min(rawDt, 0.05);
    const t = timers.current;
    t.elapsed += dt;
    t.spawn -= dt;
    slots.current.forEach((s) => {
      if (s.life > 0) s.life -= dt;
      if (s.hit > 0) s.hit -= dt;
    });
    if (t.spawn <= 0) {
      const spawnOne = () => {
        const empties = slots.current.map((s, i) => (s.life <= 0 && s.hit <= 0 ? i : -1)).filter((i) => i >= 0);
        if (!empties.length) return;
        const pick = empties[Math.floor(Math.random() * empties.length)];
        slots.current[pick].life = Math.max(0.9, 1.5 - t.elapsed * 0.012);
        slots.current[pick].type = Math.floor(Math.random() * MONSTER_COLORS.length);
      };
      spawnOne();
      if (t.elapsed > 15 && Math.random() < 0.4) spawnOne();
      t.spawn = Math.max(0.55, 1.0 - t.elapsed * 0.01);
    }
  });

  const onHit = useCallback(
    (i: number) => {
      if (!active) return;
      const s = slots.current[i];
      if (s.life > 0 && s.hit <= 0) {
        s.hit = 0.35;
        s.life = 0;
        sounds.bonk();
        addScore(10);
        const h = HOLES[i];
        spawn(h.x, 1.1, h.z, MONSTER_COLORS[s.type % MONSTER_COLORS.length], 16);
      } else {
        sounds.thud();
      }
    },
    [active, addScore, spawn]
  );

  return (
    <group scale={fit}>
      {/* grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[5.2, 48]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      {HOLES.map((_, i) => (
        <Hole key={i} i={i} slots={slots} onHit={onHit} />
      ))}
      {node}
    </group>
  );
}

export default function WhackAMonster() {
  return (
    <Scene3D cameraPosition={[0, 6.2, 6.8]} lookAt={[0, 0, 0]}>
      <Field />
    </Scene3D>
  );
}
