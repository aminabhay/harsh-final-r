import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { characters } from '../config/models';
import { scrollState } from '../lib/scroll';
import { useWorld } from './context';
import { BlobShadow } from './parts';
import { pariState, restingIsland, travelAt } from './pariPath';

/**
 * Pari running between islands as the guest scrolls. Her position follows the scroll along
 * the paper path, and her legs use the supplied `WalkHappy` clip, advanced by the distance she
 * actually covers, so her paws keep pace with the ground (and she settles to `Idle` if the
 * guest stops mid-way). The resting Pari on each island hides while she is running.
 */

/** Ground covered by one `WalkHappy` cycle, in metres. */
const STRIDE = 1.15;

export function RunningPari() {
  const spec = characters.pari;
  const gltf = useGLTF(spec.url);
  const { reduced, tier } = useWorld();
  const group = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const m = cloneSkinned(gltf.scene);
    m.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = tier === 'high';
    });
    return m;
  }, [gltf.scene, tier]);

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);
  const actions = useMemo(() => {
    const get = (name: string) => {
      const clip = gltf.animations.find((a) => a.name === name);
      return clip ? mixer.clipAction(clip) : null;
    };
    return { run: get(spec.clips.walkHappy), idle: get(spec.clips.idle), wag: get(spec.clips.tailWag) };
  }, [gltf.animations, mixer, spec.clips]);

  useEffect(() => {
    actions.run?.play();
    actions.idle?.play();
    actions.run?.setEffectiveWeight(0);
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  const s = useRef({ f: 0, init: false, last: new THREE.Vector3(), lastT: -1, yaw: 0, runW: 0 });
  const tan = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const st = s.current;
    const target = reduced ? Math.round(scrollState.f) : scrollState.f;
    // Same easing as the camera, so Pari stays in shot while she runs.
    st.f = !st.init || reduced ? target : THREE.MathUtils.damp(st.f, target, 3.2, dt);
    pariState.f = st.f;

    const travel = reduced ? null : travelAt(st.f);
    pariState.running = !!travel;
    pariState.restingAt = restingIsland(st.f);
    const g = group.current;
    if (!g) return;
    if (!travel) {
      g.visible = false;
      st.init = true;
      st.lastT = -1;
      return;
    }

    const { seg, t } = travel;
    const p = seg.curve.getPointAt(t);
    seg.curve.getTangentAt(t, tan);
    const moved = st.lastT < 0 ? 0 : p.distanceTo(st.last);
    const backwards = st.lastT >= 0 && t < st.lastT;
    st.last.copy(p);
    st.lastT = t;

    g.visible = true;
    g.position.copy(p);
    const yaw = Math.atan2(tan.x, tan.z) + (backwards ? Math.PI : 0);
    // Shortest-path turn towards the running direction.
    let d = yaw - st.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    st.yaw = st.init ? st.yaw + d * Math.min(1, dt * 10) : yaw;
    g.rotation.y = st.yaw;
    st.init = true;

    // Blend run <-> idle by speed, and drive the stride by distance covered.
    const speed = moved / Math.max(dt, 1e-4);
    st.runW = THREE.MathUtils.damp(st.runW, Math.min(1, speed / 0.6), 8, dt);
    if (actions.run) {
      actions.run.setEffectiveWeight(st.runW);
      actions.run.setEffectiveTimeScale(Math.min(3, (speed / STRIDE) * actions.run.getClip().duration));
    }
    actions.idle?.setEffectiveWeight(1 - st.runW);
    mixer.update(dt);
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={model} />
      <BlobShadow radius={spec.shadowRadius} stretch={1.7} opacity={0.75} />
    </group>
  );
}
