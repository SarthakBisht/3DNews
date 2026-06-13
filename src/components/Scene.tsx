import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { NewsSphere } from './NewsSphere';
import { Starfield } from './Starfield';
import { radiusForCount } from '../lib/sphere';
import { useStore } from '../state/store';

const TMP = { x: 0, y: 0, z: 1 };

/**
 * Re-frames the camera whenever the sphere radius changes (e.g. a new feed
 * loads) by dollying along the current view direction, then hands control back
 * to the user. Also keeps zoom limits proportional to the sphere.
 */
function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    const len = Math.hypot(camera.position.x, camera.position.y, camera.position.z);
    const dir =
      len > 0.001
        ? { x: camera.position.x / len, y: camera.position.y / len, z: camera.position.z / len }
        : TMP;
    const dist = radius + 5;
    camera.position.set(dir.x * dist, dir.y * dist, dir.z * dist);

    if (controls) {
      controls.target.set(0, 0, 0);
      controls.minDistance = radius + 1.3;
      controls.maxDistance = radius + 14;
      controls.update();
    }
  }, [radius, camera, controls]);

  return null;
}

/** The full WebGL scene: starfield + news sphere + orbit controls + neon bloom. */
export function Scene() {
  const count = useStore((s) => s.articles.length);
  const radius = radiusForCount(count);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: 'radial-gradient(circle at 50% 40%, #0a1030 0%, #03060f 60%, #01020a 100%)' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />

      <Starfield />
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
          intensity={0.9}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.2} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
