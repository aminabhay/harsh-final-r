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
| Harsh | `models-source/harsh.glb` (builder v2; v1 in `models-source/archive/`) | `public/models/harsh.glb` |
| Rimi  | `models-source/rimi.glb` (builder v2, grounded with `groundOffset: -0.016`; v1 in `models-source/archive/`) | `public/models/rimi.glb`  |
| Pari  | `models-source/pari.glb` (pack v3, 17 Oct 2026; v1 in `models-source/archive/`) | `public/models/pari.glb`  |
| Harsh, wedding outfit | `models-source/wedding-harsh.glb` (celebrations garden only) | `public/models/wedding-harsh.glb` |
| Rimi, wedding outfit | `models-source/wedding-rimi.glb` (celebrations garden only; `groundOffset: -0.014`) | `public/models/wedding-rimi.glb` |

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

### Who sees which celebrations (three links)
Configured in `src/config/audiences.ts`:

| Link | Guest | Sees |
|---|---|---|
| `https://your-site/` | Default (most guests) | Reception only. The invitation still says the wedding is on 5 December in Kolkata (no time). |
| `https://your-site/?invite=kolkata` | Wedding guests | Wedding only; no mention of the reception. |
| `https://your-site/?invite=family` | Close family | All four celebrations. |

This controls the event cards, the 3D pavilions, the invitation card, the hero date line, the
countdown, the RSVP choices (single-event guests don't have to pick) and the Sangeet song
request. Each RSVP records which link was used (`audience`). Change the codes in
`audiences.ts`; unknown codes fall back to the default. It curates the view, it is not
access control: someone who edits their link can see more.

### Dates
`weddingYear` in `src/config/site.ts` is **2026** (Wedding Saturday 5 December, Reception
12 December). This enables the countdown and calendar export. Times are Asia/Kolkata and are
never converted. Calendar files use `calendarDurationHours: 3` because no end times were
supplied; change it in `site.ts`.

### Opening sequence
On the 3D view, the first downward scroll (wheel, swipe, arrow/space keys) at the top of the
page only opens the envelope and reveals the date card; scrolling then continues normally.
Links, Simple View and reduced motion are unaffected. The gate lives in
`useEnvelopeScrollGate` in `src/components/Chapters.tsx`.

### Pari between islands (and nothing behind a card)
Between every two chapters there is a **travel zone** (`<TravelZone>`, `[data-travel]`): an
empty stretch of page. The previous card scrolls fully away first, then Pari runs to the next
island (`src/three/RunningPari.tsx`, supplied `WalkHappy` clip, stride matched to distance)
while the camera follows her, then a short clear stretch lets her arrive before the next card
appears. Each island's own animations (calendar pages, phone, lighting, ring box) play while
the scene is clear (`scrollState.scene` in `src/lib/scroll.ts`). If a guest scrolls faster than
the journey can play, scrolling pauses briefly until Pari catches up
(`src/lib/scrollHold.ts`); menu links are never blocked. Resting spots: `pariSpots` in
`src/config/world.ts`; route and paw prints: `src/three/pariPath.ts`.

### Photos
The photo album uses the couple's real photos in `public/images/album/` (entries `photo*` in
`src/config/images.ts`, ordered by `albumKeys`). Each has a caption, alt text, a `focus`
(CSS `object-position`, controls the crop) and an optional `layout`: `'feature'` (large tile),
`'wide'` (landscape) or default portrait. The same photos appear on the home scene's walls
and in Simple View.

Real photos in `public/images/real/`: the ticket photo (`firstDate`), Harsh with his parents
(`harshParents`), Rimi with her mother (`rimiMother`), Harsh & Rimi with Pari
(`familyWithPari`) and their first chat
(`firstChat`, shown in the Chapter One phone). Photos are re-encoded upright with all
metadata (including phone GPS location) stripped before being published.

Stock placeholder still used: `qatarProposal` (Simple View). They are uncredited, so replace them before
publishing.

### RSVPs with Supabase
1. Create a Supabase project. In **SQL Editor**, run both files in `supabase/migrations/`
   in order (or `supabase db push` with the CLI):
   `20261021000000_create_rsvps.sql`, then `20261021010000_add_customer_id.sql`.
2. Copy the **Project URL** and the **anon / publishable key** (Project Settings -> API) into
   `.env` (template: `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
   Never use the `service_role` / secret key in the website. Restart `npm run dev` after
   editing `.env`, and set the same two variables in your hosting provider before building.
3. RSVPs appear in **Table Editor -> rsvps**.

How it behaves:
- The website can only **insert** RSVPs (Row Level Security + grants). Nobody can read, edit or
  delete RSVPs from the browser; guests' contact details stay private.
- **Shared database, several couples:** every RSVP has a `customer_id` (this site:
  `harshwedsrimi`, set in `src/config/site.ts` as `customerId`). It must exist in the
  `customers` table; add a couple with
  `insert into customers (id, name) values ('newcouple', 'New Couple');`.
  Filter the RSVPs table by `customer_id` to see one couple's guests.
- **One RSVP per guest, per couple:** an email (case-insensitive) or phone number (last 10
  digits, any format) that already exists *for this customer* is rejected by the database, and the guest sees *"You have
  already RSVP'd. To make any changes, please connect with the bride or groom directly."*
  To let someone RSVP again, delete their row in the dashboard.
- Each form fill has a `submission_id`, so an accidental resend is not counted twice.
- Columns: customer_id, name, contact (email or phone), attending, events, party size (including the
  guest), dietary, message, Sangeet song request, which invite link was used (`audience`),
  and `created_at`.
- Code: `src/lib/supabase.ts` (client, loaded only when someone submits) and
  `src/lib/rsvp.ts` (`submitToSupabase`).

### Cinema screen
The image on the 3D cinema screen is `public/images/cinema/screen.webp` (supplied by the
couple). Replace that file to change it; it is cover-fitted to the screen's 2:1 frame.

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
