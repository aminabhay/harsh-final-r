import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { ui, useUi } from '../../lib/ui';
import { Character, RestingPari } from '../Character';
import { useWorld } from '../context';
import { Bush, G, Island, Label, mat, roseGold, glowMat, useCanvasTexture } from '../parts';

/** Chapter one: a floodlit miniature pitch in Kolkata, inside a soft "bubble". */

function PitchMarkings() {
  const line = mat('#FFFFFF', { rough: 0.6 });
  const w = 7.2;
  const d = 4.6;
  const t = 0.05;
  return (
    <group position={[0, 0.003, 0]}>
      <mesh geometry={G.box} material={mat('#9CC7A4', { rough: 1 })} position={[0, -0.002, 0]} scale={[w + 0.6, 0.004, d + 0.6]} receiveShadow />
      {/* stripes */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} geometry={G.box} material={mat('#AFD3B5', { rough: 1 })} position={[-w / 2 + (i + 0.5) * (w / 6) - w / 12 + (i % 2) * 0, 0.0005, 0]} scale={[w / 12, 0.004, d]} visible={i % 2 === 0} receiveShadow />
      ))}
      <mesh geometry={G.box} material={line} position={[0, 0.002, d / 2]} scale={[w, 0.004, t]} />
      <mesh geometry={G.box} material={line} position={[0, 0.002, -d / 2]} scale={[w, 0.004, t]} />
      <mesh geometry={G.box} material={line} position={[w / 2, 0.002, 0]} scale={[t, 0.004, d]} />
      <mesh geometry={G.box} material={line} position={[-w / 2, 0.002, 0]} scale={[t, 0.004, d]} />
      <mesh geometry={G.box} material={line} position={[0, 0.002, 0]} scale={[t, 0.004, d]} />
      <mesh material={line} position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.77, 48]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={G.box} material={line} position={[s * (w / 2 - 0.7), 0.002, 0]} scale={[t, 0.004, 2.2]} />
          <mesh geometry={G.box} material={line} position={[s * (w / 2 - 0.35), 0.002, 1.1]} scale={[0.7, 0.004, t]} />
          <mesh geometry={G.box} material={line} position={[s * (w / 2 - 0.35), 0.002, -1.1]} scale={[0.7, 0.004, t]} />
        </group>
      ))}
    </group>
  );
}

function Goal({ x, flip = 1 }: { x: number; flip?: number }) {
  const post = mat('#FFFFFF', { rough: 0.4 });
  const net = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFFFF', wireframe: true, transparent: true, opacity: 0.45 }), []);
  return (
    <group position={[x, 0, 0]} rotation={[0, flip > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
      <mesh geometry={G.cyl} material={post} position={[-0.7, 0.4, 0]} scale={[0.03, 0.8, 0.03]} castShadow />
      <mesh geometry={G.cyl} material={post} position={[0.7, 0.4, 0]} scale={[0.03, 0.8, 0.03]} castShadow />
      <mesh geometry={G.cyl} material={post} position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.03, 1.43, 0.03]} castShadow />
      <mesh material={net} position={[0, 0.4, -0.25]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[1.4, 0.85, 10, 6]} />
      </mesh>
    </group>
  );
}

function Floodlight({ position, rot }: { position: [number, number, number]; rot: number }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh geometry={G.cyl} material={mat('#C9C0D6', { rough: 0.5, metal: 0.4 })} position={[0, 1.6, 0]} scale={[0.05, 3.2, 0.05]} castShadow />
      <mesh geometry={G.box} material={mat('#B9AFC9', { metal: 0.4, rough: 0.5 })} position={[0, 3.25, 0.05]} rotation={[0.5, 0, 0]} scale={[0.7, 0.42, 0.08]} />
      {[-0.2, 0, 0.2].map((x) =>
        [-0.1, 0.1].map((y) => <mesh key={`${x}${y}`} geometry={G.circle} material={glowMat('#FFF6E0', 2.4)} position={[x, 3.25 + y * 0.88, 0.1 + y * 0.48]} rotation={[0.5 - 0.0, 0, 0]} scale={0.075} />),
      )}
    </group>
  );
}

function Football({ position }: { position: [number, number, number] }) {
  const tex = useCanvasTexture(256, 128, (g, w, h) => {
    g.fillStyle = '#FFFFFF';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#43363C';
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (i + (j % 2) * 0.5) * (w / 6);
        const y = (j + 0.5) * (h / 3);
        g.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
          g.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12);
        }
        g.fill();
      }
    }
  });
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.11, 24, 16]} />
      <meshStandardMaterial map={tex} roughness={0.5} />
    </mesh>
  );
}

function DeskCalendar() {
  const { progressRef, reduced } = useWorld();
  const pages = useRef<(THREE.Group | null)[]>([]);
  const turned = useRef([0, 0, 0]);
  useFrame((_, dt) => {
    const p = progressRef.current;
    [0.3, 0.38, 0.46].forEach((th, i) => {
      const goal = p > th ? 1 : 0;
      turned.current[i] = reduced ? goal : THREE.MathUtils.damp(turned.current[i], goal, 8, dt);
      const g = pages.current[i];
      if (g) g.rotation.x = -turned.current[i] * Math.PI * 0.9;
    });
  });
  return (
    <group position={[0, 0.06, 0]}>
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.18, -0.02]} rotation={[-0.25, 0, 0]} scale={[0.42, 0.36, 0.02]} />
      {/* page under the stack: the reply */}
      <group position={[0, 0.34, 0]} rotation={[-0.25, 0, 0]}>
        <mesh geometry={G.plane} material={mat(palette.softPink, { side: THREE.DoubleSide })} position={[0, -0.16, 0.012]} scale={[0.36, 0.3, 1]} />
        <Label size={0.05} font="sans" position={[0, -0.12, 0.014]} color={palette.text}>
          REPLY
        </Label>
        <Label size={0.09} position={[0, -0.2, 0.014]} color={palette.roseGold}>
          ♥
        </Label>
      </group>
      {['DAY 3', 'DAY 2', 'DAY 1'].map((d, i) => (
        <group key={d} position={[0, 0.34, 0.016 + i * 0.004]} rotation={[-0.25, 0, 0]}>
          <group ref={(el) => (pages.current[2 - i] = el)}>
            <mesh geometry={G.plane} material={mat('#FFFFFF', { side: THREE.DoubleSide })} position={[0, -0.16, 0]} scale={[0.36, 0.3, 1]} />
            <Label size={0.05} font="sans" position={[0, -0.09, 0.002]} color={palette.roseGold}>
              {d}
            </Label>
            <Label size={0.12} position={[0, -0.2, 0.002]}>
              {String(3 - i)}
            </Label>
          </group>
        </group>
      ))}
    </group>
  );
}

function Phone() {
  const { progressRef, reduced } = useWorld();
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!screen.current) return;
    const replied = progressRef.current > 0.5;
    screen.current.emissiveIntensity = replied ? (reduced ? 1.2 : 1 + Math.sin(clock.elapsedTime * 3) * 0.25) : 0.25;
    screen.current.emissive.set(replied ? palette.blush : '#B8B0E8');
  });
  return (
    <group rotation={[-Math.PI / 2, 0, 0.4]}>
      <mesh geometry={G.box} material={mat('#3D3440', { rough: 0.3, metal: 0.3 })} scale={[0.09, 0.18, 0.012]} castShadow />
      <mesh position={[0, 0, 0.007]}>
        <planeGeometry args={[0.078, 0.165]} />
        <meshStandardMaterial ref={screen} color="#2A2430" emissive="#B8B0E8" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Bubble() {
  const m = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#F3EEFF',
        transparent: true,
        opacity: 0.12,
        roughness: 0.1,
        metalness: 0,
        iridescence: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );
  return (
    <mesh material={m} position={[0, 0, -0.4]} scale={[5.2, 3.8, 3.8]} renderOrder={2}>
      <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
    </mesh>
  );
}

export function PitchScene() {
  const r = islands.pitch.radius;
  const ping = useUi((s) => s.pariPing);
  return (
    <Island radius={r} top={palette.mint}>
      <PitchMarkings />
      <Goal x={-3.75} flip={-1} />
      <Goal x={3.75} flip={1} />
      <Floodlight position={[-4.6, 0, -2.9]} rot={0.7} />
      <Floodlight position={[4.6, 0, -2.9]} rot={-0.7} />
      <Bubble />
      {/* Bench with kit bag, phone and a little calendar */}
      <group position={[2.3, 0, 2.95]} rotation={[0, -0.25, 0]}>
        <mesh geometry={G.box} material={mat(palette.wood)} position={[0, 0.42, 0]} scale={[1.6, 0.06, 0.4]} castShadow receiveShadow />
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} geometry={G.box} material={mat('#B99A80')} position={[x, 0.2, 0]} scale={[0.06, 0.4, 0.36]} castShadow />
        ))}
        <group position={[-0.45, 0.45, 0]}>
          <mesh geometry={G.cyl} material={mat('#6E6A8F', { rough: 0.7 })} position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.14, 0.55, 0.14]} castShadow />
          <mesh geometry={G.torus} material={mat('#43363C')} position={[0, 0.25, 0]} scale={[0.17, 0.12, 0.5]} />
          <mesh geometry={G.box} material={mat(palette.blush)} position={[0, 0.13, 0.142]} scale={[0.36, 0.08, 0.004]} />
        </group>
        <group position={[0.1, 0.46, 0.05]}>
          <Phone />
        </group>
        <group position={[0.5, 0.45, 0]}>
          <DeskCalendar />
        </group>
      </group>
      <Football position={[0.85, 0.11, 0.9]} />
      <Character id="harsh" position={[0.2, 0, 0.6]} rotationY={0.18} play={['idle']} />
      <RestingPari island="pitch" play={['idle', 'lookAround']} ping={ping} onSelect={() => ui.pari(story.pitch.pari)} />
      <group position={[-3.6, 0, 3.2]} rotation={[0, 0.5, 0]}>
        <mesh geometry={G.cyl} material={mat(palette.wood)} position={[0, 0.35, 0]} scale={[0.03, 0.7, 0.03]} />
        <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0.72, 0]} scale={[0.8, 0.26, 0.04]} castShadow />
        <Label size={0.12} position={[0, 0.72, 0.025]}>
          Kolkata
        </Label>
      </group>
      <Bush position={[-4.5, 0, 1.8]} scale={0.8} />
      <Bush position={[4.8, 0, 1.2]} scale={0.7} color={palette.sage} />
    </Island>
  );
}
