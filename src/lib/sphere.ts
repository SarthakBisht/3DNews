import * as THREE from 'three';

export interface SpherePoint {
  position: THREE.Vector3;
  /** Quaternion orienting a +Z-facing plane to point outward along the normal. */
  quaternion: THREE.Quaternion;
}

const OUTWARD = new THREE.Vector3(0, 0, 1);

/**
 * Picks a sphere radius that keeps tiles readably spaced regardless of how many
 * articles a feed returns (small feeds stay dense, large feeds spread out).
 */
export function radiusForCount(count: number): number {
  return Math.max(3.4, Math.sqrt(Math.max(1, count)) * 0.95);
}

/**
 * Distributes `count` points evenly over a sphere of `radius` using the
 * Fibonacci lattice, with each point oriented to face outward.
 */
export function fibonacciSpherePoints(count: number, radius: number): SpherePoint[] {
  const points: SpherePoint[] = [];
  if (count <= 0) return points;

  const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2; // 1 -> -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;

    const normal = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
    const position = normal.clone().multiplyScalar(radius);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(OUTWARD, normal);

    points.push({ position, quaternion });
  }
  return points;
}
