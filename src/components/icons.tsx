import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, focusable: false } as const;

export const Paw = (p: P) => (
  <svg {...base} {...p}>
    <g fill="currentColor">
      <ellipse cx="12" cy="16" rx="4.6" ry="3.8" />
      <ellipse cx="6.2" cy="10.6" rx="2" ry="2.6" />
      <ellipse cx="9.6" cy="6.8" rx="2" ry="2.6" />
      <ellipse cx="14.4" cy="6.8" rx="2" ry="2.6" />
      <ellipse cx="17.8" cy="10.6" rx="2" ry="2.6" />
    </g>
  </svg>
);

const stroke = { stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const Pin = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 14.9 12 21 12 21Z" />
    <circle {...stroke} cx="12" cy="9.8" r="2.3" />
  </svg>
);

export const Copy = (p: P) => (
  <svg {...base} {...p}>
    <rect {...stroke} x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path {...stroke} d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
  </svg>
);

export const Calendar = (p: P) => (
  <svg {...base} {...p}>
    <rect {...stroke} x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path {...stroke} d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);

export const Clock = (p: P) => (
  <svg {...base} {...p}>
    <circle {...stroke} cx="12" cy="12" r="8.5" />
    <path {...stroke} d="M12 7.5V12l3 2" />
  </svg>
);

export const Close = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ChevronLeft = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const ChevronRight = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Heart = (p: P) => (
  <svg {...base} {...p}>
    <path fill="currentColor" d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
  </svg>
);

export const ArrowDown = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const Info = (p: P) => (
  <svg {...base} {...p}>
    <circle {...stroke} cx="12" cy="12" r="8.5" />
    <path {...stroke} d="M12 11v5M12 8h.01" />
  </svg>
);

export const Note = (p: P) => (
  <svg {...base} {...p}>
    <path {...stroke} d="M9 17.5V6l10-2v11.5" />
    <circle {...stroke} cx="6.5" cy="17.5" r="2.5" />
    <circle {...stroke} cx="16.5" cy="15.5" r="2.5" />
  </svg>
);
