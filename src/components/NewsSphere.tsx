import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Thumbnail } from './Thumbnail';
import { fibonacciSpherePoints } from '../lib/sphere';
import { useStore } from '../state/store';

const MOVE_THRESHOLD = 0.0006; // radians/frame of camera rotation = "moving"
const IDLE_FRAMES = 8; // frames of stillness before we focus the centered tile
const FOCUS_CONE = 0.32; // radians (~18°) from view-center within which a tile locks

interface Props {
  radius: number;
}

/**
 * Lays the articles out on a sphere and detects when the user has settled the
 * view: once camera motion stops, it raycasts screen-center to focus whichever
 * tile is facing the viewer. A faint wireframe shell plus a dark inner sphere
 * give the cloud of tiles a readable "globe" structure.
 */
export function NewsSphere({ radius }: Props) {
  const articles = useStore((s) => s.articles);
  const focusedId = useStore((s) => s.focusedId);

  const tiles = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const tilePos = useMemo(() => new THREE.Vector3(), []);
  const toTile = useMemo(() => new THREE.Vector3(), []);
  const prevQuat = useRef(new THREE.Quaternion());
  const idle = useRef(0);
  const settled = useRef(false);

  const points = useMemo(
    () => fibonacciSpherePoints(articles.length, radius),
    [articles.length, radius],
  );

  useFrame(() => {
    const angle = camera.quaternion.angleTo(prevQuat.current);
    prevQuat.current.copy(camera.quaternion);

    const moving = angle > MOVE_THRESHOLD;
    const store = useStore.getState();

    if (moving) {
      idle.current = 0;
      if (settled.current) {
        settled.current = false;
        store.setSpinning(true);
        if (store.focusedId) store.setFocused(null);
      }
      return;
    }

    if (settled.current) return; // already focused, nothing to do
    idle.current += 1;
    if (idle.current < IDLE_FRAMES) return;

    settled.current = true;
    store.setSpinning(false);

    if (!tiles.current) return;
    // Lock onto the tile whose direction from the camera is closest to the
    // view center, as long as it's within the focus cone.
    camera.getWorldDirection(forward);
    let bestId: string | null = null;
    let bestAngle = FOCUS_CONE;
    for (const child of tiles.current.children) {
      const id = child.userData?.articleId as string | undefined;
      if (!id) continue;
      child.getWorldPosition(tilePos);
      toTile.copy(tilePos).sub(camera.position).normalize();
      const angle = forward.angleTo(toTile);
      if (angle < bestAngle) {
        bestAngle = angle;
        bestId = id;
      }
    }
    store.setFocused(bestId);
  });

  return (
    <group>
      {/* dark inner sphere: occludes back-facing tiles so the globe reads clearly */}
      <mesh>
        <sphereGeometry args={[radius - 0.35, 48, 32]} />
        <meshBasicMaterial color="#04060f" />
      </mesh>
      {/* faint wireframe shell */}
      <mesh>
        <sphereGeometry args={[radius, 28, 18]} />
        <meshBasicMaterial color="#27e8ff" wireframe transparent opacity={0.07} />
      </mesh>

      <group ref={tiles}>
        {articles.map((article, i) => (
          <Thumbnail
            key={article.id}
            article={article}
            point={points[i]}
            focused={article.id === focusedId}
          />
        ))}
      </group>
    </group>
  );
}
