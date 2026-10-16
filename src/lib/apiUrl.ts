export interface EndpointTypeOption {
  value: string;
  label: string;
  description: string;
}

export const ENDPOINT_TYPES: EndpointTypeOption[] = [
  { value: '/v1/chat/completions', label: '/v1/chat/completions', description: 'Chat Completions' },
  { value: '/v1/responses', label: '/v1/responses', description: 'Responses (Realtime)' },
  { value: '/v1/embeddings', label: '/v1/embeddings', description: 'Embeddings' },
  { value: '/v1/audio/speech', label: '/v1/audio/speech', description: 'Audio Speech' },
  { value: '/v1/audio/transcriptions', label: '/v1/audio/transcriptions', description: 'Audio Transcriptions' },
  { value: '/v1/completions', label: '/v1/completions', description: 'Legacy Completions' },
  { value: '/v1/models', label: '/v1/models', description: 'Models List' },
  { value: 'custom', label: 'Custom Endpoint...', description: 'Specify custom path' },
];

export interface ApiPreset {
  id: string;
  name: string;
  baseUrl: string;
  isCustom?: boolean;
}

export const DEFAULT_API_PRESETS: ApiPreset[] = [
  { id: 'litellm', name: 'LiteLLM / Localhost', baseUrl: 'http://localhost:4100/' },
  { id: 'ollama', name: 'Ollama', baseUrl: 'http://localhost:11434/' },
  { id: 'vllm', name: 'vLLM', baseUrl: 'http://localhost:8000/' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/' },
];

/**
 * Builds the full target API URL from proxy base URL and endpoint type.
 */
export function buildApiUrl(baseUrl: string, endpointType: string, customPath?: string): string {
  const trimmedBase = (baseUrl || '').trim().replace(/\/+$/, '');
  const path = endpointType === 'custom' ? (customPath || '').trim() : endpointType;
  
  if (!path) {
    return trimmedBase ? `${trimmedBase}/` : '';
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!trimmedBase) {
    return cleanPath;
  }
  
  return `${trimmedBase}${cleanPath}`;
}

/**
 * Parses a full URL into base URL and endpoint type.
 */
export function parseApiUrl(fullUrl: string): { baseUrl: string; endpointType: string; customPath?: string } {
  if (!fullUrl || !fullUrl.trim()) {
    return { baseUrl: 'http://localhost:4100/', endpointType: '/v1/chat/completions' };
  }
  
  const trimmed = fullUrl.trim();

  // Try matching known endpoint types
  for (const opt of ENDPOINT_TYPES) {
    if (opt.value === 'custom') continue;
    if (trimmed.endsWith(opt.value)) {
      const basePart = trimmed.substring(0, trimmed.length - opt.value.length);
      const normalizedBase = basePart ? (basePart.endsWith('/') ? basePart : `${basePart}/`) : 'http://localhost:4100/';
      return { baseUrl: normalizedBase, endpointType: opt.value };
    }
  }

  // Check if it has a /v1/... endpoint path
  const v1Match = trimmed.match(/^(https?:\/\/[^\/]+(?::\d+)?(?:\/[^/]+)*?)(\/v1\/[a-zA-Z0-9_\-\/]+)$/);
  if (v1Match) {
    const base = v1Match[1].endsWith('/') ? v1Match[1] : `${v1Match[1]}/`;
    return { baseUrl: base, endpointType: 'custom', customPath: v1Match[2] };
  }

  // Fallback: whole URL as base URL with standard chat completions
  const base = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
  return { baseUrl: base, endpointType: '/v1/chat/completions' };
}
