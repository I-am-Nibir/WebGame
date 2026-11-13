"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Scene3D, { useFit } from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { makeStarGeometry } from "@/components/3d/shapes";
import { useGame } from "@/components/ui/GameShell";
import { sounds } from "@/lib/audioEngine";

const N = 6; // cells per side
const T = 0.14; // wall thickness
const R = 0.22; // marble radius
const G = 9; // "gravity"
const MAX_TILT = 0.38;

interface Wall {
  x: number;
  z: number;
  hx: number;
  hz: number;
}

const cx = (c: number) => c - N / 2 + 0.5;
const cz = (r: number) => r - N / 2 + 0.5;

function buildMaze() {
  const h = Array.from({ length: N + 1 }, () => Array<boolean>(N).fill(true));
  const v = Array.from({ length: N }, () => Array<boolean>(N + 1).fill(true));
  const seen = Array.from({ length: N }, () => Array<boolean>(N).fill(false));
  const stack: [number, number][] = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = (
      [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ] as [number, number][]
    ).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && !seen[a][b]);
    if (!nb.length) {
      stack.pop();
      continue;
    }
    const [a, b] = nb[Math.floor(Math.random() * nb.length)];
    if (a === r - 1) h[r][c] = false;
    else if (a === r + 1) h[r + 1][c] = false;
    else if (b === c - 1) v[r][c] = false;
    else v[r][c + 1] = false;
    seen[a][b] = true;
    stack.push([a, b]);
  }
  // a few extra openings so little kids have shortcuts
  for (let k = 0; k < 5; k++) {
    h[1 + Math.floor(Math.random() * (N - 1))][Math.floor(Math.random() * N)] = false;
    v[Math.floor(Math.random() * N)][1 + Math.floor(Math.random() * (N - 1))] = false;
  }
  const walls: Wall[] = [];
  for (let r = 0; r <= N; r++)
    for (let c = 0; c < N; c++) if (h[r][c]) walls.push({ x: c - N / 2 + 0.5, z: r - N / 2, hx: 0.5 + T / 2, hz: T / 2 });
  for (let r = 0; r < N; r++)
    for (let c = 0; c <= N; c++) if (v[r][c]) walls.push({ x: c - N / 2, z: r - N / 2 + 0.5, hx: T / 2, hz: 0.5 + T / 2 });

  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) if (!((r === 0 && c === 0) || (r === N - 1 && c === N - 1))) cells.push([r, c]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  const stars = cells.slice(0, 3).map(([r, c]) => ({ x: cx(c), z: cz(r) }));
  return { walls, stars };
}

const dummy = new THREE.Object3D();

function Walls({ walls }: { walls: Wall[] }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    walls.forEach((w, i) => {
      dummy.position.set(w.x, 0.2, w.z);
      dummy.scale.set(w.hx * 2, 0.4, w.hz * 2);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [walls]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, walls.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#f9a8d4" roughness={0.5} />
    </instancedMesh>
  );
}

function Field() {
  const { active, addScore, finish, timeLeftRef } = useGame();
  const gl = useThree((s) => s.gl);
  const fit = useFit(7.2, 7);
  const { walls, stars } = useMemo(buildMaze, []);
  const { spawn, node } = useBursts();

  const board = useRef<THREE.Group>(null!);
  const marbleMesh = useRef<THREE.Mesh>(null!);
  const starRefs = useRef<(THREE.Mesh | null)[]>([]);
  const got = useRef<boolean[]>([false, false, false]);
  const done = useRef(false);
  const marble = useRef({ x: cx(0), z: cz(0), vx: 0, vz: 0 });
  const tilt = useRef({ x: 0, z: 0 });
  const target = useRef({ x: 0, z: 0 });
  const keys = useRef({ l: false, r: false, u: false, d: false });
  const starGeo = useMemo(() => makeStarGeometry(0.22, 0.1, 0.08), []);
  const goal = useMemo(() => ({ x: cx(N - 1), z: cz(N - 1) }), []);

  // drag-to-tilt joystick (works with touch and mouse) + keyboard
  useEffect(() => {
    const el = gl.domElement;
    let origin: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      origin = { x: e.clientX, y: e.clientY };
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!origin) return;
      const scale = Math.min(el.clientWidth, el.clientHeight) * 0.2;
      const dx = THREE.MathUtils.clamp((e.clientX - origin.x) / scale, -1, 1);
      const dy = THREE.MathUtils.clamp((e.clientY - origin.y) / scale, -1, 1);
      target.current.z = -MAX_TILT * dx;
      target.current.x = MAX_TILT * dy;
    };
    const up = () => {
      origin = null;
      target.current.x = 0;
      target.current.z = 0;
    };
    const setKey = (e: KeyboardEvent, v: boolean) => {
      const k = keys.current;
      if (e.key === "ArrowLeft" || e.key === "a") k.l = v;
      if (e.key === "ArrowRight" || e.key === "d") k.r = v;
      if (e.key === "ArrowUp" || e.key === "w") k.u = v;
      if (e.key === "ArrowDown" || e.key === "s") k.d = v;
    };
    const kd = (e: KeyboardEvent) => setKey(e, true);
    const ku = (e: KeyboardEvent) => setKey(e, false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [gl]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const k = keys.current;
    const kx = (k.r ? 1 : 0) - (k.l ? 1 : 0);
    const ky = (k.d ? 1 : 0) - (k.u ? 1 : 0);
    const tx = kx || ky ? MAX_TILT * ky : target.current.x;
    const tz = kx || ky ? -MAX_TILT * kx : target.current.z;
    const sm = Math.min(1, dt * 9);
    tilt.current.x += (tx - tilt.current.x) * sm;
    tilt.current.z += (tz - tilt.current.z) * sm;
    board.current.rotation.x = tilt.current.x;
    board.current.rotation.z = tilt.current.z;

    // spin collectibles
    starRefs.current.forEach((s) => {
      if (s) s.rotation.y += dt * 2;
    });

    if (!active || done.current) return;

    const m = marble.current;
    const ax = -G * Math.sin(tilt.current.z);
    const az = G * Math.sin(tilt.current.x);
    const steps = 3;
    const h = dt / steps;
    for (let s = 0; s < steps; s++) {
      m.vx += ax * h;
      m.vz += az * h;
      const damp = Math.max(0, 1 - 1.1 * h);
      m.vx *= damp;
      m.vz *= damp;
      const sp = Math.hypot(m.vx, m.vz);
      if (sp > 5) {
        m.vx *= 5 / sp;
        m.vz *= 5 / sp;
      }
      m.x += m.vx * h;
      m.z += m.vz * h;

      for (const w of walls) {
        const px = THREE.MathUtils.clamp(m.x, w.x - w.hx, w.x + w.hx);
        const pz = THREE.MathUtils.clamp(m.z, w.z - w.hz, w.z + w.hz);
        let dx = m.x - px;
        let dz = m.z - pz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= R * R) continue;
        let nx: number;
        let nz: number;
        let push: number;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          nx = dx / d;
          nz = dz / d;
          push = R - d;
        } else {
          // center is inside the wall: push out along the shallowest axis
          dx = (m.x - w.x) / w.hx;
          dz = (m.z - w.z) / w.hz;
          if (Math.abs(dx) > Math.abs(dz)) {
            nx = Math.sign(dx) || 1;
            nz = 0;
            push = w.hx + R - Math.abs(m.x - w.x);
          } else {
            nx = 0;
            nz = Math.sign(dz) || 1;
            push = w.hz + R - Math.abs(m.z - w.z);
          }
        }
        m.x += nx * push;
        m.z += nz * push;
        const vn = m.vx * nx + m.vz * nz;
        if (vn < 0) {
          m.vx -= 1.3 * vn * nx;
          m.vz -= 1.3 * vn * nz;
        }
      }
    }

    marbleMesh.current.position.set(m.x, R + 0.02, m.z);
    marbleMesh.current.rotation.x += (m.vz * dt) / R;
    marbleMesh.current.rotation.z -= (m.vx * dt) / R;

    // collect stars
    stars.forEach((st, i) => {
      if (got.current[i]) return;
      if (Math.hypot(m.x - st.x, m.z - st.z) < 0.38) {
        got.current[i] = true;
        const mesh = starRefs.current[i];
        if (mesh) mesh.visible = false;
        sounds.star();
        addScore(10);
        spawn(st.x, 0.5, st.z, "#fde047", 16);
      }
    });

    // reached the goal
    if (Math.hypot(m.x - goal.x, m.z - goal.z) < 0.3) {
      done.current = true;
      sounds.coin();
      spawn(goal.x, 0.5, goal.z, "#fbbf24", 24);
      addScore(30 + Math.round(timeLeftRef.current / 2));
      setTimeout(finish, 500);
    }
    void state;
  });

  return (
    <group scale={fit}>
      <group ref={board}>
        {/* base */}
        <RoundedBox args={[N + 0.7, 0.4, N + 0.7]} radius={0.15} position={[0, -0.2, 0]}>
          <meshStandardMaterial color="#6d28d9" roughness={0.6} />
        </RoundedBox>
        {/* floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <planeGeometry args={[N, N]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        <Walls walls={walls} />

        {/* start pad */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx(0), 0.012, cz(0)]}>
          <circleGeometry args={[0.38, 24]} />
          <meshBasicMaterial color="#86efac" />
        </mesh>
        {/* goal hole */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[goal.x, 0.014, goal.z]}>
          <circleGeometry args={[0.3, 24]} />
          <meshBasicMaterial color="#1e1b4b" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[goal.x, 0.02, goal.z]}>
          <torusGeometry args={[0.34, 0.05, 8, 28]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>

        {stars.map((st, i) => (
          <mesh
            key={i}
            ref={(el) => {
              starRefs.current[i] = el;
            }}
            geometry={starGeo}
            position={[st.x, 0.4, st.z]}
          >
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
          </mesh>
        ))}

        <mesh ref={marbleMesh} position={[cx(0), R + 0.02, cz(0)]}>
          <sphereGeometry args={[R, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.4} />
        </mesh>
        {node}
      </group>
    </group>
  );
}

export default function MarbleMaze() {
  return (
    <>
      <Scene3D cameraPosition={[0, 9, 5.5]} lookAt={[0, 0, 0]}>
        <Field />
      </Scene3D>
      <div className="absolute bottom-3 inset-x-0 text-center text-white/90 font-bold pointer-events-none text-sm">
        👆 আঙুল টেনে বোর্ড হেলাও
      </div>
    </>
  );
}
