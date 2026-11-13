"use client";

import React, { useCallback, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";

const BODY = "#ff8fb8";
const BODY_DARK = "#f5709f";
const INNER = "#ffc7dd";

const MESSAGES = [
  "হাই মাইশা! 👋",
  "চলো খেলি! 🎮",
  "হি হি, সুড়সুড়ি লাগে! 🤭",
  "আমাকে আবার ছোঁও! 💖",
  "তুমি দারুণ খেলো! ⭐",
];

function Mascot({ onTap }: { onTap: () => void }) {
  const root = useRef<THREE.Group>(null!);
  const look = useRef<THREE.Group>(null!);
  const eyeL = useRef<THREE.Group>(null!);
  const eyeR = useRef<THREE.Group>(null!);
  const pupilL = useRef<THREE.Group>(null!);
  const pupilR = useRef<THREE.Group>(null!);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const mouth = useRef<THREE.Mesh>(null!);
  const shadow = useRef<THREE.Mesh>(null!);
  const st = useRef({ y: 0, vy: 0, land: 0, happy: 0, blink: 0, nextBlink: 2 });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const s = st.current;
    const p = state.pointer;

    // jump physics
    if (s.y > 0 || s.vy > 0) {
      s.vy -= 22 * dt;
      s.y += s.vy * dt;
      if (s.y <= 0) {
        s.y = 0;
        if (s.vy < -2) s.land = 0.22;
        s.vy = 0;
      }
    }
    s.land = Math.max(0, s.land - dt * 0.8);
    s.happy = Math.max(0, s.happy - dt);
    s.nextBlink -= dt;
    if (s.nextBlink < 0) {
      s.blink = 0.12;
      s.nextBlink = 2 + Math.random() * 2.5;
    }
    s.blink = Math.max(0, s.blink - dt);

    // body: idle bob + squash & stretch
    const bob = Math.sin(t * 2) * 0.06;
    const sy = 1 + Math.min(Math.abs(s.vy), 8) * 0.014 - s.land * Math.sin((s.land / 0.22) * Math.PI);
    const sx = 1 / Math.sqrt(sy);
    root.current.position.y = -0.4 + s.y + bob;
    root.current.scale.set(sx, sy, sx);

    // look at pointer
    look.current.rotation.y = THREE.MathUtils.lerp(look.current.rotation.y, p.x * 0.45, 0.1);
    look.current.rotation.x = THREE.MathUtils.lerp(look.current.rotation.x, -p.y * 0.25, 0.1);
    [pupilL, pupilR].forEach((ref) => {
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, p.x * 0.07, 0.2);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, p.y * 0.06, 0.2);
    });

    // blink / happy squint
    const eyeTarget = s.happy > 0 ? 0.3 : s.blink > 0 ? 0.08 : 1;
    [eyeL, eyeR].forEach((ref) => {
      ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, eyeTarget, 0.4);
    });
    const mouthTarget = s.happy > 0 ? 1.5 : 1;
    mouth.current.scale.setScalar(THREE.MathUtils.lerp(mouth.current.scale.x, mouthTarget, 0.2));

    // arms
    const wave = s.happy > 0 ? 1.2 + Math.sin(t * 14) * 0.35 : Math.sin(t * 2) * 0.08;
    armR.current.rotation.z = -0.45 - wave;
    armL.current.rotation.z = 0.45 + wave;

    shadow.current.scale.setScalar(1 - Math.min(s.y, 2) * 0.15);
  });

  const handleDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    st.current.vy = 7;
    st.current.happy = 1.4;
    onTap();
  };

  return (
    <group onPointerDown={handleDown}>
      <mesh ref={shadow} position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.25} />
      </mesh>

      <group ref={root}>
        {/* feet */}
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, -1.2, 0.35]} scale={[1, 0.55, 1.25]}>
            <sphereGeometry args={[0.38, 24, 24]} />
            <meshStandardMaterial color={BODY_DARK} roughness={0.5} />
          </mesh>
        ))}

        {/* arms */}
        <group ref={armL} position={[-1.15, -0.25, 0.2]}>
          <mesh position={[-0.2, -0.15, 0]} rotation={[0, 0, 0.5]}>
            <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
            <meshStandardMaterial color={BODY_DARK} roughness={0.5} />
          </mesh>
        </group>
        <group ref={armR} position={[1.15, -0.25, 0.2]}>
          <mesh position={[0.2, -0.15, 0]} rotation={[0, 0, -0.5]}>
            <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
            <meshStandardMaterial color={BODY_DARK} roughness={0.5} />
          </mesh>
        </group>

        <group ref={look}>
          {/* head/body */}
          <mesh>
            <sphereGeometry args={[1.25, 48, 48]} />
            <meshPhysicalMaterial color={BODY} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.4} />
          </mesh>

          {/* ears */}
          {[-1, 1].map((side) => (
            <group key={side} position={[side * 0.62, 1.1, 0]} rotation={[0, 0, -side * 0.28]}>
              <mesh>
                <capsuleGeometry args={[0.22, 0.7, 8, 16]} />
                <meshStandardMaterial color={BODY} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0, 0.1]} scale={[0.6, 0.9, 0.6]}>
                <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
                <meshStandardMaterial color={INNER} roughness={0.6} />
              </mesh>
            </group>
          ))}

          {/* eyes */}
          {[
            { x: -0.42, ref: eyeL, pupil: pupilL },
            { x: 0.42, ref: eyeR, pupil: pupilR },
          ].map(({ x, ref, pupil }) => (
            <group key={x} ref={ref} position={[x, 0.22, 1.02]}>
              <mesh scale={[1, 1, 0.55]}>
                <sphereGeometry args={[0.27, 24, 24]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              <group ref={pupil} position={[0, 0, 0.1]}>
                <mesh scale={[1, 1, 0.6]}>
                  <sphereGeometry args={[0.15, 20, 20]} />
                  <meshBasicMaterial color="#1e1b4b" />
                </mesh>
                <mesh position={[0.05, 0.06, 0.1]}>
                  <sphereGeometry args={[0.045, 12, 12]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            </group>
          ))}

          {/* cheeks */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.78, -0.12, 0.93]} rotation={[0, side * 0.7, 0]} scale={[1, 0.65, 0.4]}>
              <sphereGeometry args={[0.19, 20, 20]} />
              <meshStandardMaterial color="#ff5c8a" roughness={0.6} />
            </mesh>
          ))}

          {/* nose + smile */}
          <mesh position={[0, 0.02, 1.235]} scale={[1.3, 0.9, 0.7]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#be185d" roughness={0.4} />
          </mesh>
          <mesh ref={mouth} position={[0, -0.12, 1.22]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.2, 0.045, 12, 24, Math.PI]} />
            <meshStandardMaterial color="#9d174d" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function MascotCanvas({ paused = false }: { paused?: boolean }) {
  const [msg, setMsg] = useState("আমাকে ছুঁয়ে দেখো! 👆");
  const [msgKey, setMsgKey] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const claim = useGameStore((s) => s.claimMascotBonus);

  const onTap = useCallback(() => {
    sounds.giggle();
    const rect = wrapRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height * 0.4) / window.innerHeight }
      : { x: 0.5, y: 0.4 };
    if (claim()) {
      sounds.coin();
      setMsg("বোনাস! +৫ ⭐ কয়েন 🎉");
      confetti({ particleCount: 40, spread: 70, origin, zIndex: 40 });
    } else {
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      confetti({
        particleCount: 8,
        spread: 50,
        origin,
        scalar: 2,
        zIndex: 40,
        shapes: [confetti.shapeFromText({ text: "💖", scalar: 2 })],
      });
    }
    setMsgKey((k) => k + 1);
  }, [claim]);

  return (
    <div ref={wrapRef} className="relative w-full h-72 md:h-96 cursor-pointer">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.3, 7.4], fov: 40 }}
        frameloop={paused ? "never" : "always"}
        style={{ touchAction: "manipulation" }}
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={["#ffffff", "#c4b5fd", 0.7]} />
        <directionalLight position={[4, 6, 6]} intensity={1.8} />
        <pointLight position={[-4, -1, 3]} color="#a78bfa" intensity={25} />
        <Sparkles count={28} scale={[7, 4.5, 3]} size={5} speed={0.4} color="#fde047" />
        <Mascot onTap={onTap} />
      </Canvas>
      <AnimatePresence mode="wait">
        <motion.div
          key={msgKey}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute left-1/2 -translate-x-1/2 top-1 px-4 py-2 rounded-2xl bg-white text-purple-900 font-black text-base shadow-lg pointer-events-none whitespace-nowrap"
        >
          {msg}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
