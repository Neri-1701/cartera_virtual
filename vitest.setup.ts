import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

// Ensure we extend Vitest's expect with DOM matchers from jest-dom
if (matchers && Object.keys(matchers).length > 0) {
  expect.extend(matchers as any);
} else {
  // Fallback: no-op to avoid throwing during test setup
}

// Force a minimal mock for HTMLCanvasElement.getContext used by Chart.js in JSDOM tests
// Chart.js's internal calls to getComputedStyle / canvas context cause errors in JSDOM.
// We override getContext to return a lightweight stub and avoid calling into chart internals.
// @ts-ignore
HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: () => {},
    clearRect: () => {},
    getImageData: (x: number, y: number, w: number, h: number) => ({ data: new Array(w * h * 4) }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rotate: () => {},
    scale: () => {},
    translate: () => {},
    arc: () => {},
    fillText: () => {},
    strokeText: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => ({}),
    setLineDash: () => {},
    getLineDash: () => [],
    // properties
    fillStyle: '',
    strokeStyle: ''
  } as any;
};

// Mock react-chartjs-2 components to avoid instantiating Chart.js in tests
import { vi } from 'vitest';
vi.mock('react-chartjs-2', () => {
  const React = require('react');
  return {
    __esModule: true,
    Bar: (props: any) => React.createElement('div', { 'data-testid': 'chart' }),
    Line: (props: any) => React.createElement('div', { 'data-testid': 'chart' })
  };
});

