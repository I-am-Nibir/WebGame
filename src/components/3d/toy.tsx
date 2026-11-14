"use client";

import React from "react";
import type { MeshPhysicalMaterialProps } from "@react-three/fiber";
import * as THREE from "three";

/** Glossy "toy plastic" material: soft clearcoat, a velvet sheen and a gentle self-glow so colours stay rich in shadow. */
export const Toy = React.forwardRef<THREE.MeshPhysicalMaterial, MeshPhysicalMaterialProps & { glow?: number }>(function Toy(
  { color = "#ffffff", glow = 0.06, ...rest },
  ref
) {
  return (
    <meshPhysicalMaterial
      ref={ref}
      color={color}
      roughness={0.26}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      sheen={0.5}
      sheenRoughness={0.4}
      sheenColor={color}
      emissive={color}
      emissiveIntensity={glow}
      envMapIntensity={1}
      {...rest}
    />
  );
});

/** Shiny metal (screws, rocket hull, trim). */
export const Metal = React.forwardRef<THREE.MeshStandardMaterial, React.ComponentProps<"meshStandardMaterial">>(function Metal(props, ref) {
  return <meshStandardMaterial ref={ref} roughness={0.22} metalness={1} envMapIntensity={1.4} {...props} />;
});
