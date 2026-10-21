/**
 * All story copy lives here. Pari's lines are kept short on purpose.
 * Facts only: no invented dates, messages or family details.
 */

export const story = {
  invite: {
    eyebrow: "Pari's Little World",
    title: 'Harsh & Rimi',
    subtitle: 'A journey to Harsh & Rimi’s wedding',
    pari: 'My humans are getting married. Naturally, I’m organising everything.',
    pariFollow: 'Come along. I’ll show you how this all happened.',
  },

  pitch: {
    eyebrow: 'Chapter one · Kolkata',
    kicker: 'Three days later',
    title: 'Some love stories begin with a hello. This one needed three days.',
    body: [
      'Harsh, a footballer from Mumbai, was playing in a COVID bubble in Kolkata when he came across Rimi’s profile on a dating app.',
      'He looked her up on Instagram and sent a message. Rimi replied after three whole days. From there, they never looked back.',
    ],
    steps: [
      { label: 'A profile on a dating app', short: 'Profile' },
      { label: 'A message on Instagram', short: 'Message' },
      { label: 'Day one, day two, day three…', short: 'Waiting' },
      { label: 'Rimi replied', short: 'Reply' },
    ],
  },

  cinema: {
    eyebrow: 'Chapter two · Kolkata',
    kicker: 'The first date',
    title: 'One movie date. A story of their own.',
    body: ['Their first in-person date was a Marvel movie in Kolkata.'],
    ticketHint: 'Tap a ticket stub in the scene, or',
    ticketButton: 'See their first photo',
    ticketCaption: 'Two tickets, one movie, and the first chapter of Harsh & Rimi.',
    pari: 'A movie date, a little popcorn, and the beginning of everything.',
  },

  proposal: {
    eyebrow: 'Chapter three · Qatar',
    kicker: 'The promise',
    title: 'Mumbai met Kolkata. Qatar witnessed the yes.',
    support: 'A visit, a room full of flowers and balloons, and a promise to keep choosing each other.',
    body: [
      'While Rimi was working in Qatar, Harsh came to visit. One evening he filled the room with flowers and balloons, and proposed with a promise ring.',
      'Rimi said yes.',
    ],
    centre: 'He’s from Mumbai. She’s from Kolkata. Their promise began in Qatar.',
    places: [
      { id: 'mumbai', name: 'Mumbai', note: 'his home', lat: 19.076, lon: 72.8777 },
      { id: 'kolkata', name: 'Kolkata', note: 'her home', lat: 22.5726, lon: 88.3639 },
      { id: 'qatar', name: 'Qatar', note: 'their promise', lat: 25.2854, lon: 51.531 },
    ],
    pari: 'Different hometowns. One very important yes.',
  },

  family: {
    eyebrow: 'Chapter four',
    kicker: 'The people who made them',
    title: 'The people who made them',
    groups: [
      {
        id: 'harshParents',
        heading: 'Harsh with Rajesh & Rupali',
        text: 'Rajesh. Rupali. And now, Rimi. Three important Rs, held close to Harsh’s heart.',
        sub: 'His parents have loved and supported him at every step.',
      },
      {
        id: 'rimiMother',
        heading: 'Rimi with her mother',
        text: 'Rimi and her mother: the love that came first, and the blessing she carries into this new beginning.',
        sub: '',
      },
      {
        id: 'familyWithPari',
        heading: 'Harsh & Rimi with Pari',
        text: 'Two humans, one furry family member, and a lot of love.',
        sub: '',
      },
    ],
    pari: 'They were already a family. I made sure of that.',
  },

  home: {
    eyebrow: 'Chapter five',
    kicker: 'Their little world',
    title: 'Half Bengali. Half Maharashtrian. Fully in love.',
    body: [
      'With this love story, he became half Bengali, and she became half Maharashtrian.',
      'Harsh, once a professional footballer, is now Head Coach of Skorost United. Rimi began as a chef and is now a hospitality manager in the Maldives.',
    ],
    interactions: {
      football: 'Kick the football',
      album: 'Open the photo album',
      pari: 'Say hello to Pari',
    },
    pariReactions: [
      'Yes, hello. I accept head scratches.',
      'Tail status: wagging.',
      'I am the reason this home is so organised.',
    ],
    pari: 'A football, a recipe book and an excellent dog bed. Priorities.',
  },

  celebrations: {
    eyebrow: 'You’re invited',
    title: 'The celebrations',
    pari: 'Now for the important part: you’re invited.',
    pariSecond: 'Come for the wedding. Stay for the dancing. Save me some attention.',
  },

  photos: {
    eyebrow: 'Photo album',
    title: 'Little moments',
    intro: 'A few snapshots from their little world.',
  },

  rsvp: {
    eyebrow: 'RSVP',
    title: 'Pari’s guest list is open.',
    intro: 'Tell us which celebrations you’ll join. Our humans can’t wait to see you.',
    pari: 'Come for the wedding. Stay for the dancing. Save me some attention.',
  },
} as const;
