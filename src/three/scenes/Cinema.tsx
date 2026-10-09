import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { scrollState } from '../../lib/scroll';
import { ui, useUi } from '../../lib/ui';
import { openTicket } from '../../lib/actions';
import { Character, RestingPari } from '../Character';
import { useWorld } from '../context';
import { G, Island, Label, mat, roseGold, glowMat, useCanvasTexture, useClickable } from '../parts';

/** Chapter two: a tiny open-air cinema in Kolkata with original "hero night" artwork. */


function Screen() {
  const tex = useCanvasTexture(1024, 512, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#3B2E55');
    bg.addColorStop(1, '#7A4E78');
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    // starburst
    g.save();
    g.translate(w / 2, h * 0.58);
    for (let i = 0; i < 28; i++) {
      g.rotate((Math.PI * 2) / 28);
      g.fillStyle = i % 2 ? 'rgba(255,214,170,0.20)' : 'rgba(235,196,207,0.12)';
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(w, -40);
      g.lineTo(w, 40);
      g.fill();
    }
    g.restore();
    // halftone dots
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (let y = 0; y < h; y += 18) for (let x = (y / 18) % 2 ? 9 : 0; x < w; x += 18) {
      g.beginPath();
      g.arc(x, y, 3, 0, Math.PI * 2);
      g.fill();
    }
    // stars
    const star = (x: number, y: number, r: number) => {
      g.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = k % 2 ? r * 0.45 : r;
        g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      g.fill();
    };
    g.fillStyle = '#FFE6B8';
    star(w * 0.5, h * 0.42, 70);
    g.fillStyle = 'rgba(255,230,184,0.7)';
    [[0.18, 0.25, 18], [0.82, 0.22, 22], [0.12, 0.7, 12], [0.88, 0.68, 14], [0.3, 0.12, 10], [0.7, 0.85, 10]].forEach(([x, y, r]) => star(w * x, h * y, r));
    // title
    g.font = '700 84px Georgia, serif';
    g.textAlign = 'center';
    g.lineWidth = 10;
    g.strokeStyle = '#3B2E55';
    g.strokeText('HERO NIGHT', w / 2, h * 0.8);
    g.fillStyle = '#FFF9F3';
    g.fillText('HERO NIGHT', w / 2, h * 0.8);
  });
  return (
    <group position={[0, 0, -3.3]}>
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} geometry={G.box} material={mat(palette.plum, { rough: 0.6 })} position={[x, 1.2, 0]} scale={[0.14, 2.4, 0.14]} castShadow />
      ))}
      <mesh geometry={G.box} material={roseGold()} position={[0, 2.12, 0]} scale={[3.95, 0.1, 0.1]} />
      <mesh geometry={G.box} material={mat('#3B2E55')} position={[0, 1.33, -0.03]} scale={[3.7, 1.75, 0.04]} />
      <mesh position={[0, 1.33, 0]}>
        <planeGeometry args={[3.5, 1.75]} />
        <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.9} />
      </mesh>
      {/* velvet curtains */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={G.box} material={mat('#C98FA3', { rough: 0.95 })} position={[s * 1.95, 1.25, 0.12]} scale={[0.32, 2.3, 0.08]} castShadow />
      ))}
    </group>
  );
}

function Seat({ position }: { position: [number, number, number] }) {
  const velvet = mat('#D99AAE', { rough: 0.95 });
  return (
    <group position={position}>
      <mesh geometry={G.box} material={velvet} position={[0, 0.42, 0]} scale={[0.6, 0.14, 0.55]} castShadow />
      <mesh geometry={G.box} material={velvet} position={[0, 0.82, -0.25]} rotation={[-0.12, 0, 0]} scale={[0.6, 0.72, 0.12]} castShadow />
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} geometry={G.box} material={roseGold()} position={[x, 0.45, -0.02]} scale={[0.06, 0.55, 0.55]} castShadow />
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
      <group ref={ref} position={[0, 1.02, 0]} {...click}>
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

function ProjectorAndRibbon() {
  const beamMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FFE9C7', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const ribbonMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#FFE2C2', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const starMat = useMemo(() => new THREE.PointsMaterial({ color: '#FFF1D6', size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  const lens = new THREE.Vector3(-2.3, 1.7, 2.5);
  const screen = new THREE.Vector3(0, 1.35, -3.25);
  const beam = useMemo(() => {
    const len = lens.distanceTo(screen);
    const g = new THREE.CylinderGeometry(0.03, 1.0, len, 24, 1, true);
    g.translate(0, -len / 2, 0);
    return { g, len };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const beamQuat = useMemo(() => {
    const dir = screen.clone().sub(lens).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // A ribbon of light that carries on toward the next island (Qatar).
  const next = new THREE.Vector3(islands.proposal.pos[0] - islands.cinema.pos[0], 0, islands.proposal.pos[2] - islands.cinema.pos[2]);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([lens.clone(), new THREE.Vector3(-0.5, 3.4, 1.5), new THREE.Vector3(6, 4.2, -1), new THREE.Vector3(next.x * 0.6, 3, next.z * 0.6), new THREE.Vector3(next.x - 3, 1.6, next.z + 1)]),
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
    // Visible while leaving the cinema, fading as we arrive in Qatar.
    const f = scrollState.f;
    const local = scrollState.local.cinema;
    const show = THREE.MathUtils.smoothstep(local, 0.55, 0.8) * (1 - THREE.MathUtils.smoothstep(f, 2.85, 3.0));
    const goal = f >= 2.85 ? 0 : show;
    ribbonMat.opacity = goal * 0.85;
    starMat.opacity = goal * 0.9;
    drawRange.current = THREE.MathUtils.damp(drawRange.current, show > 0.01 ? Math.min(1, 0.25 + Math.max(0, f - 2) * 1.2) : 0, 3, dt);
    tube.setDrawRange(0, Math.floor(tube.index!.count * drawRange.current));
    stars.setDrawRange(0, Math.floor(90 * drawRange.current));
  });

  return (
    <group>
      <group position={lens.toArray()}>
        <mesh geometry={G.box} material={mat(palette.plum, { rough: 0.5, metal: 0.3 })} position={[0.1, 0, 0.18]} scale={[0.3, 0.26, 0.42]} castShadow />
        <mesh geometry={G.cyl} material={roseGold()} position={[0.1, -0.85, 0.18]} scale={[0.035, 1.5, 0.035]} />
        <mesh geometry={G.cyl} material={roseGold()} position={[0.1, 0.2, 0.06]} rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.05, 0.1]} />
        <mesh geometry={G.cyl} material={roseGold()} position={[0.1, 0.2, 0.3]} rotation={[0, 0, Math.PI / 2]} scale={[0.1, 0.05, 0.1]} />
        <mesh geometry={G.circle} material={glowMat('#FFF1D6', 3)} position={[0.04, 0, -0.03]} scale={0.06} rotation={[0, Math.PI * 0.75, 0]} />
      </group>
      <mesh geometry={beam.g} material={beamMat} position={lens.toArray()} quaternion={beamQuat} scale={[1.4, 1, 0.8]} />
      <mesh geometry={tube} material={ribbonMat} />
      <points geometry={stars} material={starMat} />
    </group>
  );
}

export function CinemaScene() {
  const r = islands.cinema.radius;
  const ping = useUi((s) => s.pariPing);
  return (
    <Island radius={r} top="#E9D3E0">
      {/* carpet */}
      <mesh geometry={G.box} material={mat('#C9A0B9', { rough: 1 })} position={[0, 0.005, -0.4]} scale={[4.6, 0.01, 4.6]} receiveShadow />
      <Screen />
      <Seat position={[-0.42, 0, 0.2]} />
      <Seat position={[0.42, 0, 0.2]} />
      <Popcorn position={[0.42, 0.49, 0.25]} />
      <Character id="harsh" position={[-1.35, 0, 0.75]} rotationY={0.45} />
      <Character id="rimi" position={[1.25, 0, 0.85]} rotationY={-0.45} />
      <RestingPari island="cinema" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.cinema.pari)} />
      <Tickets />
      <ProjectorAndRibbon />
      {/* marquee bulbs along the screen top */}
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} geometry={G.lowSphere} material={glowMat('#FFE6B8', 2)} position={[-1.75 + i * 0.35, 2.27, -3.2]} scale={0.045} />
      ))}
    </Island>
  );
}
