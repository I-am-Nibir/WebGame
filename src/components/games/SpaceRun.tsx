"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Ico } from "@/components/ui/Icons";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import Scene3D from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { Toy, Metal } from "@/components/3d/toy";
import { planetTexture, rockTexture } from "@/components/3d/textures";
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
        {/* hull */}
        <mesh castShadow>
          <capsuleGeometry args={[0.28, 0.8, 12, 28]} />
          <meshPhysicalMaterial color="#f8fafc" roughness={0.18} metalness={0.35} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.3} />
        </mesh>
        {/* red stripes */}
        {[0.05, -0.18].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.285, 0.028, 10, 36]} />
            <Toy color="#ef4444" glow={0.2} />
          </mesh>
        ))}
        {/* nose cone */}
        <mesh position={[0, 0.92, 0]}>
          <coneGeometry args={[0.28, 0.55, 28]} />
          <Toy color="#ef4444" roughness={0.2} glow={0.25} />
        </mesh>
        {/* porthole: metal ring + glowing glass */}
        <mesh position={[0, 0.25, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.04, 12, 28]} />
          <Metal color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.25, 0.25]}>
          <sphereGeometry args={[0.13, 24, 20]} />
          <meshPhysicalMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.9} roughness={0.05} clearcoat={1} />
        </mesh>
        {/* fins */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a) => (
          <mesh key={a} position={[Math.sin(a) * 0.34, -0.45, Math.cos(a) * 0.34]} rotation={[0, a, 0]} castShadow>
            <boxGeometry args={[0.05, 0.42, 0.32]} />
            <Toy color="#ef4444" roughness={0.3} glow={0.2} />
          </mesh>
        ))}
        {/* engine nozzle */}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.18, 24]} />
          <Metal color="#94a3b8" />
        </mesh>
        {/* flame: hot core + orange halo (bright, so it blooms) */}
        <mesh ref={flame} position={[0, -1.05, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.17, 0.7, 20]} />
          <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={3} transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.09, 0.45, 16]} />
          <meshStandardMaterial color="#fffbeb" emissive="#fef3c7" emissiveIntensity={4} />
        </mesh>
        <pointLight position={[0, -1.1, 0]} color="#fb923c" intensity={2.2} distance={4} />
      </group>
    </group>
  );
}

let rockTex: THREE.Texture | null = null;
function useRock() {
  return useMemo(() => rockTex ?? (rockTex = rockTexture()), []);
}

/** Craggy asteroid: a subdivided icosahedron with its vertices pushed in and out. */
const rockCache: THREE.BufferGeometry[] = [];
function getRockGeo(i: number) {
  if (rockCache[i]) return rockCache[i];
  const g = new THREE.IcosahedronGeometry(0.75, 4);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let k = 0; k < pos.count; k++) {
    v.fromBufferAttribute(pos, k);
    const n = Math.sin(v.x * 4.1 + i) * Math.cos(v.y * 3.7 + i * 2) * 0.12 + Math.sin(v.z * 7.3 + i) * 0.05 + Math.sin((v.x + v.y) * 9) * 0.025;
    v.multiplyScalar(1 + n);
    pos.setXYZ(k, v.x, v.y * 0.92, v.z);
  }
  g.computeVertexNormals();
  rockCache[i] = g;
  return g;
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
  const rock = useRock();
  const astGeo = useMemo(() => (o.kind === "ast" ? getRockGeo(o.id % 4) : null), [o.kind, o.id]);

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
          <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} metalness={0.6} roughness={0.2} />
        </mesh>
      ) : (
        <mesh geometry={astGeo ?? undefined} castShadow>
          <meshStandardMaterial map={rock} bumpMap={rock} bumpScale={2.5} roughness={0.95} />
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
  const gas = useMemo(() => planetTexture(["#7c3aed", "#a78bfa", "#6d28d9", "#c4b5fd", "#5b21b6"]), []);
  const orange = useMemo(() => planetTexture(["#f97316", "#fb923c", "#ea580c", "#fdba74"]), []);
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
      <group position={[-14, 4, -40]} rotation={[0.3, 0, 0.2]}>
        <mesh>
          <sphereGeometry args={[4, 48, 36]} />
          <meshStandardMaterial map={gas} roughness={0.7} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[5.2, 7.4, 64]} />
          <meshStandardMaterial color="#f0abfc" side={THREE.DoubleSide} transparent opacity={0.65} roughness={0.8} />
        </mesh>
        {/* atmosphere glow */}
        <mesh scale={1.08}>
          <sphereGeometry args={[4, 32, 24]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.18} side={THREE.BackSide} />
        </mesh>
      </group>
      <group position={[16, 6, -50]}>
        <mesh>
          <sphereGeometry args={[3, 48, 36]} />
          <meshStandardMaterial map={orange} roughness={0.75} />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[3, 32, 24]} />
          <meshBasicMaterial color="#fdba74" transparent opacity={0.2} side={THREE.BackSide} />
        </mesh>
      </group>
      {/* lane guides */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.2, -20]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 60]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1.6} transparent opacity={0.5} />
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
  const t = useT();
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
      <Scene3D cameraPosition={[0, 2.8, 7.5]} lookAt={[0, 0.4, -8]} fov={60} mood="space" bloom={0.85}>
        <Field laneRef={lane} onHurt={onHurt} />
      </Scene3D>
      <div className="absolute left-3 top-3 flex gap-1 text-3xl pointer-events-none" aria-label={t(`${lives} জীবন`, `${lives} lives`)}>
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
