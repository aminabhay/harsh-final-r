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
  credit?: { title: string; author: string; licence: string; licenceUrl: string; sourceUrl: string };
}

const base = import.meta.env.BASE_URL;
const stock = (file: string) => `${base}images/stock/${file}`;

const imageData = {
  couplePortrait: {
    id: 'couplePortrait',
    src: stock('couplePortrait.jpg'),
    alt: 'Two people holding hands on a beach at sunrise, seen in silhouette',
    caption: 'Harsh & Rimi',
    placeholder: true,
    focus: '50% 70%',
    credit: { title: 'couple holding hands Myrtle beach sunrise', author: 'David N Cooper', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/84548414@N02/7743234318' },
  },
  firstDate: {
    id: 'firstDate',
    src: stock('firstDate.jpg'),
    alt: 'Rows of red cinema seats in a warmly lit auditorium',
    caption: 'The first date: a Marvel movie in Kolkata.',
    placeholder: true,
    credit: { title: 'Cinema Seats I', author: 'edenpictures', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/10485077@N06/51830912465' },
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
    src: stock('harshParents.jpg'),
    alt: 'An older couple standing together in front of a heritage building',
    caption: 'Harsh with Rajesh & Rupali',
    placeholder: true,
    focus: '50% 40%',
    credit: { title: 'An Indian elderly couple in front of the Indian Museum in Kolkata', author: 'Billjones94', licence: 'CC0 1.0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', sourceUrl: 'https://commons.wikimedia.org/w/index.php?curid=141565776' },
  },
  rimiMother: {
    id: 'rimiMother',
    src: stock('rimiMother.jpg'),
    alt: 'A mother and daughter sharing an affectionate hug',
    caption: 'Rimi with her mother',
    placeholder: true,
    focus: '30% 40%',
    credit: { title: 'Mom & Daughter', author: 'Still Vision', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/14616167@N00/17303084598' },
  },
  familyWithPari: {
    id: 'familyWithPari',
    src: stock('familyWithPari.jpg'),
    alt: 'A couple walking their dog along a country trail',
    caption: 'Harsh & Rimi with Pari',
    placeholder: true,
    focus: '50% 60%',
    credit: { title: 'Couple walking dog on Calero Creek Trail', author: 'donjd2', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/28156071@N00/4366724680' },
  },
  maldivesMemory: {
    id: 'maldivesMemory',
    src: stock('maldivesMemory.jpg'),
    alt: 'A turquoise lagoon and white sand beach in the Maldives',
    caption: 'The Maldives, where Rimi works in hospitality.',
    placeholder: true,
    credit: { title: 'Maldives Beach view', author: 'tempoworld.net', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/', sourceUrl: 'https://www.flickr.com/photos/83318973@N00/13525467684' },
  },
  album01: {
    id: 'album01',
    src: stock('album01.jpg'),
    alt: 'Two hands held together by the sea',
    caption: 'Holding on.',
    placeholder: true,
    credit: { title: 'Vem cá', author: 'Marina Aguiar Araujo', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/12725519@N07/7149614315' },
  },
  album02: {
    id: 'album02',
    src: stock('album02.jpg'),
    alt: 'A bowl of popcorn',
    caption: 'Movie-night essentials.',
    placeholder: true,
    credit: { title: "Jed's SMALL serving of popcorn", author: 'psd', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/45581782@N00/53316358' },
  },
  album03: {
    id: 'album03',
    src: stock('album03.jpg'),
    alt: 'Two rings resting side by side',
    caption: 'A promise, kept close.',
    placeholder: true,
    credit: { title: 'Engagement Rings', author: 'phil_g', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/', sourceUrl: 'https://www.flickr.com/photos/68975104@N00/2255722884' },
  },
  album04: {
    id: 'album04',
    src: stock('album04.jpg'),
    alt: 'A stadium under floodlights at dusk',
    caption: 'Floodlights and match days.',
    placeholder: true,
    credit: { title: 'Australia vs South Africa', author: 'Rick212', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/40841792@N00/324575287' },
  },
  album05: {
    id: 'album05',
    src: stock('album05.jpg'),
    alt: 'Howrah Bridge spanning the Hooghly river in Kolkata',
    caption: 'Kolkata, her home.',
    placeholder: true,
    credit: { title: 'Howrah Bridge', author: 'Smeet Chowdhury', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/50628848@N07/7084739055' },
  },
  album06: {
    id: 'album06',
    src: stock('album06.jpg'),
    alt: 'Sunset over the sea at Marine Drive, Mumbai',
    caption: 'Mumbai, his home.',
    placeholder: true,
    focus: '50% 60%',
    credit: { title: 'Sunset view with two girls in Mumbai marine drive', author: 'Vishnu Chandra', licence: 'CC0 1.0', licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', sourceUrl: 'https://wordpress.org/photos/photo/56669d7f7a/' },
  },
  album07: {
    id: 'album07',
    src: stock('album07.jpg'),
    alt: 'Bright orange marigold flowers',
    caption: 'Marigolds for the celebrations.',
    placeholder: true,
    credit: { title: 'praying mantis on marigolds', author: 'Mike Pedroncelli', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/', sourceUrl: 'https://www.flickr.com/photos/69026156@N00/60258355' },
  },
  album08: {
    id: 'album08',
    src: stock('album08.jpg'),
    alt: 'Hands decorated with intricate henna designs',
    caption: 'Celebration season.',
    placeholder: true,
    credit: { title: "Krishna's Hands", author: 'Fred Hsu', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/', sourceUrl: 'https://www.flickr.com/photos/59769174@N00/66587122' },
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof imageData;
export const images: Record<ImageKey, SiteImage> = imageData;

export const albumKeys: ImageKey[] = [
  'couplePortrait',
  'album01',
  'album02',
  'album03',
  'album04',
  'album05',
  'album06',
  'album08',
  'maldivesMemory',
];

export const albumImages = (): SiteImage[] => albumKeys.map((k) => images[k]);
