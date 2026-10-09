import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { events, type EventId } from '../../config/events';
import { formatShortDate } from '../../lib/dates';
import { ui, useUi } from '../../lib/ui';
import { Character, RestingPari } from '../Character';
import { useWorld } from '../context';
import { Bush, FairyLights, Flowers, G, Island, Label, Lantern, Tree, mat, roseGold, glowMat, scatterBlooms, useClickable, type Bloom } from '../parts';

/** Chapter six: four miniature celebration settings. Tapping one opens its HTML details. */

function Pavilion({ id, position, rotationY, children }: { id: EventId; position: [number, number, number]; rotationY: number; children: ReactNode }) {
  const ev = events.find((e) => e.id === id)!;
  const d = formatShortDate(ev);
  const { reduced } = useWorld();
  const hover = useRef(false);
  const group = useRef<THREE.Group>(null);
  const click = useClickable(() => ui.openDialog({ type: 'event', id }));
  useFrame((_, dt) => {
    if (!group.current) return;
    const goal = hover.current && !reduced ? 1.04 : 1;
    const s = THREE.MathUtils.damp(group.current.scale.x, goal, 10, dt);
    group.current.scale.setScalar(s);
  });
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group
        ref={group}
        {...click}
        onPointerOver={(e) => {
          click.onPointerOver(e);
          hover.current = true;
        }}
        onPointerOut={() => {
          click.onPointerOut();
          hover.current = false;
        }}
      >
        {children}
        {/* sign */}
        <group position={[0, 0, 1.45]}>
          <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.3, 0]} scale={[0.02, 0.6, 0.02]} />
          <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0.62, 0]} scale={[1.15, 0.36, 0.04]} castShadow />
          <mesh geometry={G.box} material={mat(ev.accent)} position={[0, 0.45, 0.001]} scale={[1.15, 0.03, 0.042]} />
          <Label size={0.15} position={[0, 0.67, 0.025]}>
            {ev.name}
          </Label>
          <Label size={0.06} font="sans" position={[0, 0.54, 0.025]} letterSpacing={0.12}>
            {`${d.day} ${d.month.toUpperCase()} · ${ev.city.toUpperCase()}`}
          </Label>
        </group>
        {/* generous hit area */}
        <mesh geometry={G.box} position={[0, 1, 0.2]} scale={[2.4, 2.2, 2.6]} visible={false} />
      </group>
    </group>
  );
}

function Sangeet() {
  return (
    <group>
      <mesh geometry={G.box} material={mat(palette.lavender)} position={[0, 0.12, 0]} scale={[2.1, 0.24, 1.5]} castShadow receiveShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.245, 0.75]} scale={[2.1, 0.02, 0.02]} />
      <mesh geometry={G.box} material={mat('#B9A3D6')} position={[0, 1.2, -0.7]} scale={[2.1, 1.9, 0.08]} castShadow />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.75, 0.24, -0.35]}>
          <mesh geometry={G.box} material={mat('#5A4A63', { rough: 0.5 })} position={[0, 0.3, 0]} scale={[0.3, 0.6, 0.28]} castShadow />
          <mesh geometry={G.cyl} material={mat('#2F2733')} position={[0, 0.42, 0.141]} rotation={[Math.PI / 2, 0, 0]} scale={[0.09, 0.01, 0.09]} />
          <mesh geometry={G.cyl} material={mat('#2F2733')} position={[0, 0.18, 0.141]} rotation={[Math.PI / 2, 0, 0]} scale={[0.06, 0.01, 0.06]} />
        </group>
      ))}
      <group position={[0, 0.24, 0.1]}>
        <mesh geometry={G.cyl} material={roseGold()} position={[0, 0.5, 0]} scale={[0.012, 1, 0.012]} />
        <mesh geometry={G.sphere} material={mat('#3D3440', { rough: 0.4, metal: 0.4 })} position={[0, 1.02, 0]} scale={0.04} />
      </group>
      {/* music notes on the backdrop */}
      <Label size={0.36} color={palette.ivory} position={[-0.5, 1.5, -0.65]}>
        ♪
      </Label>
      <Label size={0.28} color={palette.ivory} position={[0.55, 1.25, -0.65]}>
        ♫
      </Label>
      <FairyLights from={[-1.05, 2.15, -0.66]} to={[1.05, 2.15, -0.66]} sag={0.35} count={14} />
      <FairyLights from={[-1.05, 1.75, -0.66]} to={[1.05, 1.75, -0.66]} sag={0.25} count={12} color="#FFD9F0" />
    </group>
  );
}

function Haldi() {
  const petals = useMemo<Bloom[]>(() => scatterBlooms(61, 22, { x: [-0.9, 0.9], z: [-0.3, 0.7] }, [palette.butter, '#F6B84B', '#FFFFFF'], [0.05, 0.08], [0.02, 0.05]), []);
  return (
    <group>
      <mesh geometry={G.box} material={mat(palette.mint)} position={[0, 0.02, 0.1]} scale={[2.0, 0.04, 1.6]} receiveShadow />
      {[
        [-0.9, -0.6],
        [0.9, -0.6],
        [-0.9, 0.8],
        [0.9, 0.8],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} geometry={G.cyl} material={mat(palette.wood)} position={[x, 0.9, z]} scale={[0.04, 1.8, 0.04]} castShadow />
      ))}
      {/* canopy */}
      <mesh position={[0, 1.85, 0.1]} castShadow>
        <coneGeometry args={[1.45, 0.5, 4, 1]} />
        <meshStandardMaterial color={palette.butter} roughness={0.9} />
      </mesh>
      {/* marigold strings */}
      {[-0.9, 0.9].map((x) =>
        [-0.6, 0.8].map((z) => (
          <group key={`${x}${z}`}>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh key={i} geometry={G.lowSphere} material={mat(i % 2 ? '#F6B84B' : '#F08A3C')} position={[x + (x > 0 ? 0.06 : -0.06), 1.65 - i * 0.11, z]} scale={0.045} />
            ))}
          </group>
        )),
      )}
      {/* bowls of petals */}
      {[-0.45, 0, 0.45].map((x, i) => (
        <group key={x} position={[x, 0.04, 0.25 + (i % 2) * 0.2]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.16, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={i === 1 ? '#FFFFFF' : palette.roseGold} metalness={i === 1 ? 0 : 0.7} roughness={0.35} side={THREE.DoubleSide} />
          </mesh>
          <mesh geometry={G.cyl} material={mat(i === 1 ? '#F6B84B' : palette.butter)} position={[0, 0.055, 0]} scale={[0.14, 0.01, 0.14]} />
        </group>
      ))}
      <Flowers blooms={petals} petals={4} />
    </group>
  );
}

function Wedding() {
  const arch = useMemo(() => {
    const blooms: Bloom[] = [];
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * Math.PI;
      blooms.push({ p: [Math.cos(a) * 0.95, Math.sin(a) * 1.0 + 0.95, -0.2 + Math.sin(i * 3.1) * 0.05], c: [palette.blush, '#FFFFFF', palette.softPink, '#F2B8C6'][i % 4], s: 0.11, stem: 0.001 });
    }
    return blooms;
  }, []);
  const aisle = useMemo<Bloom[]>(() => scatterBlooms(71, 18, { x: [-0.45, 0.45], z: [0, 1.1] }, [palette.blush, '#FFFFFF'], [0.04, 0.06], [0.01, 0.02]), []);
  return (
    <group>
      <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0.015, 0.4]} scale={[0.7, 0.03, 1.6]} receiveShadow />
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <torusGeometry args={[0.95, 0.05, 10, 40, Math.PI]} />
        <meshStandardMaterial color={palette.ivory} roughness={0.7} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} geometry={G.cyl} material={mat(palette.ivory)} position={[x, 0.475, -0.2]} scale={[0.05, 0.95, 0.05]} castShadow />
      ))}
      <Flowers blooms={arch} />
      <Flowers blooms={aisle} petals={4} />
      {/* drapes */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={G.box} material={mat('#FFFFFF', { opacity: 0.8 })} position={[s * 1.05, 0.95, -0.3]} rotation={[0, 0, s * -0.05]} scale={[0.22, 1.9, 0.02]} />
      ))}
      <Lantern position={[-0.55, 0, 1.0]} />
      <Lantern position={[0.55, 0, 1.0]} />
    </group>
  );
}

function Reception() {
  const { reduced } = useWorld();
  const roof = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (roof.current && !reduced) (roof.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25 + Math.sin(clock.elapsedTime * 0.8) * 0.05;
  });
  const pillars = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2 + Math.PI / 8);
  return (
    <group>
      <mesh geometry={G.cyl} material={mat(palette.ivory)} position={[0, 0.06, 0]} scale={[1.2, 0.12, 1.2]} castShadow receiveShadow />
      <mesh geometry={G.torus} material={roseGold()} position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1.2, 0.6]} />
      {pillars.map((a, i) => (
        <mesh key={i} geometry={G.cyl} material={roseGold()} position={[Math.sin(a) * 1.05, 0.95, Math.cos(a) * 1.05]} scale={[0.03, 1.7, 0.03]} castShadow />
      ))}
      <mesh ref={roof} position={[0, 2.05, 0]} castShadow>
        <coneGeometry args={[1.35, 0.6, 8, 1]} />
        <meshStandardMaterial color="#E8C1B5" metalness={0.6} roughness={0.35} emissive="#FFD6C0" emissiveIntensity={0.25} />
      </mesh>
      <mesh geometry={G.sphere} material={roseGold()} position={[0, 2.42, 0]} scale={0.07} />
      {/* a subtle nod to football: a little trophy-ball on a plinth */}
      <mesh geometry={G.cyl} material={mat(palette.paper)} position={[0, 0.4, 0]} scale={[0.18, 0.56, 0.18]} castShadow />
      <mesh geometry={G.sphere} material={mat('#FFFFFF', { rough: 0.4 })} position={[0, 0.8, 0]} scale={0.12} castShadow />
      {pillars.map((a, i) => {
        const b = pillars[(i + 1) % pillars.length];
        return (
          <FairyLights key={i} from={[Math.sin(a) * 1.05, 1.75, Math.cos(a) * 1.05]} to={[Math.sin(b) * 1.05, 1.75, Math.cos(b) * 1.05]} sag={0.12} count={5} color="#FFE1C9" />
        );
      })}
      <mesh geometry={G.lowSphere} material={glowMat('#FFE7D6', 1.2)} position={[0, 1.6, 0]} scale={0.06} />
    </group>
  );
}

export function CelebrationsScene() {
  const r = islands.celebrations.radius;
  const ping = useUi((s) => s.pariPing);
  const blooms = useMemo(
    () => scatterBlooms(81, 120, { ring: [r - 1.5, r - 0.35] }, [palette.blush, palette.lavender, '#FFFFFF', palette.butter, palette.softPink], [0.05, 0.085], [0.12, 0.32]),
    [r],
  );
  return (
    <Island radius={r} top={palette.mint}>
      <mesh geometry={G.cyl} material={mat(palette.paper)} position={[0, 0.005, 0.8]} scale={[2.2, 0.01, 2.2]} receiveShadow />
      <Pavilion id="sangeet" position={[-4.4, 0, -0.9]} rotationY={0.6}>
        <Sangeet />
      </Pavilion>
      <Pavilion id="haldi" position={[-1.55, 0, -2.9]} rotationY={0.18}>
        <Haldi />
      </Pavilion>
      <Pavilion id="wedding" position={[1.55, 0, -2.9]} rotationY={-0.18}>
        <Wedding />
      </Pavilion>
      <Pavilion id="reception" position={[4.4, 0, -0.9]} rotationY={-0.6}>
        <Reception />
      </Pavilion>
      <Flowers blooms={blooms} />
      <Tree position={[-6.6, 0, -4.2]} />
      <Tree position={[6.4, 0, -4.4]} scale={1.1} />
      <Bush position={[-7.3, 0, 1.8]} />
      <Bush position={[7.2, 0, 1.6]} color={palette.sage} />
      <Character id="harsh" position={[-0.65, 0, 1.2]} rotationY={0.12} play={['idle', 'wave']} />
      <Character id="rimi" position={[0.6, 0, 1.25]} rotationY={-0.12} play={['idle', 'wave']} />
      <RestingPari island="celebrations" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.celebrations.pariSecond)} />
    </Island>
  );
}
