import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CATEGORY_COLOR, type Article } from '../lib/types';
import type { SpherePoint } from '../lib/sphere';
import { makePlaceholderTexture } from '../lib/placeholderTexture';

const W = 1.32;
const H = 0.99;
const NEON_FOCUS = new THREE.Color('#ff2bd6');

interface Props {
  article: Article;
  point: SpherePoint;
  focused: boolean;
}

export function Thumbnail({ article, point, focused }: Props) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const border = useRef<THREE.Mesh>(null);

  const camera = useThree((s) => s.camera);

  // Category-specific neon color
  const neonColor = useMemo(
    () => new THREE.Color(CATEGORY_COLOR[article.category] ?? '#27e8ff'),
    [article.category],
  );

  // Recency boost: fresher articles appear slightly larger
  const baseScale = useMemo(() => {
    if (!article.publishedAt) return 1.0;
    const ageHrs = (Date.now() - new Date(article.publishedAt).getTime()) / 3_600_000;
    return ageHrs < 1 ? 1.13 : ageHrs < 4 ? 1.06 : 1.0;
  }, [article.publishedAt]);

  const placeholder = useMemo(() => makePlaceholderTexture(article), [article]);
  const [texture, setTexture] = useState<THREE.Texture>(placeholder);

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
        const img = tex.image as HTMLImageElement;
        const w = img.naturalWidth  || img.width  || 0;
        const h = img.naturalHeight || img.height || 0;
        const ratio = h > 0 ? w / h : 0;
        // reject logos / icons: too small or extreme aspect ratio
        if (w < 150 || h < 100 || ratio > 4 || ratio < 0.25) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setTexture(tex);
      },
      undefined,
      () => { /* keep placeholder on CORS failure */ },
    );

    return () => { cancelled = true; };
  }, [article.image, placeholder]);

  useEffect(() => () => placeholder.dispose(), [placeholder]);

  useFrame((_, delta) => {
    if (outer.current) outer.current.quaternion.copy(camera.quaternion);

    const k = 1 - Math.pow(0.001, delta);
    if (inner.current) {
      const target = focused ? 1.6 : baseScale;
      const s = THREE.MathUtils.lerp(inner.current.scale.x, target, k);
      inner.current.scale.setScalar(s);
    }
    if (border.current) {
      const mat = border.current.material as THREE.MeshBasicMaterial;
      mat.color.lerp(focused ? NEON_FOCUS : neonColor, k);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, focused ? 1 : 0.6, k);
    }
  });

  return (
    <group ref={outer} position={point.position} userData={{ articleId: article.id }}>
      <group ref={inner}>
        <mesh ref={border} position={[0, 0, -0.01]}>
          <planeGeometry args={[W + 0.12, H + 0.12]} />
          <meshBasicMaterial color={neonColor} transparent opacity={0.6} toneMapped={false} />
        </mesh>
        <mesh userData={{ articleId: article.id }}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
