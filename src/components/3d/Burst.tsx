"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BurstData {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  count: number;
}

const dummy = new THREE.Object3D();
const LIFE = 0.7;
let burstId = 0;

function BurstItem({ burst, onDone }: { burst: BurstData; onDone: (id: number) => void }) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const age = useRef(0);
  const done = useRef(false);
  const data = useMemo(
    () =>
      Array.from({ length: burst.count }, () => ({
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.1) * 5,
        vz: (Math.random() - 0.5) * 3,
        s: 0.08 + Math.random() * 0.1,
      })),
    [burst]
  );

  useFrame((_, dt) => {
    age.current += Math.min(dt, 0.05);
    const t = age.current;
    data.forEach((d, i) => {
      dummy.position.set(burst.x + d.vx * t, burst.y + d.vy * t - 4 * t * t, burst.z + d.vz * t);
      dummy.scale.setScalar(d.s * Math.max(0, 1 - t / LIFE));
      dummy.rotation.set(t * 6, t * 4, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (t > LIFE && !done.current) {
      done.current = true;
      onDone(burst.id);
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, burst.count]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={burst.color} />
    </instancedMesh>
  );
}

/** Little confetti-style particle bursts. Render `node` inside a Canvas, call `spawn` to fire one. */
export function useBursts() {
  const [bursts, setBursts] = useState<BurstData[]>([]);
  const spawn = useCallback((x: number, y: number, z: number, color: string, count = 14) => {
    setBursts((b) => [...b.slice(-6), { id: ++burstId, x, y, z, color, count }]);
  }, []);
  const remove = useCallback((id: number) => setBursts((b) => b.filter((x) => x.id !== id)), []);
  const node = (
    <>
      {bursts.map((b) => (
        <BurstItem key={b.id} burst={b} onDone={remove} />
      ))}
    </>
  );
  return { spawn, node };
}
