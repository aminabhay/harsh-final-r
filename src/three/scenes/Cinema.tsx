import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { pariState } from '../pariPath';
import { ui, useUi } from '../../lib/ui';
import { openTicket } from '../../lib/actions';
import { Character, RestingPari } from '../Character';
import { useWorld } from '../context';
import { G, Island, Label, mat, roseGold, glowMat, useCanvasTexture, useClickable } from '../parts';

/** Chapter two: a tiny open-air cinema in Kolkata with original "hero night" artwork. */


const SCREEN_W = 3.5;
const SCREEN_H = 1.75;

function Screen() {
  // Image supplied by the couple; cover-fitted to the screen's 2:1 frame.
  const base = useTexture(`${import.meta.env.BASE_URL}images/cinema/screen.webp`);
  const tex = useMemo(() => {
    const t = base.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    const img = base.image as { width: number; height: number };
    const ia = img.width / img.height;
    const fa = SCREEN_W / SCREEN_H;
    if (ia > fa) {
      t.repeat.set(fa / ia, 1);
      t.offset.set((1 - fa / ia) / 2, 0);
    } else {
      t.repeat.set(1, ia / fa);
      t.offset.set(0, (1 - ia / fa) / 2);
    }
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }, [base]);
  const velvet = mat('#8E3B55', { rough: 0.95 });
  const velvetDark = mat('#6E2C43', { rough: 0.95 });
  return (
    <group position={[0, 0, -3.3]}>
      {/* stage */}
      <mesh geometry={G.box} material={mat('#4A3346', { rough: 0.8 })} position={[0, 0.11, 0.35]} scale={[4.9, 0.22, 0.8]} castShadow receiveShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.225, 0.755]} scale={[4.9, 0.03, 0.03]} />
      {/* screen + frame */}
      <mesh geometry={G.box} material={mat('#1E1620')} position={[0, 1.33, -0.03]} scale={[3.72, 1.86, 0.04]} />
      <mesh position={[0, 1.33, 0]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.85} roughness={0.9} />
      </mesh>
      {/* proscenium valance with a scalloped hem */}
      <mesh geometry={G.box} material={velvet} position={[0, 2.5, 0.18]} scale={[5.0, 0.5, 0.14]} castShadow />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} geometry={G.sphere} material={velvet} position={[-2.2 + i * 0.55, 2.25, 0.2]} scale={[0.3, 0.12, 0.08]} />
      ))}
      <mesh geometry={G.box} material={roseGold()} position={[0, 2.76, 0.26]} scale={[5.0, 0.04, 0.04]} />
      {/* pleated side curtains, gathered with rose-gold tie-backs */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.2, 0, 0.22]}>
          {[0, 1, 2, 3].map((k) => (
            <mesh key={k} geometry={G.cyl} material={k % 2 ? velvetDark : velvet} position={[side * k * 0.13, 1.3, (k % 2) * 0.03]} scale={[0.09, 2.6, 0.09]} castShadow />
          ))}
          <mesh geometry={G.torus} material={roseGold()} position={[side * 0.2, 1.0, 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.32, 0.12, 0.6]} />
        </group>
      ))}
    </group>
  );
}

/** One theatre seat facing the screen (its back towards the audience/camera). */
function Seat({ position }: { position: [number, number, number] }) {
  const velvet = mat('#B24F6C', { rough: 0.95 });
  return (
    <group position={position} rotation={[0, Math.PI, 0]} scale={0.82}>
      <mesh geometry={G.box} material={velvet} position={[0, 0.42, 0]} scale={[0.56, 0.14, 0.5]} castShadow />
      <mesh geometry={G.box} material={velvet} position={[0, 0.84, -0.24]} rotation={[-0.12, 0, 0]} scale={[0.56, 0.76, 0.12]} castShadow />
      {[-0.31, 0.31].map((x) => (
        <mesh key={x} geometry={G.box} material={mat('#3B2B3A', { rough: 0.6 })} position={[x, 0.45, -0.02]} scale={[0.06, 0.55, 0.52]} castShadow />
      ))}
    </group>
  );
}

const ROWS = [-1.0, -1.85];
const SEAT_X = [0.6, 1.2, 1.8];

function SeatRows() {
  return (
    <group>
      {ROWS.map((z, ri) => (
        <group key={z}>
          {/* each row sits on a shallow riser */}
          <mesh geometry={G.box} material={mat('#4E3550', { rough: 1 })} position={[0, 0.02 + ri * 0.08, z]} scale={[4.4, 0.04 + ri * 0.16, 0.85]} receiveShadow />
          {SEAT_X.flatMap((x) => [-x, x]).map((x) => (
            <Seat key={x} position={[x, 0.04 + ri * 0.16, z]} />
          ))}
        </group>
      ))}
    </group>
  );
}

function AisleLights() {
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => -2.4 + i * 0.6).flatMap((z) =>
        [-0.32, 0.32].map((x) => <mesh key={`${x}${z}`} geometry={G.lowSphere} material={glowMat('#FFD9A0', 2.4)} position={[x, 0.03, z]} scale={[0.03, 0.015, 0.03]} />),
      )}
    </group>
  );
}

function SideWalls() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.55, 0, -0.9]}>
          <mesh geometry={G.box} material={mat('#5A4160', { rough: 0.9 })} position={[0, 0.9, 0]} scale={[0.14, 1.8, 4.4]} castShadow receiveShadow />
          <mesh geometry={G.box} material={roseGold()} position={[-side * 0.075, 1.8, 0]} scale={[0.02, 0.04, 4.4]} />
          {[-1.4, 0, 1.4].map((z) => (
            <group key={z} position={[-side * 0.1, 1.25, z]}>
              <mesh geometry={G.box} material={roseGold()} scale={[0.04, 0.16, 0.1]} />
              <mesh geometry={G.sphere} material={glowMat('#FFE2B8', 2)} position={[-side * 0.06, 0.06, 0]} scale={[0.06, 0.08, 0.06]} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Popcorn({ position }: { position: [number, number, number] }) {
  const tex = useCanvasTexture(128, 64, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#FFFFFF' : '#E7A0B4';
      g.fillRect((i * w) / 8, 0, w / 8, h);
    }
  });
  const puffs = useMemo(() => Array.from({ length: 14 }, (_, i) => [Math.sin(i * 2.3) * 0.07 * ((i % 3) / 2 + 0.4), 0.25 + (i % 4) * 0.018, Math.cos(i * 2.3) * 0.07 * ((i % 3) / 2 + 0.4)] as [number, number, number]), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.085, 0.24, 20, 1, true]} />
        <meshStandardMaterial map={tex} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {puffs.map((p, i) => (
        <mesh key={i} geometry={G.lowSphere} material={mat('#FFF3D6')} position={p} scale={0.035} />
      ))}
    </group>
  );
}

function Tickets() {
  const click = useClickable(openTicket);
  const { reduced } = useWorld();
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && !reduced) ref.current.position.y = 1.02 + Math.sin(clock.elapsedTime * 1.4) * 0.015;
  });
  return (
    <group position={[2.35, 0, 1.5]} rotation={[0, -0.5, 0]}>
      {/* little ticket booth podium */}
      <mesh geometry={G.box} material={mat(palette.lavender)} position={[0, 0.45, 0]} scale={[0.7, 0.9, 0.5]} castShadow receiveShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.91, 0]} scale={[0.76, 0.04, 0.56]} />
      <Label size={0.09} font="sans" position={[0, 0.6, 0.26]} letterSpacing={0.15}>
        TICKETS
      </Label>
      {/* concession counter: a tub of popcorn beside the tickets */}
      <Popcorn position={[0.2, 0.93, 0.02]} />
      <group ref={ref} position={[-0.14, 1.02, 0]} {...click}>
        {[-0.1, 0.1].map((x, i) => (
          <group key={x} position={[x, 0, 0.02 * i]} rotation={[-1.1, 0, (i ? -1 : 1) * 0.18]}>
            <mesh geometry={G.box} material={mat(i ? palette.softPink : palette.butter)} scale={[0.32, 0.15, 0.006]} castShadow />
            <Label size={0.035} font="sans" position={[0, 0.02, 0.005]} letterSpacing={0.1}>
              ADMIT ONE
            </Label>
            <Label size={0.03} font="italic" position={[0, -0.03, 0.005]}>
              Kolkata · first date
            </Label>
          </group>
        ))}
        {/* generous invisible hit area for touch */}
        <mesh geometry={G.box} scale={[0.6, 0.35, 0.4]} visible={false} />
      </group>
    </group>
  );
}

/** A ribbon of starlight that rises from the screen and leads on to Qatar during the journey. */
function Ribbon() {
  const ribbonMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FFE2C2', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const starMat = useMemo(() => new THREE.PointsMaterial({ color: '#FFF1D6', size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const start = new THREE.Vector3(0, 2.8, -3.0);
  const next = new THREE.Vector3(islands.proposal.pos[0] - islands.cinema.pos[0], 0, islands.proposal.pos[2] - islands.cinema.pos[2]);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([start.clone(), new THREE.Vector3(1.5, 3.8, -1.5), new THREE.Vector3(6, 4.2, -1), new THREE.Vector3(next.x * 0.6, 3, next.z * 0.6), new THREE.Vector3(next.x - 3, 1.6, next.z + 1)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.025, 6, false), [curve]);
  const stars = useMemo(() => {
    const pts = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i++) {
      const p = curve.getPoint(i / 90);
      pts.set([p.x + Math.sin(i * 7.1) * 0.35, p.y + Math.cos(i * 3.7) * 0.3, p.z + Math.sin(i * 5.3) * 0.35], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    return g;
  }, [curve]);
  const drawRange = useRef(0);

  useFrame((_, dt) => {
    // Plays during the journey from the cinema to Qatar (no card on screen then),
    // fading as we arrive.
    const f = pariState.f;
    const show = THREE.MathUtils.smoothstep(f, 2.0, 2.12) * (1 - THREE.MathUtils.smoothstep(f, 2.85, 3.0));
    ribbonMat.opacity = show * 0.85;
    starMat.opacity = show * 0.9;
    drawRange.current = THREE.MathUtils.damp(drawRange.current, show > 0.01 ? Math.min(1, 0.2 + Math.max(0, f - 2) * 1.3) : 0, 4, dt);
    tube.setDrawRange(0, Math.floor(tube.index!.count * drawRange.current));
    stars.setDrawRange(0, Math.floor(90 * drawRange.current));
  });

  return (
    <group>
      <mesh geometry={tube} material={ribbonMat} />
      <points geometry={stars} material={starMat} />
    </group>
  );
}

export function CinemaScene() {
  const r = islands.cinema.radius;
  const ping = useUi((s) => s.pariPing);
  return (
    <Island radius={r} top="#3E2C3F">
      {/* auditorium carpet with a centre aisle runner */}
      <mesh geometry={G.box} material={mat('#5E3E5B', { rough: 1 })} position={[0, 0.005, -0.8]} scale={[7, 0.01, 5.4]} receiveShadow />
      <mesh geometry={G.box} material={mat('#7A4A66', { rough: 1 })} position={[0, 0.011, -0.6]} scale={[0.6, 0.01, 5.0]} receiveShadow />
      <Screen />
      <SideWalls />
      <SeatRows />
      <AisleLights />
      <Character id="harsh" position={[-0.7, 0, 0.35]} rotationY={0.35} />
      <Character id="rimi" position={[0.7, 0, 0.4]} rotationY={-0.35} />
      <RestingPari island="cinema" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.cinema.pari)} />
      <Tickets />
      <Ribbon />
      {/* marquee bulbs along the valance */}
      {Array.from({ length: 13 }, (_, i) => (
        <mesh key={i} geometry={G.lowSphere} material={glowMat('#FFE6B8', 2)} position={[-2.25 + i * 0.375, 2.98, -3.0]} scale={0.045} />
      ))}
    </Island>
  );
}
