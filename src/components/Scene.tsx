import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import { NewsSphere } from './NewsSphere';
import { Starfield } from './Starfield';
import { radiusForCount } from '../lib/sphere';
import { useStore } from '../state/store';

const TMP = { x: 0, y: 0, z: 1 };

function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    const len = Math.hypot(camera.position.x, camera.position.y, camera.position.z);
    const dir =
      len > 0.001
        ? { x: camera.position.x / len, y: camera.position.y / len, z: camera.position.z / len }
        : TMP;
    const dist = Math.max(radius + 5, radius * 1.8);
    camera.position.set(dir.x * dist, dir.y * dist, dir.z * dist);

    if (controls) {
      controls.target.set(0, 0, 0);
      controls.minDistance = radius + 1.3;
      controls.maxDistance = radius * 4;
      controls.update();
    }
  }, [radius, camera, controls]);

  return null;
}

/** Three slowly-rotating holographic scan rings around the sphere. */
function ScanRings({ radius }: { radius: number }) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringA.current) ringA.current.rotation.z += delta * 0.14;
    if (ringB.current) ringB.current.rotation.x += delta * 0.09;
    if (ringC.current) {
      ringC.current.rotation.y += delta * 0.11;
      ringC.current.rotation.z += delta * 0.04;
    }
  });

  const r = radius + 1.1;

  return (
    <group>
      <mesh ref={ringA}>
        <torusGeometry args={[r, 0.022, 6, 200]} />
        <meshBasicMaterial color="#27e8ff" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.016, 6, 200]} />
        <meshBasicMaterial color="#8b5cff" transparent opacity={0.2} toneMapped={false} />
      </mesh>
      <mesh ref={ringC} rotation={[Math.PI / 4, Math.PI / 5, 0]}>
        <torusGeometry args={[r, 0.012, 6, 200]} />
        <meshBasicMaterial color="#ff2bd6" transparent opacity={0.14} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Scene() {
  const count = useStore((s) => s.articles.length);
  const radius = radiusForCount(count);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: 'radial-gradient(circle at 50% 40%, #060d28 0%, #03060f 55%, #01020a 100%)' }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -8, -6]} intensity={0.3} color="#8b5cff" />

      <Starfield />
      <ScanRings radius={radius} />
      <NewsSphere radius={radius} />
      <CameraRig radius={radius} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.8}
      />

      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.18} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
