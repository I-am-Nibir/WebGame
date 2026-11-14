"use client";

import React, { useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useContextBridge, Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { GameCtx } from "@/components/ui/GameShell";

/** Scale factor so content of w x h world units always fits the visible area. */
export function useFit(w: number, h: number) {
  const v = useThree((s) => s.viewport);
  return Math.min(1, v.width / w, v.height / h);
}

type Mood = "day" | "space" | "toy";

interface Props {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  lookAt?: [number, number, number];
  fov?: number;
  /** soft real-time shadows (use when there is a surface to catch them) */
  shadows?: boolean;
  /** glow strength of bright things (stars, flames, highlights) */
  bloom?: number;
  mood?: Mood;
}

const MOODS: Record<Mood, { key: string; rim: string; top: string; side1: string; side2: string; ground: string; fill: number }> = {
  day: { key: "#fff4e0", rim: "#bfdbfe", top: "#ffffff", side1: "#fde68a", side2: "#c4b5fd", ground: "#f9a8d4", fill: 0.3 },
  toy: { key: "#fff1dd", rim: "#c4b5fd", top: "#ffffff", side1: "#fef3c7", side2: "#a5b4fc", ground: "#fbcfe8", fill: 0.28 },
  space: { key: "#e9e2ff", rim: "#67e8f9", top: "#c7d2fe", side1: "#f0abfc", side2: "#38bdf8", ground: "#6d28d9", fill: 0.3 },
};

/** Studio-style lighting: image-based reflections built from soft boxes (nothing is downloaded), a key light with soft shadow and a coloured rim light. */
function Rig({ shadows, mood }: { shadows: boolean; mood: Mood }) {
  const m = MOODS[mood];
  return (
    <>
      <Environment resolution={256} frames={1} environmentIntensity={mood === "space" ? 0.8 : 0.7}>
        <color attach="background" args={["#6b6b8a"]} />
        <Lightformer form="rect" intensity={3.2} color={m.top} position={[0, 7, 1]} rotation-x={Math.PI / 2} scale={[14, 7, 1]} />
        <Lightformer form="rect" intensity={2.2} color={m.side1} position={[-8, 2, 2]} rotation-y={Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} color={m.side2} position={[8, 2, 3]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
        <Lightformer form="ring" intensity={2.6} color="#ffffff" position={[0, 2, 9]} scale={5} />
        <Lightformer form="rect" intensity={1.2} color={m.ground} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[16, 10, 1]} />
      </Environment>
      <hemisphereLight args={["#ffffff", m.ground, m.fill]} />
      <directionalLight
        position={[4, 9, 6]}
        intensity={1.5}
        color={m.key}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={5}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <directionalLight position={[-6, 3, -6]} intensity={1.4} color={m.rim} />
    </>
  );
}

/** Shared, mobile-friendly r3f canvas used by every 3D game. */
export default function Scene3D({ children, cameraPosition = [0, 0, 9], lookAt = [0, 0, 0], fov = 45, shadows = false, bloom = 0.45, mood = "toy" }: Props) {
  const Bridge = useContextBridge(GameCtx);
  const [cx, cy, cz] = cameraPosition;
  const camera = useMemo(() => ({ position: [cx, cy, cz] as [number, number, number], fov }), [cx, cy, cz, fov]);
  // if the device struggles, quietly drop the post effects so the game stays smooth
  const [fancy, setFancy] = useState(true);
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={camera}
        shadows={shadows ? "soft" : false}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ camera: cam }) => cam.lookAt(...lookAt)}
        style={{ touchAction: "none" }}
      >
        <PerformanceMonitor onDecline={() => setFancy(false)} flipflops={2} />
        <Rig shadows={shadows} mood={mood} />
        <Bridge>{children}</Bridge>
        {fancy ? (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur intensity={bloom} luminanceThreshold={1.05} luminanceSmoothing={0.2} radius={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        ) : (
          <></>
        )}
      </Canvas>
    </div>
  );
}
