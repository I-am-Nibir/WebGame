"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import Scene3D, { useFit } from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { Toy } from "@/components/3d/toy";
import { grassTexture, woodTexture } from "@/components/3d/textures";
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
  const bodyMat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const faceMat = useRef<THREE.MeshStandardMaterial>(null!);
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
      {/* fuzzy body: velvet sheen + soft clearcoat */}
      <mesh position={[0, 0.5, 0]} scale={[1, 1.05, 1]} castShadow>
        <sphereGeometry args={[0.64, 40, 32]} />
        <Toy ref={bodyMat} color={MONSTER_COLORS[0]} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.35} sheen={0.7} sheenRoughness={0.6} glow={0.12} />
      </mesh>
      {/* belly highlight */}
      <mesh position={[0, 0.3, 0.3]} scale={[1, 0.9, 0.7]}>
        <sphereGeometry args={[0.42, 24, 20]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06} roughness={1} depthWrite={false} />
      </mesh>
      {/* Abir's face, wrapped onto the front of the head (lit, so it sits in the scene) */}
      <mesh position={[0, 0.55, 0]} scale={[1, 1.05, 1]} renderOrder={2}>
        <sphereGeometry args={[0.66, 48, 40, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 1.2, 1.9]} />
        <meshStandardMaterial ref={faceMat} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.55} transparent alphaTest={0.02} />
      </mesh>
      {/* glossy horns + ears */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <mesh position={[sd * 0.38, 1.15, 0]} rotation={[0, 0, -sd * 0.45]} castShadow>
            <coneGeometry args={[0.12, 0.34, 20]} />
            <Toy color="#fde68a" roughness={0.2} glow={0.15} />
          </mesh>
          <mesh position={[sd * 0.6, 0.4, 0.05]} castShadow>
            <sphereGeometry args={[0.14, 20, 16]} />
            <Toy color="#fde68a" roughness={0.3} glow={0.15} />
          </mesh>
        </group>
      ))}
      {/* dizzy stars when bonked */}
      <group ref={stars} position={[0, 1.35, 0]} visible={false}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[Math.cos((k * Math.PI * 2) / 3) * 0.5, 0.05 * k, Math.sin((k * Math.PI * 2) / 3) * 0.5]}>
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={2.4} />
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
        <circleGeometry args={[0.85, 40]} />
        <meshStandardMaterial color="#1c0b04" roughness={1} />
      </mesh>
      {/* soft dirt mound around the hole */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} scale={[1, 1, 0.5]} castShadow receiveShadow>
        <torusGeometry args={[0.9, 0.17, 18, 40]} />
        <meshStandardMaterial color="#9a6a3a" roughness={0.95} />
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
  const grass = useMemo(() => grassTexture([3, 3]), []);
  const wood = useMemo(() => woodTexture("#b8793a", [6, 1]), []);
  const decor = useMemo(
    () => {
      const cols = ["#fb7185", "#fbbf24", "#f0abfc", "#ffffff", "#60a5fa"];
      return Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.1;
        const r = 3.7 + ((i * 37) % 10) / 10;
        return { x: Math.cos(a) * r, z: Math.sin(a) * r * 0.9, s: 0.8 + ((i * 53) % 10) / 14, c: cols[i % cols.length] };
      });
    },
    []
  );
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
      {/* striped lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5.2, 64]} />
        <meshStandardMaterial map={grass} roughness={0.95} />
      </mesh>
      {/* wooden rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <ringGeometry args={[5.15, 5.65, 64]} />
        <meshStandardMaterial map={wood} roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <circleGeometry args={[5.7, 64]} />
        <meshStandardMaterial color="#7c4a14" roughness={0.8} />
      </mesh>
      {decor.map((d, i) => (
        <group key={i} position={[d.x, 0, d.z]} scale={d.s}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.36, 6]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
          {[0, 1, 2, 3, 4].map((k) => (
            <mesh key={k} position={[Math.cos((k * Math.PI * 2) / 5) * 0.11, 0.4, Math.sin((k * Math.PI * 2) / 5) * 0.11]} castShadow>
              <sphereGeometry args={[0.085, 12, 10]} />
              <Toy color={d.c} roughness={0.4} glow={0.2} />
            </mesh>
          ))}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <Toy color="#fde047" glow={0.4} />
          </mesh>
        </group>
      ))}
      {HOLES.map((_, i) => (
        <Hole key={i} i={i} slots={slots} onHit={onHit} tex={tex} />
      ))}
      {node}
    </group>
  );
}

export default function WhackAMonster() {
  return (
    <Scene3D cameraPosition={[0, 6.2, 6.8]} lookAt={[0, 0, 0]} shadows mood="day" bloom={0.4}>
      <Field />
    </Scene3D>
  );
}
