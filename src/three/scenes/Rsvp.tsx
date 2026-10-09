import { useMemo } from 'react';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import { ui, useUi } from '../../lib/ui';
import { RestingPari } from '../Character';
import { Bush, Flowers, G, Island, Label, Lantern, mat, roseGold, scatterBlooms } from '../parts';

/** Final island: Pari beside a big invitation card: the guest list. */

export function RsvpScene() {
  const r = islands.rsvp.radius;
  const ping = useUi((s) => s.pariPing);
  const blooms = useMemo(
    () => scatterBlooms(91, 60, { ring: [r - 1.3, r - 0.3], arc: [-2, 2] }, [palette.blush, palette.softPink, palette.lavender, '#FFFFFF']),
    [r],
  );
  return (
    <Island radius={r} top={palette.mint}>
      <group position={[-0.55, 0, -0.2]} rotation={[0, 0.18, 0]}>
        {/* easel-backed card */}
        <mesh geometry={G.box} material={mat(palette.wood)} position={[0, 0.7, -0.3]} rotation={[-0.3, 0, 0]} scale={[0.06, 1.45, 0.06]} castShadow />
        <group position={[0, 0.95, 0]} rotation={[-0.12, 0, 0]}>
          <mesh geometry={G.box} material={roseGold()} scale={[1.36, 1.72, 0.04]} castShadow />
          <mesh geometry={G.box} material={mat(palette.ivory)} position={[0, 0, 0.012]} scale={[1.28, 1.64, 0.03]} />
          <Label size={0.06} font="sans" color={palette.roseGold} position={[0, 0.62, 0.03]} letterSpacing={0.18}>
            RSVP
          </Label>
          <Label size={0.14} position={[0, 0.42, 0.03]} maxWidth={1.1} textAlign="center" lineHeight={1}>
            {"Pari's guest list"}
          </Label>
          {[0.15, 0.0, -0.15, -0.3].map((y, i) => (
            <group key={y}>
              <mesh geometry={G.box} material={mat(palette.blush)} position={[-0.42, y, 0.03]} scale={[0.07, 0.07, 0.004]} />
              <mesh geometry={G.box} material={mat('#E9DCD6')} position={[0.08, y, 0.03]} scale={[0.78 - i * 0.08, 0.018, 0.004]} />
            </group>
          ))}
          {/* paw stamp */}
          <group position={[0.36, -0.58, 0.032]} rotation={[0, 0, -0.2]}>
            <mesh geometry={G.circle} material={mat(palette.roseGold, { side: THREE.DoubleSide })} scale={[0.09, 0.075, 1]} />
            {[
              [-0.08, 0.09],
              [-0.03, 0.125],
              [0.03, 0.125],
              [0.08, 0.09],
            ].map(([x, y]) => (
              <mesh key={x} geometry={G.circle} material={mat(palette.roseGold, { side: THREE.DoubleSide })} position={[x, y, 0]} scale={[0.026, 0.032, 1]} />
            ))}
          </group>
        </group>
      </group>
      {/* quill + ink */}
      <group position={[0.4, 0, 0.7]}>
        <mesh geometry={G.cyl} material={mat(palette.plum)} position={[0, 0.08, 0]} scale={[0.08, 0.16, 0.08]} castShadow />
        <mesh geometry={G.sphere} material={mat('#FFFFFF')} position={[0.05, 0.32, 0]} rotation={[0, 0, -0.35]} scale={[0.03, 0.22, 0.06]} castShadow />
      </group>
      <Flowers blooms={blooms} />
      <Bush position={[-2.3, 0, -1.3]} scale={1.1} />
      <Bush position={[2.2, 0, -1.5]} color={palette.sage} />
      <Lantern position={[-1.8, 0, 1.2]} />
      <RestingPari island="rsvp" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.rsvp.pari)} />
    </Island>
  );
}
