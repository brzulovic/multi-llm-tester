# LLM Multi-Tester & Benchmark Workbench

A developer-first, high-precision benchmarking and comparison suite for Large Language Model (LLM) endpoints compatible with OpenAI, LiteLLM, vLLM, Ollama, LM Studio, and Groq proxies.

---

## 🚀 Key Capabilities

### 1. Multi-Model Execution & Real-Time Benchmarking
- **Sequential or Parallel Dispatch**: Test multiple models consecutively or run concurrent queries with configurable parallel worker limits (1–10 threads).
- **Server-Sent Events (SSE) Streaming**: Low-latency token streaming that prevents 50-second idle gateway disconnects while measuring true Time-To-First-Byte (TTFB) and real-time generation velocity (tokens/sec).
- **Fastest Model Anchor & Highlight**: One-click navigation to the fastest responding model in any run.

### 2. Custom System Prompt Injection
- **Model-Specific Targeting**: Inject custom system directives (e.g., expert persona, structured JSON schemas, concise guidelines) into the payload for select models or globally across all models.
- **Preset System Personas**: Quick-select options for "Concise Expert", "Deep Analyst", and "Code Architect".
- **Visual Status Badges**: Visual indicators on cards, waterfall rows, and XY graphs indicating whether a custom system prompt was injected.

### 3. Interactive XY Capability & Benchmark Graph
- **Dynamic Axis Metrics**: Plot any model benchmark pairing—Latency (ms/s), Generation Speed (tok/s), Total Tokens, Completion Tokens, or TTFB.
- **Mouseover Capabilities Card**: Hover over any model node on the chart to inspect:
  - Context window size (e.g., 128K, 200K, 1M, 2M tokens)
  - Supported modalities (Text, Vision, Audio, Code)
  - Parameter size and architecture (e.g., 70B Parameters, Mixture of Experts, Dense Transformer)
  - Specializations (Chain-of-Thought Reasoning, Olympiad Math, Software Engineering)
  - Real-time run metrics (Duration, Speed, Tokens, TTFB, Injected System Prompt)

### 4. Chrome DevTools-Grade Network Waterfall
- **Sub-Millisecond Timing Breakdown**:
  - **Queueing / Stagger Delay**: Wait time before dispatch.
  - **Request Sent**: Payload serialization and HTTP transmission.
  - **Waiting (TTFB)**: Time To First Byte from the inference engine.
  - **Content Download**: SSE stream reception and output rendering.
- **Sortable Columns**: Sort by Name, State (HTTP status), Time (Latency), Speed (tokens/s), or Tokens count.
- **State Filter Dropdown**: Instantly filter models by state (`All`, `Success`, `Failed`, `Pending`, `Idle`).

### 5. Token-Level Model Comparison & Diff Viewer
- Side-by-side or inline comparison of outputs from any two models.
- Word and token-level diff highlighting (insertions, deletions, modifications).
- Similarity score calculation and vocabulary divergence statistics.

### 6. Themes & Accessibility
- Complete multi-theme engine supporting:
  - **Light**: Crisp, high-contrast daylight theme.
  - **Dark**: Deep navy and dark slate `#0b0f17` theme optimized for dark mode.
  - **Sepia Dark**: Warm, low-strain night palette.
  - **Sepia Light**: Editorial paper aesthetic.
  - **Greenish Sepia**: Soothing forest-paper tone.

### 7. Supabase & History Persistence
- Automatic or manual cloud sync to PostgreSQL via Supabase.
- Full offline history export and import via JSON / CSV files.

---

## 🛠️ Configuration Guide

### 1. Setting Up Your API Endpoint
Configure your proxy base URL in the **Configuration** panel:
- **Default Gateway**: `http://localhost:4100/`
- **Ollama**: `http://localhost:11434/`
- **vLLM / Local Server**: `http://localhost:8000/`
- **Groq LPU**: `https://api.groq.com/openai/`

Choose your endpoint format:
- `OpenAI Chat (/v1/chat/completions)` (Recommended)
- `OpenAI Legacy Completions (/v1/completions)`
- `Custom Endpoint Path`

### 2. Custom Headers & Authentication
Add required authorization headers (one per line) in the Custom Headers area:
```http
Authorization: Bearer YOUR_API_KEY
x-litellm-api-key: Bearer sk-1234
X-Custom-Routing: true
```

### 3. Model List Selection
Enter model names (one per line) or use **Fetch Models** to query `/v1/models` from your gateway.
You can sort models alphabetically (A-Z, Z-A) or shuffle them into random execution order.

---

## 🧪 Prompt Presets
Includes test prompts for standard evaluations:
- **Classic Prompts**: Capabilities inquiry, Python Fibonacci with unit tests, Logic riddles, Creative storytelling.
- **Nerdy Kings Test Battery**: 15 battle-tested prompts evaluating reasoning, edge-case math, code generation, ethics, and multi-turn instruction following.

---

## 📋 License & Compatibility
- **License**: Apache-2.0
- **Standard**: Compatible with OpenAI REST API v1 specification.
