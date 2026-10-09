import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import serifFont from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff?url';
import serifItalic from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff?url';
import sansFont from '@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff?url';
import { palette } from '../config/theme';
import { images, type ImageKey } from '../config/images';
import { useWorld } from './context';

/* ------------------------------------------------------------------ */
/* Shared geometry + material caches (reused across every chapter).    */
/* ------------------------------------------------------------------ */

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 24, 16),
  lowSphere: new THREE.SphereGeometry(1, 12, 8),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 24),
  cone: new THREE.ConeGeometry(1, 1, 24),
  plane: new THREE.PlaneGeometry(1, 1),
  circle: new THREE.CircleGeometry(1, 32),
  torus: new THREE.TorusGeometry(1, 0.04, 8, 48),
  blob: new THREE.IcosahedronGeometry(1, 2),
};

const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(
  color: string,
  opts: { rough?: number; metal?: number; emissive?: string; glow?: number; opacity?: number; side?: THREE.Side } = {},
): THREE.MeshStandardMaterial {
  const key = `${color}|${JSON.stringify(opts)}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.85,
      metalness: opts.metal ?? 0,
      ...(opts.emissive ? { emissive: new THREE.Color(opts.emissive), emissiveIntensity: opts.glow ?? 1 } : {}),
      transparent: opts.opacity !== undefined,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
    });
    matCache.set(key, m);
  }
  return m;
}

export const roseGold = () => mat(palette.roseGold, { rough: 0.32, metal: 0.85 });
export const glowMat = (color: string, glow = 1.6) => mat(color, { emissive: color, glow, rough: 0.5 });

/* ------------------------------------------------------------------ */
/* Pointer helpers                                                      */
/* ------------------------------------------------------------------ */

export function useClickable(onClick: () => void) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = '';
    },
  };
}

/* ------------------------------------------------------------------ */
/* Text                                                                  */
/* ------------------------------------------------------------------ */

type LabelProps = {
  children: string;
  size?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  font?: 'serif' | 'italic' | 'sans';
  maxWidth?: number;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom';
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
};

export function Label({ children, size = 0.2, color = palette.text, font = 'serif', ...rest }: LabelProps) {
  const url = font === 'serif' ? serifFont : font === 'italic' ? serifItalic : sansFont;
  return (
    <Text font={url} fontSize={size} color={color} anchorX={rest.anchorX ?? 'center'} anchorY={rest.anchorY ?? 'middle'} {...rest}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Island: the miniature plinth each chapter stands on                  */
/* ------------------------------------------------------------------ */

export function Island({ radius, top, side = palette.paper, children }: { radius: number; top: string; side?: string; children?: ReactNode }) {
  return (
    <group>
      <mesh geometry={G.cyl} material={mat(top, { rough: 0.95 })} position={[0, -0.04, 0]} scale={[radius, 0.08, radius]} receiveShadow />
      <mesh geometry={G.cyl} material={mat(side, { rough: 0.9 })} position={[0, -0.34, 0]} scale={[radius * 1.005, 0.52, radius * 1.005]} />
      <mesh material={roseGold()} position={[0, -0.075, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 1.008, 0.028, 8, 128]} />
      </mesh>
      <mesh geometry={G.cyl} material={mat(palette.softPink, { rough: 0.9 })} position={[0, -0.66, 0]} scale={[radius * 0.94, 0.12, radius * 0.94]} />
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Soft contact shadow (cheap radial gradient decal)                    */
/* ------------------------------------------------------------------ */

let blobTex: THREE.Texture | null = null;
function getBlobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(67,54,60,0.55)');
  grad.addColorStop(0.45, 'rgba(67,54,60,0.28)');
  grad.addColorStop(1, 'rgba(67,54,60,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}

const blobMats = new Map<number, THREE.MeshBasicMaterial>();
export function BlobShadow({ radius = 0.5, opacity = 0.7, stretch = 1, position = [0, 0, 0] as [number, number, number] }) {
  const m = useMemo(() => {
    let mm = blobMats.get(opacity);
    if (!mm) {
      mm = new THREE.MeshBasicMaterial({ map: getBlobTexture(), transparent: true, opacity, depthWrite: false, toneMapped: false });
      blobMats.set(opacity, mm);
    }
    return mm;
  }, [opacity]);
  return (
    <mesh geometry={G.plane} material={m} position={[position[0], position[1] + 0.006, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[radius * 2, radius * 2 * stretch, 1]} renderOrder={1} />
  );
}

/* ------------------------------------------------------------------ */
/* Flowers (instanced: one draw call per part for any number of blooms) */
/* ------------------------------------------------------------------ */

export interface Bloom {
  p: [number, number, number];
  c: string;
  s?: number;
  stem?: number;
}

const petalGeo = new THREE.SphereGeometry(1, 10, 8);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpC = new THREE.Color();

export function Flowers({ blooms, petals = 5 }: { blooms: Bloom[]; petals?: number }) {
  const petalRef = useRef<THREE.InstancedMesh>(null);
  const centreRef = useRef<THREE.InstancedMesh>(null);
  const stemRef = useRef<THREE.InstancedMesh>(null);
  const petalMat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.75 }), []);

  useLayoutEffect(() => {
    const pm = petalRef.current!;
    const cm = centreRef.current!;
    const sm = stemRef.current!;
    blooms.forEach((b, i) => {
      const s = b.s ?? 0.12;
      const stem = b.stem ?? 0.3;
      const head = tmpP.set(b.p[0], b.p[1] + stem, b.p[2]).clone();
      for (let k = 0; k < petals; k++) {
        const a = (k / petals) * Math.PI * 2 + i;
        tmpE.set(0.5, a, 0, 'YXZ');
        tmpQ.setFromEuler(tmpE);
        const off = new THREE.Vector3(Math.sin(a) * s * 0.75, 0, Math.cos(a) * s * 0.75);
        tmpS.set(s * 0.55, s * 0.18, s * 0.85);
        tmpM.compose(head.clone().add(off), tmpQ, tmpS);
        pm.setMatrixAt(i * petals + k, tmpM);
        pm.setColorAt(i * petals + k, tmpC.set(b.c).offsetHSL(0, 0, (k % 2) * 0.03));
      }
      tmpM.compose(head.clone().add(new THREE.Vector3(0, s * 0.12, 0)), tmpQ.identity(), tmpS.setScalar(s * 0.32));
      cm.setMatrixAt(i, tmpM);
      tmpM.compose(new THREE.Vector3(b.p[0], b.p[1] + stem / 2, b.p[2]), tmpQ.identity(), tmpS.set(0.012, stem, 0.012));
      sm.setMatrixAt(i, tmpM);
    });
    pm.instanceMatrix.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
    cm.instanceMatrix.needsUpdate = true;
    sm.instanceMatrix.needsUpdate = true;
    pm.computeBoundingSphere();
    cm.computeBoundingSphere();
    sm.computeBoundingSphere();
  }, [blooms, petals]);

  return (
    <group>
      <instancedMesh ref={petalRef} args={[petalGeo, petalMat, blooms.length * petals]} castShadow />
      <instancedMesh ref={centreRef} args={[G.lowSphere, mat('#E9C46A', { rough: 0.6 }), blooms.length]} />
      <instancedMesh ref={stemRef} args={[G.cyl, mat(palette.deepLeaf), blooms.length]} />
    </group>
  );
}

/** Deterministic pseudo-random, so layouts are stable across renders. */
export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function scatterBlooms(
  seed: number,
  count: number,
  area: { x: [number, number]; z: [number, number] } | { ring: [number, number]; arc?: [number, number] },
  colors: string[],
  size: [number, number] = [0.05, 0.085],
  stem: [number, number] = [0.1, 0.3],
): Bloom[] {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    let x: number, z: number;
    if ('ring' in area) {
      const [a0, a1] = area.arc ?? [0, Math.PI * 2];
      const a = a0 + r() * (a1 - a0);
      const rad = area.ring[0] + r() * (area.ring[1] - area.ring[0]);
      x = Math.sin(a) * rad;
      z = Math.cos(a) * rad;
    } else {
      x = area.x[0] + r() * (area.x[1] - area.x[0]);
      z = area.z[0] + r() * (area.z[1] - area.z[0]);
    }
    return { p: [x, 0, z] as [number, number, number], c: colors[Math.floor(r() * colors.length)], s: size[0] + r() * (size[1] - size[0]), stem: stem[0] + r() * (stem[1] - stem[0]) };
  });
}

/* ------------------------------------------------------------------ */
/* Greenery                                                              */
/* ------------------------------------------------------------------ */

export function Bush({ position, scale = 1, color = palette.leaf }: { position: [number, number, number]; scale?: number; color?: string }) {
  const m = mat(color, { rough: 0.95 });
  const m2 = mat(new THREE.Color(color).offsetHSL(0, 0, 0.05).getStyle(), { rough: 0.95 });
  return (
    <group position={position} scale={scale}>
      <mesh geometry={G.blob} material={m} position={[0, 0.32, 0]} scale={[0.42, 0.36, 0.4]} castShadow />
      <mesh geometry={G.blob} material={m2} position={[0.3, 0.24, 0.08]} scale={[0.3, 0.26, 0.3]} castShadow />
      <mesh geometry={G.blob} material={m2} position={[-0.28, 0.22, 0.06]} scale={[0.28, 0.24, 0.28]} castShadow />
    </group>
  );
}

export function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh geometry={G.cyl} material={mat('#B08C74')} position={[0, 0.6, 0]} scale={[0.07, 1.2, 0.07]} castShadow />
      <mesh geometry={G.blob} material={mat(palette.sage, { rough: 0.95 })} position={[0, 1.45, 0]} scale={[0.62, 0.55, 0.62]} castShadow />
      <mesh geometry={G.blob} material={mat(palette.leaf, { rough: 0.95 })} position={[0.25, 1.75, 0.1]} scale={[0.4, 0.36, 0.4]} castShadow />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Balloons (gentle bob, frozen in reduced motion)                      */
/* ------------------------------------------------------------------ */

export function Balloon({ position, color, height = 1.6, phase = 0, metallic = false }: { position: [number, number, number]; color: string; height?: number; phase?: number; metallic?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { reduced, activeRef } = useWorld();
  useFrame(({ clock }) => {
    if (!ref.current || reduced || !activeRef.current) return;
    const t = clock.elapsedTime * 0.6 + phase;
    ref.current.position.y = height + Math.sin(t) * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.05;
  });
  const m = metallic ? mat(color, { rough: 0.25, metal: 0.7 }) : mat(color, { rough: 0.35 });
  return (
    <group position={position}>
      <mesh geometry={G.cyl} material={mat('#FFFFFF', { opacity: 0.6 })} position={[0, height / 2, 0]} scale={[0.004, height, 0.004]} />
      <group ref={ref} position={[0, height, 0]}>
        <mesh geometry={G.sphere} material={m} position={[0, 0.2, 0]} scale={[0.19, 0.23, 0.19]} castShadow />
        <mesh geometry={G.cone} material={m} position={[0, -0.04, 0]} scale={[0.03, 0.04, 0.03]} rotation={[Math.PI, 0, 0]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* String of fairy lights along a sagging curve (instanced emissive)    */
/* ------------------------------------------------------------------ */

export function FairyLights({ from, to, sag = 0.3, count = 16, color = '#FFE7B0' }: { from: [number, number, number]; to: [number, number, number]; sag?: number; count?: number; color?: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -sag, 0));
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [from, to, sag]);
  const wire = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.006, 4, false), [curve]);
  useLayoutEffect(() => {
    const m = ref.current!;
    for (let i = 0; i < count; i++) {
      const p = curve.getPoint((i + 0.5) / count);
      tmpM.compose(p.add(new THREE.Vector3(0, -0.03, 0)), tmpQ.identity(), tmpS.setScalar(0.035));
      m.setMatrixAt(i, tmpM);
    }
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [curve, count]);
  return (
    <group>
      <mesh geometry={wire} material={mat('#8A7A70')} />
      <instancedMesh ref={ref} args={[G.lowSphere, glowMat(color, 2.2), count]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Photo frame with a cover-fitted image texture                        */
/* ------------------------------------------------------------------ */

export function PhotoFrame({
  imageKey,
  width,
  height,
  onSelect,
  border = 0.06,
}: {
  imageKey: ImageKey;
  width: number;
  height: number;
  onSelect?: () => void;
  border?: number;
}) {
  const img = images[imageKey];
  const tex = useTexture(img.src);
  const fitted = useMemo(() => {
    const t = tex.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    const image = tex.image as { width: number; height: number };
    const ia = image.width / image.height;
    const fa = width / height;
    if (ia > fa) {
      t.repeat.set(fa / ia, 1);
      t.offset.set((1 - fa / ia) / 2, 0);
    } else {
      t.repeat.set(1, ia / fa);
      t.offset.set(0, (1 - ia / fa) / 2);
    }
    t.needsUpdate = true;
    return t;
  }, [tex, width, height]);
  const picMat = useMemo(() => new THREE.MeshStandardMaterial({ map: fitted, roughness: 0.7 }), [fitted]);
  const click = useClickable(() => onSelect?.());
  return (
    <group {...(onSelect ? click : {})}>
      <mesh geometry={G.box} material={roseGold()} scale={[width + border * 2, height + border * 2, 0.05]} castShadow />
      <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0, 0.012]} scale={[width + border * 0.9, height + border * 0.9, 0.04]} />
      <mesh geometry={G.plane} material={picMat} position={[0, 0, 0.034]} scale={[width - border * 0.4, height - border * 0.4, 1]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas-drawn textures                                                 */
/* ------------------------------------------------------------------ */

export function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[] = []) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ------------------------------------------------------------------ */
/* Little props used in several chapters                                 */
/* ------------------------------------------------------------------ */

export function Lantern({ position, color = '#FFD9A0' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.02, 0]} scale={[0.1, 0.04, 0.1]} />
      <mesh geometry={G.cyl} material={mat('#FFF3E0', { emissive: color, glow: 1.1, opacity: 0.92 })} position={[0, 0.17, 0]} scale={[0.085, 0.26, 0.085]} />
      <mesh geometry={G.cone} material={roseGold()} position={[0, 0.35, 0]} scale={[0.11, 0.1, 0.11]} />
    </group>
  );
}

export function Vase({ position, color = palette.lavender, blooms }: { position: [number, number, number]; color?: string; blooms: string[] }) {
  const set = useMemo<Bloom[]>(
    () => blooms.map((c, i) => ({ p: [Math.sin(i * 2.4) * 0.08, 0.28, Math.cos(i * 2.4) * 0.08], c, s: 0.09, stem: 0.22 + (i % 3) * 0.06 })),
    [blooms],
  );
  return (
    <group position={position}>
      <mesh geometry={G.sphere} material={mat(color, { rough: 0.4 })} position={[0, 0.16, 0]} scale={[0.14, 0.17, 0.14]} castShadow />
      <mesh geometry={G.cyl} material={mat(color, { rough: 0.4 })} position={[0, 0.32, 0]} scale={[0.06, 0.08, 0.06]} />
      <Flowers blooms={set} />
    </group>
  );
}
