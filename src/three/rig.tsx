import { useEffect, useMemo, useRef, useState, type ReactNode, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CHAPTERS, poses, atmospheres, pitchWarm, accentLights, revealPose, type ChapterId, type V3, type Atmosphere } from '../config/world';
import { ui } from '../lib/ui';
import { scrollState } from '../lib/scroll';
import { WorldContext, useWorld } from './context';

const N = CHAPTERS.length;
const v = (a: V3) => new THREE.Vector3(...a);
const damp = THREE.MathUtils.damp;

/** Pose interpolation for the continuous chapter index `f`. */
function sample(f: number, tall: boolean) {
  const i0 = Math.max(0, Math.min(N - 1, Math.floor(f)));
  const i1 = Math.min(N - 1, i0 + 1);
  const t = f - i0;
  const A = poses[CHAPTERS[i0]];
  const B = poses[CHAPTERS[i1]];
  const pa = tall ? A.tall : A.wide;
  const pb = tall ? B.tall : B.wide;
  const pos = v(A.anchor).add(v(pa.pos)).lerp(v(B.anchor).add(v(pb.pos)), t);
  const target = v(A.anchor).add(v(pa.target)).lerp(v(B.anchor).add(v(pb.target)), t);
  // A gentle lift while travelling between islands, never a roll or spin.
  pos.y += Math.sin(Math.PI * t) * 1.4;
  return {
    pos,
    target,
    shiftX: THREE.MathUtils.lerp(pa.shift[0], pb.shift[0], t),
    shiftY: THREE.MathUtils.lerp(pa.shift[1], pb.shift[1], t),
    fov: THREE.MathUtils.lerp(pa.fov, pb.fov, t),
  };
}

export function CameraRig() {
  const { reduced } = useWorld();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const cur = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), sx: 0, sy: 0, fov: 36, init: false, reveal: 0 });
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduced) return;
    const on = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, [reduced]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const tall = size.width / size.height < 0.9;
    const f = reduced ? Math.round(scrollState.f) : scrollState.f;
    const s = sample(f, tall);

    // Opening the invitation moves in close to the card (only while on the first island).
    const c0 = cur.current;
    c0.reveal = reduced ? (ui.get().envelopeOpen ? 1 : 0) : damp(c0.reveal, ui.get().envelopeOpen ? 1 : 0, 2.2, dt);
    const rw = c0.reveal * Math.max(0, 1 - f);
    if (rw > 0.001) {
      const rp = tall ? revealPose.tall : revealPose.wide;
      const anchor = v(poses.invite.anchor);
      s.pos.lerp(anchor.clone().add(v(rp.pos)), rw);
      s.target.lerp(anchor.clone().add(v(rp.target)), rw);
      s.shiftX = THREE.MathUtils.lerp(s.shiftX, rp.shift[0], rw);
      s.shiftY = THREE.MathUtils.lerp(s.shiftY, rp.shift[1], rw);
      s.fov = THREE.MathUtils.lerp(s.fov, rp.fov, rw);
    }

    // Restrained pointer parallax on desktop only.
    const p = pointer.current;
    p.sx = damp(p.sx, p.x, 2, dt);
    p.sy = damp(p.sy, p.y, 2, dt);
    if (!tall) {
      s.pos.x += p.sx * 0.22;
      s.pos.y -= p.sy * 0.12;
    }

    const c = cur.current;
    if (!c.init || reduced) {
      c.pos.copy(s.pos);
      c.target.copy(s.target);
      c.sx = s.shiftX;
      c.sy = s.shiftY;
      c.fov = s.fov;
      c.init = true;
    } else {
      const k = 3.2;
      c.pos.set(damp(c.pos.x, s.pos.x, k, dt), damp(c.pos.y, s.pos.y, k, dt), damp(c.pos.z, s.pos.z, k, dt));
      c.target.set(damp(c.target.x, s.target.x, k, dt), damp(c.target.y, s.target.y, k, dt), damp(c.target.z, s.target.z, k, dt));
      c.sx = damp(c.sx, s.shiftX, k, dt);
      c.sy = damp(c.sy, s.shiftY, k, dt);
      c.fov = damp(c.fov, s.fov, k, dt);
    }

    camera.position.copy(c.pos);
    camera.lookAt(c.target);
    camera.fov = c.fov;
    const w = size.width;
    const h = size.height;
    camera.setViewOffset(w, h, -c.sx * w, c.sy * h, w, h);
    camera.updateProjectionMatrix();
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Lighting & background mood, blended between chapters                 */
/* ------------------------------------------------------------------ */

const mixAtmos = (a: Atmosphere, b: Atmosphere, t: number, out: Record<string, THREE.Color | number>) => {
  (out.bg as THREE.Color).set(a.bg).lerp(new THREE.Color(b.bg), t);
  (out.sky as THREE.Color).set(a.sky).lerp(new THREE.Color(b.sky), t);
  (out.ground as THREE.Color).set(a.ground).lerp(new THREE.Color(b.ground), t);
  (out.sun as THREE.Color).set(a.sun).lerp(new THREE.Color(b.sun), t);
  (out.accent as THREE.Color).set(a.accent).lerp(new THREE.Color(b.accent), t);
  out.hemi = THREE.MathUtils.lerp(a.hemi, b.hemi, t);
  out.sunIntensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t);
  out.accentIntensity = THREE.MathUtils.lerp(a.accentIntensity, b.accentIntensity, t);
};

function atmosFor(id: ChapterId): Atmosphere {
  if (id !== 'pitch') return atmospheres[id];
  // Chapter one shifts from cool lavender to warm blush as the reply arrives.
  const t = THREE.MathUtils.smoothstep(scrollState.local.pitch, 0.35, 0.62);
  const out = { bg: new THREE.Color(), sky: new THREE.Color(), ground: new THREE.Color(), sun: new THREE.Color(), accent: new THREE.Color(), hemi: 0, sunIntensity: 0, accentIntensity: 0 };
  mixAtmos(atmospheres.pitch, pitchWarm, t, out);
  return {
    bg: `#${out.bg.getHexString()}`,
    sky: `#${out.sky.getHexString()}`,
    ground: `#${out.ground.getHexString()}`,
    sun: `#${out.sun.getHexString()}`,
    accent: `#${out.accent.getHexString()}`,
    hemi: out.hemi,
    sunIntensity: out.sunIntensity,
    accentIntensity: out.accentIntensity,
  };
}

export function Atmosphere() {
  const { tier, reduced } = useWorld();
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const accent = useRef<THREE.PointLight>(null);
  const out = useMemo(
    () => ({ bg: new THREE.Color(), sky: new THREE.Color(), ground: new THREE.Color(), sun: new THREE.Color(), accent: new THREE.Color(), hemi: 1, sunIntensity: 1, accentIntensity: 0 }),
    [],
  );
  const fog = useMemo(() => new THREE.Fog('#FFF4EE', 22, 48), []);
  const bg = useMemo(() => new THREE.Color('#FFF4EE'), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const gl = useThree((s) => s.gl);
  useEffect(() => {
    scene.fog = fog;
    scene.background = bg;
    // A soft, locally generated studio environment so rose-gold metal reads as metal.
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.45;
    return () => {
      scene.fog = null;
      scene.background = null;
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [scene, fog, bg, gl]);

  useFrame(() => {
    const f = reduced ? Math.round(scrollState.f) : scrollState.f;
    const i0 = Math.max(0, Math.min(N - 1, Math.floor(f)));
    const i1 = Math.min(N - 1, i0 + 1);
    mixAtmos(atmosFor(CHAPTERS[i0]), atmosFor(CHAPTERS[i1]), f - i0, out);
    bg.copy(out.bg as THREE.Color);
    fog.color.copy(out.bg as THREE.Color);
    if (hemi.current) {
      hemi.current.color.copy(out.sky as THREE.Color);
      hemi.current.groundColor.copy(out.ground as THREE.Color);
      hemi.current.intensity = out.hemi as number;
    }
    // The sun follows the camera's focus so the shadow map stays tight around the action.
    const focus = camera.getWorldDirection(tmp).multiplyScalar(8).add(camera.position);
    focus.y = 0;
    if (sun.current) {
      sun.current.color.copy(out.sun as THREE.Color);
      sun.current.intensity = out.sunIntensity as number;
      sun.current.position.set(focus.x + 5, 9, focus.z + 6);
      sun.current.target.position.copy(focus);
      sun.current.target.updateMatrixWorld();
    }
    if (accent.current) {
      const a = poses[CHAPTERS[Math.round(f)]].anchor;
      const l = accentLights[CHAPTERS[Math.round(f)]];
      accent.current.position.set(a[0] + l[0], a[1] + l[1], a[2] + l[2]);
      accent.current.color.copy(out.accent as THREE.Color);
      accent.current.intensity = out.accentIntensity as number;
    }
  });

  const shadows = tier === 'high';
  return (
    <>
      <hemisphereLight ref={hemi} args={['#FFF6F0', '#E8D4C8', 1.5]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight ref={accent} distance={9} decay={2} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter wrapper: positions an island, mounts it progressively and    */
/* hides it when far from the camera (no rendering cost when hidden).   */
/* ------------------------------------------------------------------ */

export function ChapterScene({
  id,
  position,
  range,
  children,
}: {
  id: ChapterId;
  position: V3;
  /** Visible while scrollState.f is within [min, max]. */
  range: [number, number];
  children: ReactNode;
}) {
  const parent = useWorld();
  const group = useRef<THREE.Group>(null);
  const activeRef = useRef(false);
  const progressRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useFrame(() => {
    const f = scrollState.f;
    const near = f >= range[0] - 1.2 && f <= range[1] + 1.2;
    if (near && !mounted) setMounted(true);
    const visible = f >= range[0] && f <= range[1];
    activeRef.current = visible;
    progressRef.current = scrollState.local[id];
    if (group.current) group.current.visible = visible;
  });

  const ctx = useMemo(() => ({ ...parent, activeRef, progressRef }), [parent]);
  return (
    <group ref={group} position={position} visible={false}>
      <WorldContext.Provider value={ctx}>{mounted && <Suspense fallback={null}>{children}</Suspense>}</WorldContext.Provider>
    </group>
  );
}
