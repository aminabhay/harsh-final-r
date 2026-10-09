import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { palette } from '../config/theme';
import { pariState, segments } from './pariPath';
import { useWorld } from './context';
import { G, mat, roseGold } from './parts';

/**
 * Paper paths between islands with Pari's paw prints. Prints appear progressively as the
 * camera travels, so Pari "walks" ahead of the guest, without sliding a static model.
 */

function pawGeometry() {
  const pad = new THREE.CircleGeometry(0.06, 20);
  pad.scale(1.1, 0.9, 1);
  const toes = [
    [-0.065, 0.07],
    [-0.024, 0.1],
    [0.024, 0.1],
    [0.065, 0.07],
  ].map(([x, y]) => {
    const t = new THREE.CircleGeometry(0.022, 14);
    t.scale(0.9, 1.15, 1);
    t.translate(x, y, 0);
    return t;
  });
  const g = mergeGeometries([pad, ...toes])!;
  // Lay flat with the toes pointing along +Z (the direction of travel once yawed).
  g.rotateX(-Math.PI / 2);
  g.rotateY(Math.PI);
  return g;
}

const up = new THREE.Vector3(0, 1, 0);

export function PawTrail() {
  const { reduced } = useWorld();
  const ref = useRef<THREE.InstancedMesh>(null);

  const { prints, paths } = useMemo(() => {
    const prints: { pos: THREE.Vector3; yaw: number; f: number }[] = [];
    const paths: { mid: THREE.Vector3; len: number; yaw: number }[] = [];
    segments.forEach((s) => {
      const start = s.edgeA;
      const end = s.edgeB;
      const dir = end.clone().sub(start).setY(0).normalize();
      const len = start.distanceTo(end);
      const yaw = Math.atan2(dir.x, dir.z);
      paths.push({ mid: start.clone().lerp(end, 0.5), len, yaw });
      const side = new THREE.Vector3().crossVectors(up, dir).normalize();
      const step = 0.42;
      const n = Math.floor(len / step);
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const p = start.clone().lerp(end, t).addScaledVector(side, i % 2 ? 0.11 : -0.11);
        p.y = -0.035;
        // When Pari's run reaches this point (same route as RunningPari).
        prints.push({ pos: p, yaw, f: s.f0 + s.tEdgeA + t * (s.tEdgeB - s.tEdgeA) });
      }
    });
    return { prints, paths };
  }, []);

  const geo = useMemo(pawGeometry, []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: palette.roseGold, roughness: 0.6, metalness: 0.2 }), []);
  const scales = useRef<Float32Array>(new Float32Array(prints.length));
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const sv = useMemo(() => new THREE.Vector3(), []);

  const write = () => {
    const mesh = ref.current!;
    prints.forEach((p, i) => {
      q.setFromAxisAngle(up, p.yaw);
      sv.setScalar(scales.current[i]);
      m4.compose(p.pos, q, sv);
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    if (reduced) scales.current.fill(1);
    write();
    ref.current!.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useFrame((_, dt) => {
    if (reduced) return;
    // Prints appear just behind Pari as she runs.
    const lead = pariState.f - 0.02;
    let changed = false;
    prints.forEach((p, i) => {
      const goal = lead >= p.f ? 1 : 0;
      const cur = scales.current[i];
      if (Math.abs(goal - cur) > 0.001) {
        scales.current[i] = THREE.MathUtils.damp(cur, goal, 9, dt);
        changed = true;
      }
    });
    if (changed) write();
  });

  return (
    <group>
      {paths.map((p, i) => (
        <group key={i} position={[p.mid.x, -0.06, p.mid.z]} rotation={[0, p.yaw, 0]}>
          <mesh geometry={G.box} material={mat(palette.paper)} scale={[1.1, 0.04, p.len + 0.6]} receiveShadow />
          <mesh geometry={G.box} material={roseGold()} position={[0.56, 0.005, 0]} scale={[0.02, 0.04, p.len + 0.6]} />
          <mesh geometry={G.box} material={roseGold()} position={[-0.56, 0.005, 0]} scale={[0.02, 0.04, p.len + 0.6]} />
        </group>
      ))}
      <instancedMesh ref={ref} args={[geo, material, prints.length]} frustumCulled={false} />
    </group>
  );
}
