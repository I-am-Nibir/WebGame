"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ico } from "@/components/ui/Icons";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import Scene3D from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

const LANES = [-2.4, 0, 2.4];
const SPAWN_Z = -48;
let uid = 0;

interface Obj {
  id: number;
  kind: "ast" | "star";
  lane: number;
  scale: number;
}

function Rocket({ rocketX, invuln }: { rocketX: React.MutableRefObject<number>; invuln: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Group>(null!);
  const flame = useRef<THREE.Mesh>(null!);
  const prevX = useRef(0);

  useFrame((state, dt) => {
    const g = ref.current;
    g.position.x = rocketX.current;
    g.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -(rocketX.current - prevX.current) * 12, 0.2);
    prevX.current = rocketX.current;
    g.visible = invuln.current <= 0 || Math.floor(state.clock.elapsedTime * 10) % 2 === 0;
    flame.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 40) * 0.25;
    void dt;
  });

  return (
    <group ref={ref}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <capsuleGeometry args={[0.28, 0.8, 8, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <coneGeometry args={[0.28, 0.5, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.25, 0.25]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
          <mesh key={a} position={[Math.sin(a) * 0.32, -0.45, Math.cos(a) * 0.32]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.3]} />
            <meshStandardMaterial color="#ef4444" roughness={0.5} />
          </mesh>
        ))}
        <mesh ref={flame} position={[0, -1.05, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.6, 12]} />
          <meshBasicMaterial color="#fb923c" />
        </mesh>
      </group>
    </group>
  );
}

function Thing({
  o,
  speed,
  rocketX,
  onHit,
  onStar,
  onGone,
}: {
  o: Obj;
  speed: React.MutableRefObject<number>;
  rocketX: React.MutableRefObject<number>;
  onHit: (x: number, y: number) => void;
  onStar: (x: number, y: number) => void;
  onGone: (id: number) => void;
}) {
  const ref = useRef<THREE.Group>(null!);
  const dead = useRef(false);
  const { active } = useGame();
  const x = LANES[o.lane];
  const starGeo = useMemo(() => (o.kind === "star" ? makeStarGeometry(0.4, 0.18, 0.14) : null), [o.kind]);
  const astGeo = useMemo(() => (o.kind === "ast" ? new THREE.IcosahedronGeometry(0.75, 1) : null), [o.kind]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (dead.current) return;
    g.rotation.y += dt * (o.kind === "star" ? 2.5 : 0.9);
    g.rotation.x += dt * (o.kind === "star" ? 0 : 0.6);
    if (!active) return;
    g.position.z += speed.current * Math.min(dt, 0.05);
    const z = g.position.z;
    if (z > -0.8 && z < 0.8 && Math.abs(x - rocketX.current) < 0.95) {
      dead.current = true;
      g.visible = false;
      if (o.kind === "star") onStar(x, 0.5);
      else onHit(x, 0.5);
    } else if (z > 6) {
      dead.current = true;
      onGone(o.id);
    }
  });

  return (
    <group ref={ref} position={[x, 0.5, SPAWN_Z]} scale={o.scale}>
      {o.kind === "star" ? (
        <mesh geometry={starGeo ?? undefined}>
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.7} />
        </mesh>
      ) : (
        <mesh geometry={astGeo ?? undefined}>
          <meshStandardMaterial color="#8b6f5a" roughness={0.9} flatShading />
        </mesh>
      )}
    </group>
  );
}

function Field({ laneRef, onHurt }: { laneRef: React.MutableRefObject<number>; onHurt: () => void }) {
  const { active, addScore } = useGame();
  const [list, setList] = useState<Obj[]>([]);
  const rocketX = useRef(0);
  const speed = useRef(14);
  const invuln = useRef(0);
  const timers = useRef({ row: 0.5, elapsed: 0 });
  const { spawn, node } = useBursts();

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    rocketX.current += (LANES[laneRef.current] - rocketX.current) * Math.min(1, dt * 10);
    invuln.current = Math.max(0, invuln.current - dt);
    if (!active) return;
    const t = timers.current;
    t.elapsed += dt;
    speed.current = 14 + Math.min(8, t.elapsed * 0.2);
    t.row -= dt;
    if (t.row <= 0) {
      t.row = Math.max(0.5, 0.95 - t.elapsed * 0.008);
      const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
      const rows: Obj[] = [{ id: ++uid, kind: "ast", lane: lanes[0], scale: 0.9 + Math.random() * 0.4 }];
      let free = lanes[1];
      if (t.elapsed > 10 && Math.random() < 0.4) {
        rows.push({ id: ++uid, kind: "ast", lane: lanes[1], scale: 0.9 + Math.random() * 0.4 });
        free = lanes[2];
      }
      if (Math.random() < 0.85) rows.push({ id: ++uid, kind: "star", lane: free, scale: 1 });
      setList((p) => [...p, ...rows]);
    }
  });

  const onHit = useCallback(
    (x: number, y: number) => {
      if (invuln.current > 0) return;
      invuln.current = 1.2;
      sounds.thud();
      spawn(x, y, 0, "#a8a29e", 18);
      onHurt();
    },
    [spawn, onHurt]
  );
  const onStar = useCallback(
    (x: number, y: number) => {
      sounds.star();
      spawn(x, y, 0, "#fde047", 16);
      addScore(10);
    },
    [spawn, addScore]
  );
  const onGone = useCallback((id: number) => setList((p) => p.filter((o) => o.id !== id)), []);

  return (
    <>
      <Stars radius={60} depth={50} count={1500} factor={4} fade speed={1} />
      {/* far-away planets */}
      <mesh position={[-14, 4, -40]}>
        <sphereGeometry args={[4, 24, 24]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.8} />
      </mesh>
      <mesh position={[16, 6, -50]}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial color="#f97316" roughness={0.8} />
      </mesh>
      {/* lane guides */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.2, -20]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 60]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.35} />
        </mesh>
      ))}
      <Rocket rocketX={rocketX} invuln={invuln} />
      {list.map((o) => (
        <Thing key={o.id} o={o} speed={speed} rocketX={rocketX} onHit={onHit} onStar={onStar} onGone={onGone} />
      ))}
      {node}
    </>
  );
}

export default function SpaceRun() {
  const { active, finish } = useGame();
  const lane = useRef(1);
  const [lives, setLives] = useState(3);
  const livesRef = useRef(3);

  const onHurt = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) setTimeout(finish, 400);
  }, [finish]);

  const move = useCallback(
    (dir: -1 | 1) => {
      if (!active) return;
      const next = Math.max(0, Math.min(2, lane.current + dir));
      if (next !== lane.current) {
        lane.current = next;
        sounds.whoosh();
      }
    },
    [active]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") move(-1);
      if (e.key === "ArrowRight" || e.key === "d") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div
      className="absolute inset-0"
      onPointerDown={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        move(e.clientX - r.left < r.width / 2 ? -1 : 1);
      }}
    >
      <Scene3D cameraPosition={[0, 2.8, 7.5]} lookAt={[0, 0.4, -8]} fov={60}>
        <Field laneRef={lane} onHurt={onHurt} />
      </Scene3D>
      <div className="absolute left-3 top-3 flex gap-1 text-3xl pointer-events-none" aria-label={`${lives} জীবন`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < lives ? "" : "grayscale opacity-30"}>
            <Ico n="❤️" size={34} />
          </span>
        ))}
      </div>
      <div className="absolute bottom-4 inset-x-4 flex justify-between text-5xl text-white/40 pointer-events-none">
        <span>◀</span>
        <span>▶</span>
      </div>
    </div>
  );
}
