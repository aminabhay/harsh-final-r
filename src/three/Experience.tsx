import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { islands } from '../config/world';
import { getTier } from '../lib/device';
import { ui } from '../lib/ui';
import { WorldContext } from './context';
import { Atmosphere, CameraRig, ChapterScene } from './rig';
import { PawTrail } from './PawTrail';
import { RunningPari } from './RunningPari';
import { preloadCharacters } from './Character';
import { InvitationScene } from './scenes/Invitation';
import { PitchScene } from './scenes/Pitch';
import { CinemaScene } from './scenes/Cinema';
import { ProposalScene } from './scenes/Proposal';
import { FamilyScene } from './scenes/Family';
import { HomeScene } from './scenes/Home';
import { CelebrationsScene } from './scenes/Celebrations';
import { RsvpScene } from './scenes/Rsvp';

/** Dev-only handle for inspecting the scene from the console. */
function DevHandle() {
  const state = useThree();
  useEffect(() => {
    if (import.meta.env.DEV) (window as unknown as { __world: unknown }).__world = state;
  }, [state]);
  return null;
}

/**
 * Mirrors three.js' DefaultLoadingManager (real file counts) into the DOM loading pill.
 * Registered before any preload starts; updates are deferred so a loader starting
 * mid-render never sets React state during render.
 */
function trackLoading() {
  const m = THREE.DefaultLoadingManager;
  let errors = 0;
  let timer = 0;
  let last = { loaded: 0, total: 0 };
  const push = (active: boolean) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => ui.set({ load: { active, loaded: last.loaded, total: last.total, errors } }), 0);
  };
  m.onStart = (_u, loaded, total) => {
    last = { loaded, total };
    push(true);
  };
  m.onProgress = (_u, loaded, total) => {
    last = { loaded, total };
    push(loaded < total);
  };
  m.onLoad = () => {
    last = { loaded: last.total, total: last.total };
    push(false);
  };
  m.onError = () => {
    errors++;
    push(true);
  };
}

trackLoading();
preloadCharacters();

/** The single WebGL canvas behind the page. All chapters live in one scene graph. */
export default function Experience({ reduced }: { reduced: boolean }) {
  const tier = useMemo(getTier, []);
  const [dpr, setDpr] = useState(tier === 'high' ? 1.75 : 1.4);
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  // Stop rendering entirely while the tab is hidden.
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const ctx = useMemo(() => ({ reduced, tier, activeRef: { current: true }, progressRef: { current: 0 } }), [reduced, tier]);

  return (
    <div className="world" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={[1, Math.min(dpr, window.devicePixelRatio || 1)]}
        shadows={tier === 'high' ? { type: THREE.PCFShadowMap } : false}
        camera={{ fov: 36, near: 0.1, far: 140, position: [0, 2, 8] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            // Unmounting (e.g. switching to Simple View) also releases the context; only a
            // loss while the canvas is still on the page is a real failure.
            window.setTimeout(() => {
              if (canvas.isConnected) ui.set({ webglLost: true });
            }, 0);
          });
        }}
      >
        <WorldContext.Provider value={ctx}>
          <DevHandle />
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(tier === 'high' ? 1.75 : 1.4)} />
          <Atmosphere />
          <CameraRig />
          <PawTrail />
          <Suspense fallback={null}>
            <RunningPari />
          </Suspense>
          <ChapterScene id="invite" position={islands.invite.pos} range={[-1, 1]}>
            <InvitationScene />
          </ChapterScene>
          <ChapterScene id="pitch" position={islands.pitch.pos} range={[0, 2]}>
            <PitchScene />
          </ChapterScene>
          <ChapterScene id="cinema" position={islands.cinema.pos} range={[1, 3]}>
            <CinemaScene />
          </ChapterScene>
          <ChapterScene id="proposal" position={islands.proposal.pos} range={[2, 4]}>
            <ProposalScene />
          </ChapterScene>
          <ChapterScene id="family" position={islands.family.pos} range={[3, 5]}>
            <FamilyScene />
          </ChapterScene>
          <ChapterScene id="home" position={islands.home.pos} range={[4, 6]}>
            <HomeScene />
          </ChapterScene>
          <ChapterScene id="celebrations" position={islands.celebrations.pos} range={[5, 8]}>
            <CelebrationsScene />
          </ChapterScene>
          <ChapterScene id="rsvp" position={islands.rsvp.pos} range={[6.5, 9]}>
            <RsvpScene />
          </ChapterScene>
        </WorldContext.Provider>
      </Canvas>
    </div>
  );
}
