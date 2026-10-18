# LLM Multi-Tester API & Protocol Reference

This document details the REST API endpoints, JSON payload structures, Server-Sent Events (SSE) streaming protocols, and metrics schemas utilized by the LLM Multi-Tester workbench.

---

## 📡 1. Endpoints Overview

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/v1/chat/completions` | `POST` | Primary conversational inference endpoint supporting messages, streaming, and usage metrics. |
| `/v1/models` | `GET` | Discovery endpoint returning available models from the target proxy or engine. |
| `/v1/completions` | `POST` | Legacy text completion endpoint for older generation models. |

---

## 📨 2. POST `/v1/chat/completions` Request Payload

### Headers
```http
Content-Type: application/json
X-Request-Timeout: 300
Request-Timeout: 300
Authorization: Bearer <API_KEY> (Optional / Gateway dependent)
x-litellm-api-key: Bearer <KEY> (Optional / LiteLLM proxy)
```

### Request Body Schema
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert AI assistant. Provide concise, high-accuracy responses."
    },
    {
      "role": "user",
      "content": "Describe your model architecture and capabilities."
    }
  ],
  "stream": true,
  "stream_options": {
    "include_usage": true
  },
  "timeout": 300,
  "request_timeout": 300
}
```

### Parameter Definitions
- **`model`** *(string, required)*: Identifier of the target model (e.g. `gpt-4o`, `claude-3-5-sonnet`, `deepseek-r1`, `myGemma3`).
- **`messages`** *(array, required)*: Array of message objects with `role` (`system`, `user`, or `assistant`) and `content` *(string)*.
  - When **Custom System Prompt** is enabled for this model, a `{ "role": "system", "content": "..." }` message is prepended to the array.
- **`stream`** *(boolean, optional, default: `true`)*: When enabled, response is delivered incrementally via Server-Sent Events (SSE).
- **`stream_options.include_usage`** *(boolean, optional)*: Instructs the engine to include token consumption statistics in the final SSE chunk.
- **`timeout` / `request_timeout`** *(number, optional)*: Timeout window in seconds sent to LiteLLM/vLLM proxies to prevent prematue gateway aborts.

---

## ⚡ 3. Server-Sent Events (SSE) Protocol

When `stream: true`, the gateway emits chunked text events:

```http
data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" world"},"index":0}]}

data: {"id":"chatcmpl-1","choices":[{"delta":{}}],"usage":{"prompt_tokens":18,"completion_tokens":42,"total_tokens":60}}

data: [DONE]
```

### Parser Rules
1. Strip leading `data:` and whitespace.
2. Ignore empty lines and heartbeat comments (`: ping`).
3. Terminate stream upon reading `[DONE]`.
4. Extract incremental token content from `choices[0].delta.content` or legacy `choices[0].text`.
5. Capture usage statistics from `usage.prompt_tokens` and `usage.completion_tokens`.

---

## 🔍 4. GET `/v1/models` Response Schema

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1715368132,
      "owned_by": "openai"
    },
    {
      "id": "deepseek-r1",
      "object": "model",
      "created": 1737500000,
      "owned_by": "deepseek"
    }
  ]
}
```

The app parses `data[*].id` to populate the model picker and validation lists.

---

## ⏱️ 5. Network Timing & Metrics Schema

Each model benchmark execution computes timing telemetry structured as:

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

---

## 💾 6. Supabase Persistence Schema

When synced to Supabase PostgreSQL, benchmark runs and results map to:

### Table `llm_benchmark_runs`
- `id` (text, primary key): e.g. `hist-1771459200000`
- `created_at` (timestamptz): Timestamp of execution
- `prompt` (text): Full prompt query
- `system_prompt` (text, nullable): Custom system directive if enabled
- `endpoint` (text): Target API endpoint
- `is_parallel` (boolean): Concurrency mode
- `parallel_count` (integer): Concurrency worker limit
- `models_count` (integer): Total models tested
- `status` (text): `completed` or `partial_failure`

### Table `llm_benchmark_results`
- `id` (text, primary key)
- `run_id` (text, foreign key)
- `model_name` (text)
- `status` (text): `success` | `error`
- `output_text` (text)
- `duration_ms` (numeric)
- `tokens_per_second` (numeric)
- `completion_tokens` (integer)
- `total_tokens` (integer)
- `ttfb_ms` (numeric)
- `has_system_prompt` (boolean)
- `error_message` (text, nullable)
