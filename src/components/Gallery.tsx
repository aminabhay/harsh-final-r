import { story } from '../config/story';
import { albumImages } from '../config/images';
import { openAlbum } from '../lib/actions';

export function GallerySection() {
  const items = albumImages();
  const s = story.photos;
  return (
    <section id="photos" data-chapter="photos" className="gallery" aria-labelledby="photos-title">
      <div className="gallery__inner">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="photos-title" className="chapter__title">
          {s.title}
        </h2>
        <p>{s.intro}</p>
        <ul className="gallery__grid">
          {items.map((img, i) => (
            <li key={img.id} className={i === 0 ? 'is-wide' : ''}>
              <button type="button" className="gallery__item" onClick={() => openAlbum(i)} aria-label={`Open photo ${i + 1} of ${items.length}: ${img.caption}`}>
                <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.focus }} />
                <span className="gallery__caption">{img.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
