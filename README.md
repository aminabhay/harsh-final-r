# Pari's Little World: Harsh & Rimi

A scroll-driven 3D wedding site. Pari (their dog) hosts guests through a miniature world:
the invitation → Kolkata pitch → first-date cinema → the promise in Qatar → family garden →
their home → the celebrations → photos → RSVP.

React + TypeScript + Vite, Three.js via React Three Fiber/Drei. One WebGL canvas sits behind
ordinary HTML sections and native page scrolling drives the camera. All essential text and
event details are plain HTML, so they work without the 3D scene.

## Run and build

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then outputs static files to dist/
npm run preview    # serves the production build
```

`dist/` is a static site that any static host can serve. Useful URLs:
`/#celebrations`, `/#rsvp`, `/#directions`, `?view=simple` (Simple View) and `?view=3d`.

## Character models

| Character | Original (untouched) | Runtime file |
|---|---|---|
| Harsh | `models-source/harsh.glb` | `public/models/harsh.glb` |
| Rimi  | `models-source/rimi.glb`  | `public/models/rimi.glb`  |
| Pari  | `models-source/pari.glb`  | `public/models/pari.glb`  |

To replace a model, drop the new GLB into `models-source/` and run `npm run models`. That
compresses every GLB in that folder with meshopt (about 1.7 MB down to about 300 KB) and writes
the result to `public/models/`. Scale, rotation, ground offset, shadow size and clip names for
each character live in `src/config/models.ts`.

**What was found in the supplied files.** They are glTF 2.0 binaries in metres, with feet and
paws on y = 0 and the models facing +Z. They use material colours only (no texture images), and
they are already in proportion to each other (Harsh 1.905 m, Rimi 1.56 m, Pari 0.7 m), so the
scale is 1 for all three. Each model is rigged with one skin.

| Model | Clips | Used for |
|---|---|---|
| Harsh, Rimi | `Idle` (chest/head), `Wave` (left arm), `Walk` | Idle everywhere; Wave in the celebrations garden |
| Pari | `Idle`, `TailWag`, `Pant`, `LookAround`, `Walk`, `WalkHappy` | Idle + TailWag/LookAround; tapping Pari blends in Pant and a faster wag |

**Limitations.** There are no sitting, kneeling or holding clips. Because of that, the cinema
uses a standing "arrival" beside the seats and the proposal shows the couple standing face to
face at the ring box. The `Walk` clips are deliberately not used. Pari never slides across the
floor. Instead, paw prints appear along paper paths between islands and Pari is already waiting
in the next scene. Each GLB is downloaded once, and every chapter uses a skeleton clone that
shares the same geometry and materials. If a model fails to load, that character is left out
and a notice appears. No substitute character is ever shown.

## Where to edit things

| What | File |
|---|---|
| Story copy and Pari's lines | `src/config/story.ts` |
| Couple and family facts, **wedding year**, placeholder labels | `src/config/site.ts` |
| Events (dates, times, venues, Maps links, attire note) | `src/config/events.ts` |
| Photos (paths, alt text, captions, credits) | `src/config/images.ts` |
| RSVP integration | `src/config/rsvp.ts` |
| Island layout, camera framing, lighting moods | `src/config/world.ts` |
| Palette | `src/config/theme.ts` and the `:root` block in `src/styles/global.css` |

### Dates
`weddingYear` in `src/config/site.ts` is **2026** (Wedding Sunday 6 December, Reception
12 December). This enables the countdown and calendar export. Times are Asia/Kolkata and are
never converted. Calendar files use `calendarDurationHours: 3` because no end times were
supplied; change it in `site.ts`.

### Opening sequence
On the 3D view, the first downward scroll (wheel, swipe, arrow/space keys) at the top of the
page only opens the envelope and reveals the date card; scrolling then continues normally.
Links, "Follow Pari", Simple View and reduced motion are unaffected. The gate lives in
`useEnvelopeScrollGate` in `src/components/Chapters.tsx`.

### Pari between islands
`src/three/RunningPari.tsx` makes Pari run along the paper path as you scroll, using the
supplied `WalkHappy` clip driven by distance covered (she eases to `Idle` if you stop
mid-way). Her resting spots per island are `pariSpots` in `src/config/world.ts`; the route and
paw prints are shared in `src/three/pariPath.ts`.

### Replacing the stock photos
The current photos are stock images from Openverse (CC0 / CC BY / CC BY-SA, resized); they do
not show the couple or their families. They are shown without labels or credits; replace them
all before publishing (several are CC BY / CC BY-SA, which require attribution if kept).
To swap a photo, put it in `public/images/real/`, update that key in `src/config/images.ts`
(`src`, `alt`, `caption`) and delete its `credit`. Layouts crop with `object-fit: cover`;
use `focus` (CSS `object-position`) to keep faces in frame.

### Making RSVPs real
Set `endpoint` in `src/config/rsvp.ts` to a service that accepts a JSON `POST` (Formspree,
Getform, a Google Apps Script web app or your own API). A 2xx response shows the paw-print
stamp confirmation. **Until an endpoint is set, nothing is sent:** guests who press
"Send RSVP" see "Your RSVP wasn't sent" (never a false confirmation). Payload: `RsvpPayload`
in `src/lib/rsvp.ts`, including a `submissionId` for de-duplication.

### Music
The soft background music is composed live in the browser with the Web Audio API
(`src/lib/music.ts`): music-box melody, warm pads and reverb, so there are no audio files or
licences. It never autoplays; guests start/stop it with the music button in the header, and it
pauses while the tab is hidden. To use a recorded track instead, swap the implementation of
`music.play()` / `music.pause()`.

## Accessibility and fallbacks
- Everything in the canvas has an HTML equivalent: event cards, ticket and album buttons,
  "Say hello to Pari", and so on. Dialogs trap focus, close with Escape and return focus when
  they close. The lightbox supports the arrow keys and swiping.
- `prefers-reduced-motion` turns off idle animation and camera travel. The camera cuts between
  still compositions behind a soft fade instead.
- Simple View (nav button or `?view=simple`) shows the same content as a standard page with
  photographs. It is used automatically when WebGL is unavailable or the graphics context is
  lost.
- The three.js bundle is lazy-loaded, so the page is usable before 3D loads. The loading pill
  shows real file counts from three's loading manager.
- Rendering stops while the tab is hidden. Chapters away from the camera are hidden and mounted
  progressively. Pixel ratio is capped, and shadow maps are only used on capable desktops.

## Outstanding
- Real photographs to replace the stock images.
- An RSVP endpoint (until then submissions show "wasn't sent").
- Event end times, if known, to replace the provisional calendar duration.
- Skorost United is mentioned in text only (on the coaching board). Add the real logo if one is
  provided.
