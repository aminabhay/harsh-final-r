import { useMemo } from 'react';
import { palette } from '../../config/theme';
import { islands } from '../../config/world';
import { story } from '../../config/story';
import type { ImageKey } from '../../config/images';
import { ui, useUi } from '../../lib/ui';
import { openFamilyPhoto } from '../../lib/actions';
import { RestingPari } from '../Character';
import { Bush, Flowers, G, Island, Label, Lantern, PhotoFrame, Tree, mat, roseGold, scatterBlooms } from '../parts';

/** Chapter four: a calm garden of family photographs, given equal space. */


function Easel({ position, rotationY, imageKey, caption }: { position: [number, number, number]; rotationY: number; imageKey: ImageKey; caption: string }) {
  const wood = mat(palette.wood);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={G.box} material={wood} position={[-0.42, 0.85, -0.05]} rotation={[0.08, 0, 0.06]} scale={[0.05, 1.75, 0.05]} castShadow />
      <mesh geometry={G.box} material={wood} position={[0.42, 0.85, -0.05]} rotation={[0.08, 0, -0.06]} scale={[0.05, 1.75, 0.05]} castShadow />
      <mesh geometry={G.box} material={wood} position={[0, 0.8, -0.38]} rotation={[-0.35, 0, 0]} scale={[0.05, 1.7, 0.05]} castShadow />
      <mesh geometry={G.box} material={roseGold()} position={[0, 0.55, 0.0]} scale={[1.0, 0.05, 0.12]} />
      <group position={[0, 1.18, 0.03]} rotation={[-0.08, 0, 0]}>
        <PhotoFrame imageKey={imageKey} width={0.96} height={1.2} onSelect={() => openFamilyPhoto(imageKey)} />
      </group>
      <group position={[0, 0.3, 0.12]}>
        <mesh geometry={G.box} material={mat(palette.ivory)} scale={[1.05, 0.2, 0.03]} castShadow />
        <Label size={0.075} position={[0, 0.01, 0.02]} maxWidth={1}>
          {caption}
        </Label>
      </group>
    </group>
  );
}

export function FamilyScene() {
  const r = islands.family.radius;
  const ping = useUi((s) => s.pariPing);
  const blooms = useMemo(
    () => [
      ...scatterBlooms(41, 70, { ring: [r - 1.4, r - 0.3], arc: [Math.PI * 0.5, Math.PI * 1.5] }, [palette.lavender, palette.blush, '#FFFFFF', palette.softPink]),
      ...scatterBlooms(42, 30, { ring: [r - 1.1, r - 0.3], arc: [-1.2, 1.2] }, [palette.lavender, '#FFFFFF', palette.butter], [0.045, 0.065], [0.08, 0.18]),
    ],
    [r],
  );
  const g = story.family.groups;
  return (
    <Island radius={r} top={palette.mint}>
      {/* a soft stepping-stone path */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} geometry={G.cyl} material={mat(palette.paper)} position={[Math.sin(i) * 0.15, 0.01, 2.8 - i * 0.55]} scale={[0.26, 0.02, 0.2]} receiveShadow />
      ))}
      <Easel position={[-2.05, 0, -0.55]} rotationY={0.42} imageKey="harshParents" caption={g[0].heading} />
      <Easel position={[0, 0, -1.25]} rotationY={0} imageKey="rimiMother" caption={g[1].heading} />
      <Easel position={[2.05, 0, -0.55]} rotationY={-0.42} imageKey="familyWithPari" caption={g[2].heading} />
      <Flowers blooms={blooms} />
      <Tree position={[-3.6, 0, -2.2]} scale={1.1} />
      <Tree position={[3.4, 0, -2.6]} scale={0.95} />
      <Bush position={[-3.9, 0, 0.8]} />
      <Bush position={[3.9, 0, 0.9]} color={palette.sage} />
      <Lantern position={[-1.0, 0, 1.2]} />
      <Lantern position={[1.1, 0, 1.3]} />
      <RestingPari island="family" play={['idle']} ping={ping} onSelect={() => ui.pari(story.family.pari)} />
    </Island>
  );
}
