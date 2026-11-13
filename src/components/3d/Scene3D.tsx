"use client";

import React, { useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useContextBridge } from "@react-three/drei";
import { GameCtx } from "@/components/ui/GameShell";

/** Scale factor so content of w x h world units always fits the visible area. */
export function useFit(w: number, h: number) {
  const v = useThree((s) => s.viewport);
  return Math.min(1, v.width / w, v.height / h);
}

interface Props {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  lookAt?: [number, number, number];
  fov?: number;
}

/** Shared, mobile-friendly r3f canvas used by every 3D game. */
export default function Scene3D({ children, cameraPosition = [0, 0, 9], lookAt = [0, 0, 0], fov = 45 }: Props) {
  const Bridge = useContextBridge(GameCtx);
  const [cx, cy, cz] = cameraPosition;
  const camera = useMemo(() => ({ position: [cx, cy, cz] as [number, number, number], fov }), [cx, cy, cz, fov]);
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={camera}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ camera: cam }) => cam.lookAt(...lookAt)}
        style={{ touchAction: "none" }}
      >
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#ffffff", "#a78bfa", 0.6]} />
        <directionalLight position={[4, 8, 6]} intensity={1.6} />
        <Bridge>{children}</Bridge>
      </Canvas>
    </div>
  );
}
