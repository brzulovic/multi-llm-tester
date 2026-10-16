import { describe, it, expect } from 'vitest';
import { buildApiUrl, parseApiUrl, ENDPOINT_TYPES, DEFAULT_API_PRESETS } from './apiUrl';

describe('apiUrl utilities', () => {
  it('buildApiUrl combines base URL and endpoint type correctly', () => {
    expect(buildApiUrl('http://localhost:4100/', '/v1/chat/completions')).toBe(
      'http://localhost:4100/v1/chat/completions'
    );
    expect(buildApiUrl('http://localhost:4100', '/v1/chat/completions')).toBe(
      'http://localhost:4100/v1/chat/completions'
    );
    expect(buildApiUrl('http://localhost:4100/', '/v1/responses')).toBe(
      'http://localhost:4100/v1/responses'
    );
    expect(buildApiUrl('https://api.openai.com', '/v1/embeddings')).toBe(
      'https://api.openai.com/v1/embeddings'
    );
    expect(buildApiUrl('http://localhost:4100/', '/v1/audio/speech')).toBe(
      'http://localhost:4100/v1/audio/speech'
    );
  });

  it('buildApiUrl handles custom endpoint paths', () => {
    expect(buildApiUrl('http://localhost:4100/', 'custom', '/v1/messages')).toBe(
      'http://localhost:4100/v1/messages'
    );
    expect(buildApiUrl('http://localhost:4100', 'custom', 'v1/audio/transcriptions')).toBe(
      'http://localhost:4100/v1/audio/transcriptions'
    );
  });

  it('parseApiUrl extracts base URL and known endpoint type', () => {
    const res1 = parseApiUrl('http://localhost:4100/v1/chat/completions');
    expect(res1.baseUrl).toBe('http://localhost:4100/');
    expect(res1.endpointType).toBe('/v1/chat/completions');

    const res2 = parseApiUrl('https://api.openai.com/v1/embeddings');
    expect(res2.baseUrl).toBe('https://api.openai.com/');
    expect(res2.endpointType).toBe('/v1/embeddings');

    const res3 = parseApiUrl('http://localhost:4100/v1/audio/speech');
    expect(res3.baseUrl).toBe('http://localhost:4100/');
    expect(res3.endpointType).toBe('/v1/audio/speech');
  });

  it('provides comprehensive endpoint types and presets', () => {
    expect(ENDPOINT_TYPES.some((e) => e.value === '/v1/chat/completions')).toBe(true);
    expect(ENDPOINT_TYPES.some((e) => e.value === '/v1/responses')).toBe(true);
    expect(ENDPOINT_TYPES.some((e) => e.value === '/v1/embeddings')).toBe(true);
    expect(ENDPOINT_TYPES.some((e) => e.value === '/v1/audio/speech')).toBe(true);

    expect(DEFAULT_API_PRESETS.some((p) => p.baseUrl === 'http://localhost:4100/')).toBe(true);
  });
});
