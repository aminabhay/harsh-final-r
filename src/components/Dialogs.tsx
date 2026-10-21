import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ui, useUi } from '../lib/ui';
import { eventById } from '../config/events';
import type { SiteImage } from '../config/images';
import { EventDetails } from './Celebrations';
import { ChevronLeft, ChevronRight, Close } from './icons';

/* ------------------------------------------------------------------ */
/* Accessible modal: focus trap, Escape to close, focus restore.        */
/* ------------------------------------------------------------------ */

export function Modal({ title, onClose, children, wide = false, labelHidden = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; labelHidden?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current!;
    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (el) => el.offsetParent !== null,
      );
    (focusables()[0] ?? root).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('modal-open');
      previous?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal__card${wide ? ' modal__card--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="modal__head">
          <h2 id={titleId} className={labelHidden ? 'visually-hidden' : 'modal__title'}>
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Close />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/* Lightbox                                                              */
/* ------------------------------------------------------------------ */

function Lightbox({ items, index, title }: { items: SiteImage[]; index: number; title?: string }) {
  const [i, setI] = useState(index);
  const img = items[i];
  const many = items.length > 1;
  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);

  useEffect(() => {
    if (!many) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [many]);

  // Basic swipe support on touch screens.
  const touch = useRef<number | null>(null);

  return (
    <Modal title={title ?? 'Photo'} onClose={ui.closeDialog} wide>
      <figure className="lightbox" onTouchStart={(e) => (touch.current = e.touches[0].clientX)} onTouchEnd={(e) => {
        if (touch.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}>
        <div className="lightbox__frame">
          <img src={img.src} alt={img.alt} />
          {many && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev icon-btn" onClick={() => go(-1)} aria-label="Previous photo">
                <ChevronLeft />
              </button>
              <button type="button" className="lightbox__nav lightbox__nav--next icon-btn" onClick={() => go(1)} aria-label="Next photo">
                <ChevronRight />
              </button>
            </>
          )}
        </div>
        <figcaption>
          <span>{img.caption}</span>
          {many && (
            <span className="lightbox__count" aria-live="polite">
              {i + 1} / {items.length}
            </span>
          )}
        </figcaption>
      </figure>
    </Modal>
  );
}

export function Dialogs() {
  const dialog = useUi((s) => s.dialog);
  if (!dialog) return null;
  if (dialog.type === 'event') {
    const ev = eventById(dialog.id);
    return (
      <Modal title={ev.name} onClose={ui.closeDialog}>
        <EventDetails event={ev} headingLevel="none" />
      </Modal>
    );
  }
  if (dialog.type === 'lightbox') return <Lightbox key={dialog.items[dialog.index]?.id} items={dialog.items} index={dialog.index} title={dialog.title} />;
  return null;
}
