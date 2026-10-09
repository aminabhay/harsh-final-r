import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { detectWebGL, storage, useReducedMotion } from './lib/device';
import { requestMeasure, startScrollTracking, useActiveChapter } from './lib/scroll';
import { useUi } from './lib/ui';
import { Hero, StoryChapters } from './components/Chapters';
import { CelebrationsSection } from './components/Celebrations';
import { GallerySection } from './components/Gallery';
import { RsvpSection } from './components/Rsvp';
import { Dialogs } from './components/Dialogs';
import { AskPari, Footer, LoadingPill, Nav, Notices, PariToast } from './components/Layout';

// The 3D bundle loads after the HTML is usable.
const Experience = lazy(() => import('./three/Experience'));

const VIEW_KEY = 'hr-view';

function initialSimple(): boolean {
  const q = new URLSearchParams(window.location.search).get('view');
  if (q === 'simple') return true;
  if (q === '3d') return false;
  return storage.get(VIEW_KEY) === 'simple';
}

/** In reduced-motion mode the camera cuts between chapters; a soft fade hides the cut. */
function ReducedFade({ enabled }: { enabled: boolean }) {
  const active = useActiveChapter();
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (first.current) {
      first.current = false;
      return;
    }
    setOn(true);
    const t = setTimeout(() => setOn(false), 60);
    return () => clearTimeout(t);
  }, [active, enabled]);
  if (!enabled) return null;
  return <div className={`reduced-fade${on ? ' is-on' : ''}`} aria-hidden="true" />;
}

export default function App() {
  const reduced = useReducedMotion();
  const [webgl] = useState(detectWebGL);
  const [simple, setSimple] = useState(initialSimple);
  const lost = useUi((s) => s.webglLost);
  const show3d = webgl && !simple && !lost;

  useEffect(() => {
    startScrollTracking();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-3d', show3d);
    document.documentElement.classList.toggle('is-simple', !show3d);
    requestMeasure();
  }, [show3d]);

  const toggleSimple = () => {
    const next = !simple;
    setSimple(next);
    storage.set(VIEW_KEY, next ? 'simple' : '3d');
    const url = new URL(window.location.href);
    url.searchParams.set('view', next ? 'simple' : '3d');
    window.history.replaceState(null, '', url);
  };

  return (
    <>
      <Nav simple={simple} canUse3d={webgl} onToggleSimple={toggleSimple} />
      {show3d && (
        <Suspense fallback={null}>
          <Experience reduced={reduced} />
        </Suspense>
      )}
      {show3d && <LoadingPill />}
      <ReducedFade enabled={show3d && reduced} />
      <Notices webgl={webgl} />
      <main id="main">
        <Hero reduced={reduced} is3d={show3d} />
        <StoryChapters />
        <CelebrationsSection />
        <GallerySection />
        <RsvpSection />
      </main>
      <Footer canUse3d={webgl} simple={simple} onToggleSimple={toggleSimple} />
      <AskPari />
      <PariToast />
      <Dialogs />
    </>
  );
}
