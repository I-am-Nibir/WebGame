"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { sounds } from "@/lib/audioEngine";
import { useGameStore } from "@/lib/store";
import confetti from "canvas-confetti";

function Creature() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const addCoins = useGameStore((state) => state.addCoins);

  useFrame((state) => {
    const mouseX = (state.pointer.x * Math.PI) / 8;
    const mouseY = (state.pointer.y * Math.PI) / 8;
    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouseX, 0.08);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -mouseY, 0.08);
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    sounds.playPop();
    addCoins(10);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    if (meshRef.current) {
      meshRef.current.scale.set(1.25, 0.8, 1.25);
      setTimeout(() => {
        if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
      }, 150);
    }
  };

  return (
    <Float speed={3.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.35, 64, 64]} onClick={handleClick} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#ff6b9d"
          attach="material"
          distort={0.25}
          speed={2}
          roughness={0.15}
          metalness={0.05}
        />
        {/* Cartoon Eyes */}
        <Sphere args={[0.28, 32, 32]} position={[-0.45, 0.3, 1.1]}>
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
          <Sphere args={[0.13, 32, 32]} position={[0, 0, 0.2]}>
            <meshBasicMaterial color="#1e1b4b" />
          </Sphere>
        </Sphere>
        <Sphere args={[0.28, 32, 32]} position={[0.45, 0.3, 1.1]}>
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
          <Sphere args={[0.13, 32, 32]} position={[0, 0, 0.2]}>
            <meshBasicMaterial color="#1e1b4b" />
          </Sphere>
        </Sphere>
      </Sphere>
    </Float>
  );
}

export default function MascotCanvas() {
  return (
    <div className="w-full h-80 relative cursor-pointer">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <pointLight position={[-4, -2, 2]} color="#a78bfa" intensity={1} />
        <Creature />
      </Canvas>
    </div>
  );
}
