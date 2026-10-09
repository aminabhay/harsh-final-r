import type { ReactNode } from 'react';
import { Paw } from './icons';

/** A short, occasional line from Pari. Never covers the scene. */
export function PariSays({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`pari-says ${className}`}>
      <span className="pari-says__badge" aria-hidden="true">
        <Paw width={16} height={16} />
      </span>
      <span>
        <span className="visually-hidden">Pari says: </span>
        <span className="pari-says__text">{children}</span>
      </span>
    </p>
  );
}
