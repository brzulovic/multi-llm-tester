# Model Capability Icons

## Modality Icons
```typescript
const MODALITY_ICONS = {
  text: '📝',
  vision: '👁️',
  audio: '🔊',
  code: '💻',
  multimodal: '🎭',
};
```

## Architecture Icons
```typescript
const ARCHITECTURE_ICONS = {
  dense: '🧱',           // Dense Transformer
  moe: '🧩',             // Mixture of Experts
  mamba: '🐍',           // State Space Model
  hybrid: '⚡',           // Hybrid architecture
  rnn: '🔄',             // Recurrent
  retriever: '🔍',       // Retrieval-augmented
};
```

## Specialization Icons
```typescript
const SPECIALIZATION_ICONS = {
  reasoning: '🧠',           // Chain-of-Thought Reasoning
  math: '🧮',                // Olympiad Math
  coding: '👨‍💻',             // Software Engineering
  creative: '🎨',            // Creative Writing
  analysis: '📊',            // Data Analysis
  translation: '🌐',         // Translation
  summarization: '📋',       // Summarization
  instruction: '📋',         // Instruction Following
  chat: '💬',                // Conversational
  function_calling: '🔧',    // Function/Tool Calling
  json_mode: '📄',           // Structured Output
  vision: '👁️',              // Vision Understanding
  audio: '🎵',               // Audio Processing
};
```

## Context Window Size Indicators
```typescript
const CONTEXT_INDICATORS = {
  small: { max: 8192, label: '8K', color: 'gray' },
  medium: { max: 32768, label: '32K', color: 'blue' },
  large: { max: 131072, label: '128K', color: 'green' },
  xlarge: { max: 262144, label: '256K', color: 'yellow' },
  huge: { max: 1048576, label: '1M', color: 'orange' },
  massive: { max: Infinity, label: '2M+', color: 'red' },
};
```

## Parameter Size Indicators
```typescript
const PARAM_INDICATORS = {
  tiny: { max: 1e9, label: '<1B', color: 'gray' },
  small: { max: 7e9, label: '1-7B', color: 'blue' },
  medium: { max: 20e9, label: '7-20B', color: 'green' },
  large: { max: 70e9, label: '20-70B', color: 'yellow' },
  xlarge: { max: 200e9, label: '70-200B', color: 'orange' },
  massive: { max: Infinity, label: '200B+', color: 'red' },
};
```

## Provider Icons
```typescript
const PROVIDER_ICONS = {
  openai: '🔷',
  anthropic: '🟣',
  google: '🔴🟡🔵🟢',
  meta: '🔵',
  mistral: '🟠',
  cohere: '🟢',
  groq: '⚡',
  ollama: '🦙',
  vllm: '🚀',
  litellm: '🔧',
  lmstudio: '🖥️',
  custom: '⚙️',
};
```

## Status Indicators
```typescript
const STATUS_INDICATORS = {
  idle: { icon: '⏸️', color: 'gray', label: 'Idle' },
  pending: { icon: '⏳', color: 'amber', label: 'Pending', animated: true },
  success: { icon: '✅', color: 'green', label: 'Success' },
  error: { icon: '❌', color: 'red', label: 'Error' },
  timeout: { icon: '⏰', color: 'orange', label: 'Timeout' },
  streaming: { icon: '📡', color: 'blue', label: 'Streaming', animated: true },
};
```

## Theme-Aware Color Classes (Tailwind)
```typescript
const THEME_COLORS = {
  light: {
    primary: 'indigo-600',
    primaryHover: 'indigo-700',
    bgPrimary: 'gray-50',
    bgSecondary: 'white',
    bgTertiary: 'gray-100',
    textPrimary: 'gray-900',
    textSecondary: 'gray-600',
    textMuted: 'gray-400',
    border: 'gray-200',
    success: 'emerald-600',
    error: 'red-600',
    warning: 'amber-600',
  },
  dark: {
    primary: 'indigo-400',
    primaryHover: 'indigo-300',
    bgPrimary: 'slate-950',
    bgSecondary: 'slate-900',
    bgTertiary: 'slate-800',
    textPrimary: 'gray-100',
    textSecondary: 'gray-300',
    textMuted: 'gray-500',
    border: 'gray-700',
    success: 'emerald-400',
    error: 'red-400',
    warning: 'amber-400',
  },
  'sepia-light': {
    primary: 'amber-700',
    primaryHover: 'amber-800',
    bgPrimary: 'amber-50',
    bgSecondary: 'amber-100',
    bgTertiary: 'amber-200',
    textPrimary: 'amber-900',
    textSecondary: 'amber-700',
    textMuted: 'amber-500',
    border: 'amber-300',
    success: 'lime-700',
    error: 'red-700',
    warning: 'orange-700',
  },
  'sepia-dark': {
    primary: 'amber-500',
    primaryHover: 'amber-400',
    bgPrimary: 'amber-950',
    bgSecondary: 'amber-900',
    bgTertiary: 'amber-800',
    textPrimary: 'amber-100',
    textSecondary: 'amber-300',
    textMuted: 'amber-500',
    border: 'amber-700',
    success: 'lime-400',
    error: 'red-400',
    warning: 'orange-400',
  },
  'sepia-green': {
    primary: 'green-700',
    primaryHover: 'green-800',
    bgPrimary: 'green-50',
    bgSecondary: 'green-100',
    bgTertiary: 'green-200',
    textPrimary: 'green-900',
    textSecondary: 'green-700',
    textMuted: 'green-500',
    border: 'green-300',
    success: 'emerald-700',
    error: 'red-700',
    warning: 'amber-700',
  },
};
```

## Model Capability Data Structure
```typescript
interface ModelCapability {
  id: string;
  name: string;
  provider: keyof typeof PROVIDER_ICONS;
  modalities: (keyof typeof MODALITY_ICONS)[];
  architecture: keyof typeof ARCHITECTURE_ICONS;
  specializations: (keyof typeof SPECIALIZATION_ICONS)[];
  contextWindow: number;        // in tokens
  parameterCount: number;       // in billions
  knowledgeCutoff?: string;     // ISO date string
  releaseDate?: string;         // ISO date string
  pricing?: {
    inputPer1M: number;         // USD per 1M input tokens
    outputPer1M: number;        // USD per 1M output tokens
    currency: 'USD';
  };
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsJsonMode: boolean;
  supportsSystemPrompt: boolean;
}
```

## Example Model Capabilities
```json
[
  {
    "id": "gpt-4o",
    "name": "GPT-4o",
    "provider": "openai",
    "modalities": ["text", "vision", "audio"],
    "architecture": "dense",
    "specializations": ["reasoning", "coding", "creative", "function_calling", "json_mode"],
    "contextWindow": 128000,
    "parameterCount": 200,
    "knowledgeCutoff": "2024-10",
    "releaseDate": "2024-05",
    "pricing": { "inputPer1M": 2.50, "outputPer1M": 10.00, "currency": "USD" },
    "supportsStreaming": true,
    "supportsFunctionCalling": true,
    "supportsJsonMode": true,
    "supportsSystemPrompt": true
  },
  {
    "id": "claude-3-5-sonnet",
    "name": "Claude 3.5 Sonnet",
    "provider": "anthropic",
    "modalities": ["text", "vision"],
    "architecture": "dense",
    "specializations": ["reasoning", "coding", "analysis", "creative", "function_calling"],
    "contextWindow": 200000,
    "parameterCount": 175,
    "knowledgeCutoff": "2024-04",
    "releaseDate": "2024-06",
    "pricing": { "inputPer1M": 3.00, "outputPer1M": 15.00, "currency": "USD" },
    "supportsStreaming": true,
    "supportsFunctionCalling": true,
    "supportsJsonMode": true,
    "supportsSystemPrompt": true
  },
  {
    "id": "deepseek-r1",
    "name": "DeepSeek R1",
    "provider": "custom",
    "modalities": ["text"],
    "architecture": "moe",
    "specializations": ["reasoning", "math", "coding"],
    "contextWindow": 128000,
    "parameterCount": 671,
    "knowledgeCutoff": "2024-07",
    "releaseDate": "2025-01",
    "pricing": { "inputPer1M": 0.55, "outputPer1M": 2.19, "currency": "USD" },
    "supportsStreaming": true,
    "supportsFunctionCalling": false,
    "supportsJsonMode": false,
    "supportsSystemPrompt": true
  }
]
```