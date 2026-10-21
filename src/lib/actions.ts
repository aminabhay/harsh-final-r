import { story } from '../config/story';
import { images, albumImages, type ImageKey } from '../config/images';
import { ui } from './ui';

/** Actions shared by 3D objects and their accessible HTML equivalents. */

export const openTicket = () =>
  ui.openDialog({ type: 'lightbox', items: [{ ...images.firstDate, caption: story.cinema.ticketCaption }], index: 0, title: 'The first date' });

const familyKeys: ImageKey[] = ['harshParents', 'rimiMother', 'familyWithPari'];
export const openFamilyPhoto = (key: ImageKey) =>
  ui.openDialog({ type: 'lightbox', items: familyKeys.map((k) => images[k]), index: Math.max(0, familyKeys.indexOf(key)), title: 'The people who made them' });

export const openAlbum = (index = 0) => ui.openDialog({ type: 'lightbox', items: albumImages(), index, title: 'Photo album' });


export const greetPari = () => {
  const lines = story.home.pariReactions;
  ui.pari(lines[Math.floor(Math.random() * lines.length)]);
};
