/**
 * Central image manifest.
 *
 * Every photograph on the site is referenced by a stable key below. To swap in a real photo,
 * drop the file into /public/images/real/ and change `src`, `alt`, `caption`, set
 * `placeholder: false` and clear `credit`. Layouts crop with object-fit: cover, so any aspect
 * ratio works; use `focus` (CSS object-position) to keep faces in frame.
 *
 * The current images are TEMPORARY stock placeholders from Openverse (Flickr / Wikimedia
 * Commons) under the licences listed. They do not show the real couple or family.
 */

export interface SiteImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  placeholder: boolean;
  focus?: string;
  /** Album tile shape: 'feature' (large), 'wide' (landscape) or default portrait. */
  layout?: 'feature' | 'wide';
  credit?: { title: string; author: string; licence: string; licenceUrl: string; sourceUrl: string };
}

const base = import.meta.env.BASE_URL;
const stock = (file: string) => `${base}images/stock/${file}`;
const album = (file: string) => `${base}images/album/${file}`;

const imageData = {
  // Real photos of Harsh, Rimi and Pari (album).
  photoThree: { id: 'photoThree', src: album('01-the-three-of-us.jpg'), alt: 'Harsh and Rimi in celebration outfits on a floral stage, with Pari on Harsh\'s lap', caption: 'Harsh, Rimi and Pari', placeholder: false, focus: '50% 52%', layout: 'feature' },
  photoHome: { id: 'photoHome', src: album('02-at-home.jpg'), alt: 'Harsh and Rimi standing together at home', caption: 'At home', placeholder: false, focus: '50% 32%' },
  photoPariTee: { id: 'photoPariTee', src: album('03-pari-tee.jpg'), alt: 'Pari wearing a white T-shirt printed with a photo of Harsh, Rimi and puppy Pari', caption: 'Pari, wearing her humans', placeholder: false, focus: '50% 55%' },
  photoPromise: { id: 'photoPromise', src: album('04-pinky-promise.jpg'), alt: 'Harsh and Rimi showing matching pinky-promise tattoos dated 15.12.2024', caption: 'A pinky promise, 15.12.2024', placeholder: false, focus: '55% 45%' },
  photoTemple: { id: 'photoTemple', src: album('05-temple.jpg'), alt: 'Harsh and Rimi outside a temple holding a tray of pink flowers', caption: 'A temple visit together', placeholder: false, focus: '50% 62%' },
  photoForehead: { id: 'photoForehead', src: album('06-forehead.jpg'), alt: 'Harsh and Rimi forehead to forehead, smiling', caption: 'Forehead to forehead', placeholder: false, focus: '50% 40%', layout: 'wide' },
  photoWaterfall: { id: 'photoWaterfall', src: album('07-waterfall.jpg'), alt: 'Harsh and Rimi holding hands, looking at a mountain waterfall', caption: 'Holding hands, chasing waterfalls', placeholder: false, focus: '50% 60%', layout: 'wide' },
  photoBirthday: { id: 'photoBirthday', src: album('08-birthday.jpg'), alt: 'Harsh and Pari beside a birthday cake, balloons and gifts, with Rimi on a video call', caption: 'A birthday across the miles', placeholder: false, focus: '50% 45%', layout: 'wide' },
  photoManali: { id: 'photoManali', src: album('09-manali.jpg'), alt: 'Rimi and Harsh taking a selfie in the snow in Manali', caption: 'Snow days in Manali', placeholder: false, focus: '50% 50%' },
  photoMatchday: { id: 'photoMatchday', src: album('10-matchday.jpg'), alt: 'Two football match tickets held up in a floodlit stadium in Kolkata', caption: 'Matchday in Kolkata', placeholder: false, focus: '50% 62%' },
  firstDate: {
    id: 'firstDate',
    src: `${base}images/real/first-date.jpg`,
    alt: 'Harsh and Rimi taking a mirror selfie together, Harsh smiling over her shoulder',
    caption: 'The first date: a Marvel movie in Kolkata.',
    placeholder: false,
    focus: '50% 40%',
  },
  qatarProposal: {
    id: 'qatarProposal',
    src: stock('qatarProposal.jpg'),
    alt: 'The Doha skyline lit up across the water in the evening',
    caption: 'Qatar, where the promise began.',
    placeholder: true,
    credit: { title: 'Doha Skyline Nacht night', author: 'FLASHPACKER TRAVELGUIDE', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/', sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=87285877' },
  },
  harshParents: {
    id: 'harshParents',
    src: `${base}images/real/harsh-parents.jpg`,
    alt: 'Harsh holding a football trophy with his parents, Rajesh and Rupali, on the pitch at dusk',
    caption: 'Harsh with Rajesh & Rupali',
    placeholder: false,
    focus: '50% 45%',
  },
  rimiMother: {
    id: 'rimiMother',
    src: `${base}images/real/rimi-mother.jpg`,
    alt: 'A young Rimi in a sari standing beside her mother, whose arm is around her shoulder',
    caption: 'Rimi with her mother',
    placeholder: false,
    focus: '50% 30%',
  },
  familyWithPari: {
    id: 'familyWithPari',
    src: `${base}images/real/harsh-rimi-pari.jpg`,
    alt: 'Harsh smiling with Pari on his lap while Rimi gives Pari a kiss',
    caption: 'Harsh & Rimi with Pari',
    placeholder: false,
    focus: '50% 40%',
  },
  firstChat: {
    id: 'firstChat',
    src: `${base}images/real/first-chat.jpg`,
    alt: 'Screenshot of Harsh and Rimi\'s first Instagram messages from December 2021, ending with Rimi replying "Thanks"',
    caption: 'Their first chat, December 2021',
    placeholder: false,
    focus: '50% 0%',
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof imageData;
export const images: Record<ImageKey, SiteImage> = imageData;

export const albumKeys: ImageKey[] = [
  // Order matters for the tile layout (feature + 4 portraits, then wides and portraits).
  'photoThree',
  'photoHome',
  'photoPariTee',
  'photoPromise',
  'photoTemple',
  'photoForehead',
  'photoWaterfall',
  'photoBirthday',
  'photoManali',
  'photoMatchday',
];

export const albumImages = (): SiteImage[] => albumKeys.map((k) => images[k]);
