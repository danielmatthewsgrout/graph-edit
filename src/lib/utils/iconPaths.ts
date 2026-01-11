import type { NodeIcon } from '../types';

export function getIconPath(icon: NodeIcon | undefined): string {
  switch (icon) {
    case 'square': return 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z';
    case 'diamond': return 'M6 3h12l4 6-4 6H6l-4-6z';
    case 'star': return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
    case 'hexagon': return 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z';
    case 'triangle': return 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z';
    case 'user': return 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';
    case 'building': return 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18 M6 12h10 M6 12V8 M6 12H4 M10 12V8 M10 12H8 M14 12V8 M14 12h-2 M18 12V8 M18 12h-2 M6 18h12 M6 22h12';
    case 'folder': return 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z';
    case 'file': return 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8';
    case 'database': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6c-3.31 0-6 .9-6 2v2c0 1.1 2.69 2 6 2s6-.9 6-2V8c0-1.1-2.69-2-6-2z M6 14c0 1.1 2.69 2 6 2s6-.9 6-2v-2c0 1.1-2.69 2-6 2s-6-.9-6-2v2z M6 18c0 1.1 2.69 2 6 2s6-.9 6-2v-2c0 1.1-2.69 2-6 2s-6-.9-6-2v2z';
    case 'server': return 'M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M6 4h12v4H6z M6 12h12 M6 16h12';
    case 'globe': return 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18';
    case 'heart': return 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
    case 'zap': return 'M13 2L3 14h9l-1 8 10-12h-9l1-8z';
    case 'shield': return 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
    default: return '';
  }
}
