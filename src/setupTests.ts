import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock performance.now() if needed, though it's usually available in jsdom
if (typeof performance === 'undefined') {
  (global as any).performance = { now: () => Date.now() };
}

// Mock fetch
(global as any).fetch = vi.fn();

// Mock localStorage
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: storageMock,
    writable: true,
  });
}
Object.defineProperty(global, 'localStorage', {
  value: storageMock,
  writable: true,
});
