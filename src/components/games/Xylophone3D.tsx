"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import Scene3D, { useFit } from "@/components/3d/Scene3D";
import { useBursts } from "@/components/3d/Burst";
import { sounds } from "@/lib/audioEngine";

const NOTES = [
  { label: "সা", freq: 261.63, color: "#ef4444" },
  { label: "রে", freq: 293.66, color: "#f97316" },
  { label: "গা", freq: 329.63, color: "#facc15" },
  { label: "মা", freq: 349.23, color: "#22c55e" },
  { label: "পা", freq: 392.0, color: "#14b8a6" },
  { label: "ধা", freq: 440.0, color: "#3b82f6" },
  { label: "নি", freq: 493.88, color: "#6366f1" },
  { label: "সা", freq: 523.25, color: "#a855f7" },
];
/** "Twinkle Twinkle Little Star" as indices into NOTES */
const TWINKLE = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0];
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8"];

function layout(i: number, portrait: boolean) {
  if (portrait) {
    return { pos: [0, (3.5 - i) * 0.8, 0] as [number, number, number], dims: [3.0 - i * 0.12, 0.64, 0.4] as [number, number, number] };
  }
  return { pos: [(i - 3.5) * 0.98, 0, 0] as [number, number, number], dims: [0.8, 3.4 - i * 0.22, 0.4] as [number, number, number] };
}

function Bar({
  i,
  portrait,
  pressed,
  hint,
  onPlay,
}: {
  i: number;
  portrait: boolean;
  pressed: React.MutableRefObject<number[]>;
  hint: boolean;
  onPlay: (i: number) => void;
}) {
  const grp = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  const { pos, dims } = layout(i, portrait);
  const note = NOTES[i];

  useFrame((state, dt) => {
    const p = pressed.current[i];
    pressed.current[i] = Math.max(0, p - Math.min(dt, 0.05) * 4);
    grp.current.position.z = pos[2] - p * 0.2;
    const pulse = hint ? 0.35 + 0.3 * Math.sin(state.clock.elapsedTime * 6) : 0;
    mat.current.emissiveIntensity = Math.max(p * 0.9, pulse);
  });

  return (
    <group ref={grp} position={pos}>
      <RoundedBox
        args={dims}
        radius={0.12}
        smoothness={4}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPlay(i);
        }}
        onPointerOver={(e) => {
          if ((e.buttons ?? 0) > 0) onPlay(i);
        }}
      >
        <meshStandardMaterial ref={mat} color={note.color} emissive={note.color} emissiveIntensity={0} roughness={0.3} metalness={0.15} />
      </RoundedBox>
      {/* little screws */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={portrait ? [s * (dims[0] / 2 - 0.2), 0, 0.21] : [0, s * (dims[1] / 2 - 0.25), 0.21]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      ))}
      <Html center pointerEvents="none" position={[0, 0, 0.25]}>
        <span style={{ color: "white", fontWeight: 900, fontSize: 24, textShadow: "0 2px 4px rgba(0,0,0,.35)" }}>{note.label}</span>
      </Html>
    </group>
  );
}

function Field({
  pressed,
  hintIndex,
  playRef,
  onCorrect,
}: {
  pressed: React.MutableRefObject<number[]>;
  hintIndex: number;
  playRef: React.MutableRefObject<((i: number) => void) | null>;
  onCorrect: () => void;
}) {
  const size = useThree((s) => s.size);
  const portrait = size.width < size.height;
  // leave room at the bottom for the "learn the song" button
  const fit = useFit(portrait ? 3.5 : 9, portrait ? 8.6 : 5.6);
  const { spawn, node } = useBursts();

  const play = useCallback(
    (i: number) => {
      pressed.current[i] = 1;
      sounds.note(NOTES[i].freq);
      const { pos } = layout(i, portrait);
      spawn(pos[0] * fit, pos[1] * fit, 0.6, NOTES[i].color, 10);
      if (i === hintIndex) onCorrect();
    },
    [pressed, portrait, fit, spawn, hintIndex, onCorrect]
  );

  useEffect(() => {
    playRef.current = play;
  }, [play, playRef]);

  const plate = portrait ? ([3.6, 7.0, 0.2] as const) : ([8.4, 4.2, 0.2] as const);

  return (
    <>
      <group scale={fit}>
        <RoundedBox args={[plate[0], plate[1], plate[2]]} radius={0.25} position={[0, 0, -0.35]}>
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </RoundedBox>
        {NOTES.map((_, i) => (
          <Bar key={i} i={i} portrait={portrait} pressed={pressed} hint={hintIndex === i} onPlay={play} />
        ))}
      </group>
      <group scale={fit}>{node}</group>
    </>
  );
}

export default function Xylophone3D() {
  const pressed = useRef<number[]>(Array(8).fill(0));
  const playRef = useRef<((i: number) => void) | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [step, setStep] = useState(0);

  const hintIndex = hintOn ? TWINKLE[step % TWINKLE.length] : -1;
  const onCorrect = useCallback(() => setStep((s) => s + 1), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = KEYS.indexOf(e.key);
      if (i >= 0 && !e.repeat) playRef.current?.(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const key = useMemo(() => "xylo", []);

  return (
    <div className="absolute inset-0" key={key}>
      <Scene3D cameraPosition={[0, 0, 8]}>
        <Field pressed={pressed} hintIndex={hintIndex} playRef={playRef} onCorrect={onCorrect} />
      </Scene3D>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={() => {
            setHintOn((h) => !h);
            setStep(0);
            sounds.pop();
          }}
          className="pointer-events-auto px-6 py-3 rounded-2xl font-black text-lg text-purple-950 clay-btn-yellow"
        >
          🌟 তারার গান শেখো: {hintOn ? "চালু" : "বন্ধ"}
        </button>
      </div>
    </div>
  );
}
