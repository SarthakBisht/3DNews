import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/** Slow-drifting starfield backdrop for depth. */
export function Starfield() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.01;
  });
  return (
    <group ref={ref}>
      <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.6} />
    </group>
  );
}
