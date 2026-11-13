import * as THREE from "three";

/** Chunky extruded 5-point star, centered at the origin. */
export function makeStarGeometry(outer = 0.5, inner = 0.22, depth = 0.16, points = 5) {
  const shape = new THREE.Shape();
  const total = points * 2;
  for (let i = 0; i < total; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / total) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  g.center();
  return g;
}
