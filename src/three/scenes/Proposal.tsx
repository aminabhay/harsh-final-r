import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { ui, useUi } from '../../lib/ui';
import { Character, RestingPari } from '../Character';
import { pariState } from '../pariPath';
import { useWorld } from '../context';
import { Balloon, Flowers, G, Island, Label, Lantern, Vase, mat, roseGold, scatterBlooms, useCanvasTexture } from '../parts';

/**
 * Chapter three: an artistic interpretation of the proposal evening in Qatar.
 * Swap the backdrop for reference photos later if wished.
 */

function Backdrop() {
  const tex = useCanvasTexture(2048, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#B79AC8');
    sky.addColorStop(0.45, '#EBB7B9');
    sky.addColorStop(0.8, '#FFD2B0');
    sky.addColorStop(1, '#FFE3C7');
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    // a few early stars and a slim crescent
    g.fillStyle = 'rgba(255,249,243,0.8)';
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      g.arc((i * 397) % w, ((i * 131) % (h * 0.35)) + 8, i % 5 === 0 ? 2.4 : 1.4, 0, Math.PI * 2);
      g.fill();
    }
    g.beginPath();
    g.arc(w * 0.72, h * 0.2, 26, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#C4A3C7';
    g.beginPath();
    g.arc(w * 0.72 + 11, h * 0.2 - 6, 24, 0, Math.PI * 2);
    g.fill();
    // restrained, abstract waterfront skyline
    g.fillStyle = 'rgba(122,86,112,0.55)';
    const base = h * 0.86;
    const towers: [number, number, number, 'flat' | 'dome' | 'spire' | 'curve'][] = [
      [0.2, 26, 90, 'flat'], [0.24, 18, 140, 'spire'], [0.28, 30, 110, 'flat'], [0.33, 22, 180, 'curve'], [0.37, 34, 130, 'dome'],
      [0.42, 20, 210, 'spire'], [0.46, 28, 150, 'flat'], [0.55, 24, 120, 'dome'], [0.6, 32, 190, 'curve'], [0.65, 22, 100, 'flat'],
      [0.69, 26, 160, 'spire'], [0.74, 30, 120, 'flat'], [0.79, 20, 90, 'dome'],
    ];
    towers.forEach(([x, tw, th, kind]) => {
      const cx = x * w;
      g.beginPath();
      g.moveTo(cx - tw / 2, base);
      g.lineTo(cx - tw / 2, base - th);
      if (kind === 'dome') g.quadraticCurveTo(cx, base - th - tw * 1.3, cx + tw / 2, base - th);
      else if (kind === 'spire') {
        g.lineTo(cx, base - th - 30);
        g.lineTo(cx + tw / 2, base - th);
      } else if (kind === 'curve') g.quadraticCurveTo(cx + tw * 0.2, base - th - 40, cx + tw / 2, base - th + 10);
      else g.lineTo(cx + tw / 2, base - th);
      g.lineTo(cx + tw / 2, base);
      g.fill();
    });
    // water
    const water = g.createLinearGradient(0, base, 0, h);
    water.addColorStop(0, 'rgba(231,170,170,0.85)');
    water.addColorStop(1, 'rgba(255,214,190,0.9)');
    g.fillStyle = water;
    g.fillRect(0, base, w, h - base);
    g.fillStyle = 'rgba(255,240,220,0.45)';
    for (let i = 0; i < 18; i++) g.fillRect(w * 0.18 + i * 70, base + 10 + (i % 3) * 12, 36, 2);
  });
  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[4.4, 4.4, 3.2, 64, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
      <meshStandardMaterial map={tex} side={THREE.BackSide} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.45} roughness={1} />
    </mesh>
  );
}

function RingBox() {
  const { reduced } = useWorld();
  const lid = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame(({ clock }, dt) => {
    // Opens once the camera (and Pari) have arrived in Qatar, in clear view.
    const goal = pariState.f > 2.97 ? 1 : 0;
    t.current = reduced ? goal : THREE.MathUtils.damp(t.current, goal, 1.6, dt);
    if (lid.current) lid.current.rotation.x = -t.current * 1.9;
    if (gem.current && !reduced) gem.current.rotation.y = clock.elapsedTime * 0.6;
  });
  const velvet = mat('#C9708A', { rough: 0.95 });
  return (
    <group position={[0, 0.98, 0]}>
      <mesh geometry={G.box} material={velvet} position={[0, 0.045, 0]} scale={[0.17, 0.09, 0.17]} castShadow />
      <mesh geometry={G.box} material={mat('#F7E6EC')} position={[0, 0.088, 0]} scale={[0.15, 0.01, 0.15]} />
      <group position={[0, 0.1, 0.06]}>
        <mesh geometry={G.torus} material={roseGold()} rotation={[0, 0, 0]} scale={[0.035, 0.035, 1.6]} />
        <mesh ref={gem} position={[0, 0.042, 0]} scale={0.016}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFE9F0" emissiveIntensity={0.6} roughness={0.05} metalness={0.2} />
        </mesh>
      </group>
      <group ref={lid} position={[0, 0.09, -0.085]}>
        <mesh geometry={G.box} material={velvet} position={[0, 0.03, 0.085]} scale={[0.172, 0.06, 0.172]} castShadow />
        <mesh geometry={G.box} material={mat('#F7E6EC')} position={[0, -0.002, 0.085]} scale={[0.15, 0.004, 0.15]} />
      </group>
    </group>
  );
}

/** Three rose-gold pins, plotted from real coordinates (equirectangular), joined by fine paths. */
function MapPlate() {
  const places = story.proposal.places;
  const toXZ = (lat: number, lon: number) => new THREE.Vector3(((lon - 70) / 44) * 1.25, 0.06, -((lat - 22) / 44) * 1.25);
  const pts = places.map((p) => toXZ(p.lat, p.lon));
  const arcs = useMemo(() => {
    const pair = (a: THREE.Vector3, b: THREE.Vector3) => {
      const mid = a.clone().lerp(b, 0.5);
      mid.y += 0.16;
      return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a.clone().setY(0.07), mid, b.clone().setY(0.07)), 32, 0.006, 5, false);
    };
    return [pair(pts[0], pts[2]), pair(pts[1], pts[2])];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <group position={[0.75, 0, 1.75]} rotation={[0.25, -0.15, 0]} scale={0.8}>
      <mesh geometry={G.cyl} material={mat(palette.paper)} position={[0, 0.025, 0]} scale={[0.8, 0.05, 0.8]} castShadow receiveShadow />
      <mesh geometry={G.torus} material={roseGold()} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.8, 0.8, 0.6]} />
      {arcs.map((g, i) => (
        <mesh key={i} geometry={g} material={roseGold()} />
      ))}
      {places.map((p, i) => (
        <group key={p.id} position={pts[i].toArray()}>
          <mesh geometry={G.cone} material={roseGold()} position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]} scale={[0.02, 0.08, 0.02]} />
          <mesh geometry={G.sphere} material={mat(p.id === 'qatar' ? '#E58FA6' : palette.blush, { rough: 0.4 })} position={[0, 0.1, 0]} scale={0.03} />
          <Label size={0.055} font="sans" position={[0, 0.17, 0]} rotation={[-0.6, 0, 0]}>
            {p.name}
          </Label>
        </group>
      ))}
    </group>
  );
}

export function ProposalScene() {
  const r = islands.proposal.radius;
  const ping = useUi((s) => s.pariPing);
  const petals = useMemo(
    () => [
      ...scatterBlooms(31, 46, { ring: [3.0, 3.9], arc: [Math.PI * 0.55, Math.PI * 1.45] }, [palette.blush, '#FFFFFF', palette.softPink, '#E58FA6'], [0.06, 0.1], [0.15, 0.45]),
      ...scatterBlooms(32, 26, { ring: [1.9, 2.6], arc: [Math.PI * 0.6, Math.PI * 1.4] }, [palette.blush, '#FFFFFF', palette.lavender], [0.05, 0.075], [0.08, 0.2]),
    ],
    [],
  );
  const balloonColors = [palette.blush, palette.lavender, '#FFFFFF', palette.softPink, palette.roseGold];
  const balloons = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const a = Math.PI + side * (0.35 + (i / 16) * 0.9);
        return { p: [Math.sin(a) * (2.6 + (i % 3) * 0.35), 0, Math.cos(a) * (2.6 + (i % 3) * 0.35)] as [number, number, number], c: balloonColors[i % balloonColors.length], h: 1.6 + (i % 4) * 0.28, m: i % 5 === 4 };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <Island radius={r} top="#F4D9D2">
      <Backdrop />
      <mesh geometry={G.cyl} material={mat('#F7E6EC', { rough: 1 })} position={[0, 0.006, 0.2]} scale={[2.1, 0.012, 2.1]} receiveShadow />
      <Flowers blooms={petals} />
      {balloons.map((b, i) => (
        <Balloon key={i} position={b.p} color={b.c} height={b.h} phase={i * 0.7} metallic={b.m} />
      ))}
      <Vase position={[-1.4, 0, -0.9]} blooms={[palette.blush, '#FFFFFF', palette.softPink, '#E58FA6', '#FFFFFF']} />
      <Vase position={[1.45, 0, -0.85]} color={palette.softPink} blooms={['#FFFFFF', palette.blush, palette.lavender, '#FFFFFF', palette.blush]} />
      <Lantern position={[-2.3, 0, 1.0]} />
      <Lantern position={[2.5, 0, 0.6]} />
      <Lantern position={[-2.4, 0, -0.6]} />
      <Lantern position={[2.3, 0, -0.9]} />
      {/* pedestal + ring box between them */}
      <group position={[0, 0, 0.35]}>
        <mesh geometry={G.cyl} material={mat(palette.ivory)} position={[0, 0.48, 0]} scale={[0.09, 0.96, 0.09]} castShadow />
        <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.97, 0]} scale={[0.17, 0.025, 0.17]} />
        <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.02, 0]} scale={[0.2, 0.04, 0.2]} />
        <RingBox />
      </group>
      <Character id="harsh" position={[-0.62, 0, 0.05]} rotationY={1.05} />
      <Character id="rimi" position={[0.6, 0, 0.1]} rotationY={-1.15} />
      <RestingPari island="proposal" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.proposal.pari)} />
      <MapPlate />
    </Island>
  );
}
