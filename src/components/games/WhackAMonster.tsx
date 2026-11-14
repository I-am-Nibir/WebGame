"use client";

import React, { useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
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

const FACE_URL = "photos/abir-face.webp";

/** A fuzzy monster whose face is Abir kaku. Colour of the body changes per spawn. */
function Monster({ i, slots, tex }: { i: number; slots: React.MutableRefObject<Slot[]>; tex: THREE.Texture }) {
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null!);
  const faceMat = useRef<THREE.MeshBasicMaterial>(null!);
  const stars = useRef<THREE.Group>(null!);
  const wob = useRef<THREE.Group>(null!);
  const lastType = useRef(-1);

  useFrame((state) => {
    const s = slots.current[i];
    if (lastType.current !== s.type) {
      lastType.current = s.type;
      bodyMat.current.color.set(MONSTER_COLORS[s.type % MONSTER_COLORS.length]);
    }
    const hit = s.hit > 0;
    faceMat.current.color.set(hit ? "#ff9d9d" : "#ffffff");
    stars.current.visible = hit;
    if (hit) stars.current.rotation.y = state.clock.elapsedTime * 7;
    wob.current.rotation.z = hit ? Math.sin(state.clock.elapsedTime * 30) * 0.18 : Math.sin(state.clock.elapsedTime * 6 + i) * 0.05;
  });

  return (
    <group ref={wob}>
      {/* body */}
      <mesh position={[0, 0.5, 0]} scale={[1, 1.05, 1]}>
        <sphereGeometry args={[0.64, 28, 22]} />
        <meshStandardMaterial ref={bodyMat} color={MONSTER_COLORS[0]} roughness={0.5} />
      </mesh>
      {/* Abir's face, wrapped onto the front of the head */}
      <mesh position={[0, 0.55, 0]} scale={[1, 1.05, 1]} renderOrder={2}>
        <sphereGeometry args={[0.66, 40, 32, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 1.2, 1.9]} />
        <meshBasicMaterial ref={faceMat} map={tex} transparent alphaTest={0.02} toneMapped={false} />
      </mesh>
      {/* horns + ears */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[sd * 0.38, 1.15, 0]} rotation={[0, 0, -sd * 0.45]}>
            <coneGeometry args={[0.12, 0.34, 10]} />
            <meshStandardMaterial color="#fde68a" roughness={0.4} />
          </mesh>
          <mesh position={[sd * 0.6, 0.4, 0.05]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#fde68a" roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* dizzy stars when bonked */}
      <group ref={stars} position={[0, 1.35, 0]} visible={false}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[Math.cos((k * Math.PI * 2) / 3) * 0.5, 0.05 * k, Math.sin((k * Math.PI * 2) / 3) * 0.5]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Hole({
  i,
  slots,
  onHit,
  tex,
}: {
  i: number;
  slots: React.MutableRefObject<Slot[]>;
  onHit: (i: number) => void;
  tex: THREE.Texture;
}) {
  const mon = useRef<THREE.Group>(null!);
  const hole = HOLES[i];

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = slots.current[i];
    const up = s.life > 0 || s.hit > 0;
    const targetY = up ? 0 : -1.6;
    const g = mon.current;
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, 1 - Math.pow(0.0005, dt));
    g.scale.y = s.hit > 0 ? 0.6 : THREE.MathUtils.lerp(g.scale.y, 1, 0.25);
    g.scale.x = g.scale.z = s.hit > 0 ? 1.2 : 1;
    g.visible = g.position.y > -1.55;
  });

  return (
    <group position={[hole.x, 0, hole.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.85, 32]} />
        <meshBasicMaterial color="#3b1d0e" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[1, 1, 0.45]}>
        <torusGeometry args={[0.88, 0.14, 12, 32]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <group ref={mon} position={[0, -1.6, 0]}>
        <Monster i={i} slots={slots} tex={tex} />
      </group>
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

function Field() {
  const { active, addScore } = useGame();
  const fit = useFit(6.6, 6);
  const slots = useRef<Slot[]>(Array.from({ length: 9 }, () => ({ life: 0, hit: 0, type: 0 })));
  const timers = useRef({ spawn: 0.6, elapsed: 0 });
  const { spawn, node } = useBursts();
  const tex = useTexture(FACE_URL, (t) => {
    (t as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
  }) as THREE.Texture;

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
        <Hole key={i} i={i} slots={slots} onHit={onHit} tex={tex} />
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
