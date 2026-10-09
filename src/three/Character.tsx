import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { characters, type CharacterId } from '../config/models';
import { ui } from '../lib/ui';
import { BlobShadow, useClickable } from './parts';
import { useWorld } from './context';
import { pariSpots } from '../config/world';
import { pariState, type IslandId } from './pariPath';

/**
 * One supplied character, placed in a chapter.
 *
 * Each GLB is downloaded and parsed exactly once (useGLTF cache). Every chapter gets a
 * lightweight skeleton clone that SHARES geometry and materials with the original, so
 * GPU memory does not grow with the number of appearances.
 *
 * Only clips that exist in the file are played (see config/models.ts).
 */

export type ClipKey = string;

interface Props {
  id: CharacterId;
  position?: [number, number, number];
  rotationY?: number;
  /** Clip keys (from the manifest) to loop together; they drive different bones. */
  play?: ClipKey[];
  /** Increment to trigger a short reaction (Pari: pant + happy tail). */
  ping?: number;
  onSelect?: () => void;
  shadow?: boolean;
  /** Checked every frame; the character is hidden while it returns false. */
  showWhen?: () => boolean;
}

function CharacterInner({ id, position = [0, 0, 0], rotationY = 0, play = ['idle'], ping = 0, onSelect, shadow = true, showWhen }: Props) {
  const spec = characters[id];
  const gltf = useGLTF(spec.url);
  const { reduced, activeRef, tier } = useWorld();

  const model = useMemo(() => {
    const m = cloneSkinned(gltf.scene);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = tier === 'high';
        mesh.receiveShadow = false;
      }
    });
    return m;
  }, [gltf.scene, tier]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const clip = (key: string) => {
    const name = spec.clips[key];
    return name ? gltf.animations.find((a) => a.name === name) : undefined;
  };

  // Base loops, cross-faded whenever the requested set changes.
  const playKey = play.join(',');
  useEffect(() => {
    const actions = play
      .map((k) => clip(k))
      .filter((c): c is THREE.AnimationClip => !!c)
      .map((c) => {
        const a = mixer.clipAction(c);
        a.reset();
        a.time = Math.random() * c.duration;
        a.setEffectiveWeight(1);
        a.fadeIn(0.5).play();
        return a;
      });
    mixer.update(0);
    return () => actions.forEach((a) => a.fadeOut(0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, playKey]);

  // One-off reaction (Pari only): pant + quicker tail wag, blended in and out.
  useEffect(() => {
    if (!ping || id !== 'pari') return;
    const pant = clip('pant');
    const wag = clip('tailWag');
    const extra: THREE.AnimationAction[] = [];
    if (pant) {
      const a = mixer.clipAction(pant);
      a.reset().fadeIn(0.3).play();
      extra.push(a);
    }
    const wagAction = wag ? mixer.existingAction(wag) ?? mixer.clipAction(wag) : null;
    if (wagAction) {
      if (!wagAction.isRunning()) wagAction.reset().fadeIn(0.3).play();
      wagAction.setEffectiveTimeScale(1.8);
    }
    if (reduced) mixer.update(0.25);
    const t = setTimeout(() => {
      extra.forEach((a) => a.fadeOut(0.6));
      wagAction?.setEffectiveTimeScale(1);
      if (wagAction && !play.includes('tailWag')) wagAction.fadeOut(0.6);
    }, 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ping]);

  useEffect(() => () => {
    mixer.stopAllAction();
  }, [mixer]);

  const root = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (showWhen && root.current) root.current.visible = showWhen();
    if (!activeRef.current) return;
    // Reduced motion: hold a still pose (no idle loops).
    if (reduced) return;
    mixer.update(Math.min(dt, 1 / 20));
  });

  const click = useClickable(() => onSelect?.());
  const s = spec.scale;

  return (
    <group ref={root} position={position} rotation={[0, rotationY + spec.rotationY, 0]}>
      <primitive object={model} scale={s} position={[0, spec.groundOffset, 0]} {...(onSelect ? click : {})} />
      {shadow && <BlobShadow radius={spec.shadowRadius} stretch={id === 'pari' ? 1.7 : 0.8} opacity={0.75} />}
    </group>
  );
}

class ModelBoundary extends Component<{ id: CharacterId; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    console.warn(`[models] ${this.props.id} failed to load`, err);
    ui.assetFailed(this.props.id);
  }
  render() {
    // Never substitute a different character: if the supplied model fails, show nothing.
    return this.state.failed ? null : this.props.children;
  }
}

export function Character(props: Props) {
  return (
    <ModelBoundary id={props.id}>
      <CharacterInner {...props} />
    </ModelBoundary>
  );
}

/** Pari resting on an island; hidden while she is running between islands. */
export function RestingPari({ island, ...rest }: Omit<Props, 'id' | 'position' | 'rotationY' | 'showWhen'> & { island: IslandId }) {
  const spot = pariSpots[island];
  return (
    <Character
      id="pari"
      position={spot.pos}
      rotationY={spot.yaw}
      showWhen={() => !pariState.running && pariState.restingAt === island}
      {...rest}
    />
  );
}

export function preloadCharacters() {
  Object.values(characters).forEach((c) => useGLTF.preload(c.url));
}
