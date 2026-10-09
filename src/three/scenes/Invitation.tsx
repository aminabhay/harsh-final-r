import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { ui, useUi } from '../../lib/ui';
import { story } from '../../config/story';
import { site } from '../../config/site';
import { eventById } from '../../config/events';
import { eventStartUtc, formatEventTime } from '../../lib/dates';

const wedding = eventById('wedding');
const reception = eventById('reception');
const MONTH = 'December';
const weddingStart = eventStartUtc(wedding);
const weekday = weddingStart
  ? `${new Date(Date.UTC(site.weddingYear!, wedding.month - 1, wedding.day)).toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }).toUpperCase()} · `
  : '';
import { RestingPari } from '../Character';
import { useWorld } from '../context';
import { Bush, Flowers, G, Island, Label, mat, roseGold, scatterBlooms, Lantern, useClickable } from '../parts';

/** Opening scene: a blush envelope on a garden plinth, with Pari beside it. */

const flapShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.9, 0);
  s.lineTo(0.9, 0);
  s.quadraticCurveTo(0.12, -0.6, 0, -0.66);
  s.quadraticCurveTo(-0.12, -0.6, -0.9, 0);
  return new THREE.ShapeGeometry(s, 16);
})();

function Envelope() {
  const { reduced, progressRef } = useWorld();
  const open = useUi((s) => s.envelopeOpen);
  const flap = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    // Opens on "Follow Pari", or naturally once the guest starts scrolling.
    const goal = open || progressRef.current > 0.62 ? 1 : 0;
    t.current = reduced ? goal : THREE.MathUtils.damp(t.current, goal, 2.4, dt);
    // Flap swings forward and up, settling just behind the hinge; the card rises clear of
    // the pocket, then steps forward so it sits in front of the open flap.
    const flapT = THREE.MathUtils.smoothstep(t.current, 0, 0.45);
    const riseT = THREE.MathUtils.smoothstep(t.current, 0.3, 0.8);
    const forwardT = THREE.MathUtils.smoothstep(t.current, 0.75, 1);
    if (flap.current) flap.current.rotation.x = -flapT * Math.PI * 1.05;
    if (card.current) {
      card.current.position.y = -0.05 + riseT * 0.86;
      card.current.position.z = -0.005 + forwardT * 0.075;
    }
  });

  const blush = mat('#E4AABB', { rough: 0.8, side: THREE.DoubleSide });
  const inner = mat('#D896AA', { rough: 0.9, side: THREE.DoubleSide });
  const click = useClickable(() => ui.set({ envelopeOpen: true }));

  return (
    <group position={[-0.45, 0.42, 0]} rotation={[-0.28, 0.12, 0]} {...click}>
      {/* back */}
      <mesh geometry={G.box} material={inner} position={[0, 0, -0.035]} scale={[1.8, 1.2, 0.02]} castShadow />
      {/* card */}
      <group ref={card} position={[0, -0.05, -0.005]}>
        <mesh geometry={G.box} material={mat(palette.ivory, { rough: 0.95 })} scale={[1.62, 1.08, 0.012]} />
        <mesh geometry={G.box} material={roseGold()} position={[0, 0, 0.004]} scale={[1.5, 0.96, 0.006]} />
        <mesh geometry={G.box} material={mat(palette.ivory, { rough: 0.95 })} position={[0, 0, 0.007]} scale={[1.48, 0.94, 0.006]} />
        <Label size={0.05} font="sans" color={palette.roseGold} position={[0, 0.39, 0.012]} letterSpacing={0.2}>
          TOGETHER WITH PARI
        </Label>
        <Label size={0.13} position={[0, 0.265, 0.012]}>
          {site.couple.fullNames.harsh}
        </Label>
        <Label size={0.13} position={[0, 0.125, 0.012]}>
          {`& ${site.couple.fullNames.rimi}`}
        </Label>
        <Label size={0.06} font="italic" position={[0, 0.005, 0.012]}>
          are getting married
        </Label>
        {/* the date reveal */}
        <Label size={0.125} position={[0, -0.13, 0.012]} color="#8A5A50">
          {`${wedding.day} ${MONTH} ${site.weddingYear ?? ''}`.trim()}
        </Label>
        <Label size={0.038} font="sans" color={palette.text} position={[0, -0.255, 0.012]} letterSpacing={0.14}>
          {`${weekday}${formatEventTime(wedding).toUpperCase()} · ${wedding.city.toUpperCase()}`}
        </Label>
        <Label size={0.034} font="sans" color={palette.roseGold} position={[0, -0.355, 0.012]} letterSpacing={0.14}>
          {`RECEPTION · ${reception.day} ${MONTH.toUpperCase()} · ${reception.city.toUpperCase()}`}
        </Label>
      </group>
      {/* front pocket: two side triangles + bottom triangle feel */}
      <mesh geometry={G.box} material={blush} position={[0, -0.2, 0.012]} scale={[1.8, 0.8, 0.02]} castShadow />
      <mesh geometry={G.box} material={roseGold()} position={[-0.45, -0.18, 0.024]} rotation={[0, 0, 0.42]} scale={[1.02, 0.012, 0.004]} />
      <mesh geometry={G.box} material={roseGold()} position={[0.45, -0.18, 0.024]} rotation={[0, 0, -0.42]} scale={[1.02, 0.012, 0.004]} />
      {/* flap hinged on the top edge */}
      <group ref={flap} position={[0, 0.6, 0.028]}>
        <mesh geometry={flapShape} material={blush} castShadow />
        <mesh geometry={G.cyl} material={roseGold()} position={[0, -0.56, 0.012]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.02, 0.12]} />
        <Label size={0.07} color={palette.ivory} position={[0, -0.56, 0.025]}>
          H·R
        </Label>
      </group>
    </group>
  );
}

export function InvitationScene() {
  const r = islands.invite.radius;
  const ping = useUi((s) => s.pariPing);
  const blooms = useMemo(
    () => [
      ...scatterBlooms(11, 60, { ring: [r - 1.3, r - 0.35], arc: [0.75, Math.PI * 2 - 0.75] }, [palette.blush, palette.softPink, palette.lavender, '#FFFFFF', '#F2B8C6']),
      ...scatterBlooms(12, 24, { x: [-1.7, 1.1], z: [-0.9, -0.25] }, [palette.blush, palette.softPink, '#FFFFFF']),
    ],
    [r],
  );
  return (
    <Island radius={r} top={palette.mint}>
      {/* Low pedestal for the envelope */}
      <mesh geometry={G.cyl} material={mat(palette.paper)} position={[-0.45, 0.06, 0]} scale={[1.25, 0.12, 0.7]} receiveShadow castShadow />
      <mesh geometry={G.torus} material={roseGold()} position={[-0.45, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 0.7, 0.5]} />
      <Envelope />
      <Flowers blooms={blooms} />
      <Bush position={[-2.4, 0, -1.2]} scale={1.1} />
      <Bush position={[2.3, 0, -1.6]} scale={0.9} color={palette.sage} />
      <Bush position={[-1.2, 0, -2.6]} scale={1.2} color={palette.deepLeaf} />
      <Lantern position={[1.85, 0, 0.9]} />
      <Lantern position={[-2.3, 0, 0.9]} />
      <RestingPari island="invite" play={['idle', 'tailWag']} ping={ping} onSelect={() => ui.pari(story.invite.pariFollow)} />
    </Island>
  );
}
