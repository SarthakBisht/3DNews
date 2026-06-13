import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Article } from '../lib/types';
import type { SpherePoint } from '../lib/sphere';
import { makePlaceholderTexture } from '../lib/placeholderTexture';

const W = 1.32;
const H = 0.99;
const NEON = new THREE.Color('#27e8ff');
const NEON_FOCUS = new THREE.Color('#ff2bd6');

interface Props {
  article: Article;
  point: SpherePoint;
  focused: boolean;
}

/**
 * A single news tile on the sphere. Always faces the camera (billboard) so it
 * never appears tilted as the user orbits. Shows a neon placeholder immediately,
 * then swaps in the real image once it loads; CORS failures keep the placeholder.
 */
export function Thumbnail({ article, point, focused }: Props) {
  const outer = useRef<THREE.Group>(null); // positioned on sphere, bills toward camera
  const inner = useRef<THREE.Group>(null); // handles scale animation
  const border = useRef<THREE.Mesh>(null);

  const camera = useThree((s) => s.camera);

  const placeholder = useMemo(() => makePlaceholderTexture(article), [article]);
  const [texture, setTexture] = useState<THREE.Texture>(placeholder);

  // Attempt to load the real image; fall back silently on error/CORS.
  useEffect(() => {
    setTexture(placeholder);
    if (!article.image) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      article.image,
      (tex) => {
        if (cancelled) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setTexture(tex);
      },
      undefined,
      () => { /* keep placeholder */ },
    );

    return () => { cancelled = true; };
  }, [article.image, placeholder]);

  useEffect(() => () => placeholder.dispose(), [placeholder]);

  useFrame((_, delta) => {
    // Billboard: copy the camera's full quaternion so the tile is always exactly
    // parallel to the view plane — no rolling at any orbit angle.
    if (outer.current) {
      outer.current.quaternion.copy(camera.quaternion);
    }

    // Animate scale + border glow toward the focused state.
    const k = 1 - Math.pow(0.001, delta);
    if (inner.current) {
      const target = focused ? 1.6 : 1;
      const s = THREE.MathUtils.lerp(inner.current.scale.x, target, k);
      inner.current.scale.setScalar(s);
    }
    if (border.current) {
      const mat = border.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(focused ? NEON_FOCUS : NEON, k);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, focused ? 1 : 0.55, k);
    }
  });

  return (
    <group
      ref={outer}
      position={point.position}
      userData={{ articleId: article.id }}
    >
      <group ref={inner}>
        {/* glow border / backing */}
        <mesh ref={border} position={[0, 0, -0.01]}>
          <planeGeometry args={[W + 0.12, H + 0.12]} />
          <meshBasicMaterial color={NEON} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        {/* image / placeholder */}
        <mesh userData={{ articleId: article.id }}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
