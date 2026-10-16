import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock performance.now() if needed, though it's usually available in jsdom
if (typeof performance === 'undefined') {
  (global as any).performance = { now: () => Date.now() };
}

// Mock fetch
(global as any).fetch = vi.fn();
