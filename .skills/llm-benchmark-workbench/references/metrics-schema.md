# Metrics Schema

## NetworkTimingMetrics

```typescript
export interface NetworkTimingMetrics {
  promptTokens: number;       // Input prompt token count
  completionTokens: number;   // Output generated token count
  totalTokens: number;        // Sum of prompt + completion tokens
  durationMs: number;         // Total wall-clock time from dispatch to finish
  tokensPerSecond: number;    // completionTokens / (durationMs / 1000)
  ttfbMs?: number;            // Time to First Byte (dispatch to first token or response header)
  downloadMs?: number;        // Stream duration (durationMs - ttfbMs)
  queueMs?: number;           // Concurrency queue delay before request was dispatched
  requestSentMs?: number;     // Network dispatch serialization overhead
}
```

## BenchmarkRun

```typescript
export interface BenchmarkRun {
  id: string;
  timestamp: number;
  prompt: string;
  endpoint: string;
  customHeaders: string;
  models: string[];
  results: ModelResult[];
  isParallel: boolean;
  parallelCount: number;
  streamResponse: boolean;
  timeoutSeconds: number;
  systemPrompt?: {
    enabled: boolean;
    content: string;
    mode: 'specific' | 'all';
    targetModels: string[];
  };
}
```

## ModelResult

```typescript
export interface ModelResult {
  id: string;
  modelName: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  output: string;
  metrics?: NetworkTimingMetrics;
  error?: string;
  hasSystemPrompt: boolean;
  systemPrompt?: string;
  statusCode?: number;
  statusText?: string;
  startTimeOffsetMs?: number;
  isTimeout?: boolean;
  rawErrorDetails?: string;
  audioUrl?: string;
  audioBlobSize?: number;
  audioMimeType?: string;
}
```