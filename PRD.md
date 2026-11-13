# Product Requirements Document (PRD)
# LLM Multi-Tester & Benchmark Workbench

## 1. Executive Summary
The **LLM Multi-Tester & Benchmark Workbench** is a high-performance, developer-first benchmarking and prompt engineering suite designed for comparing, analyzing, and stress-testing Large Language Models across OpenAI-compatible APIs, Ollama, vLLM, LM Studio, Groq, and LiteLLM proxies.

---

## 2. Target Audience & Core Use Cases
- **AI Engineers & Researchers**: Benchmarking inference latency, TTFB, tokens/sec, and output quality across multiple models simultaneously.
- **Prompt Engineers**: Testing and refining system prompts, evaluating response fidelity, and analyzing token-level diffs.
- **Product & Engineering Teams**: Storing historical test runs, syncing metrics to Supabase (PostgreSQL), and exporting data for analysis (CSV, JSON, shareable links).

---

## 3. Core Features & Functional Requirements

### 3.1. Multi-Model Inference & Execution Engine
- **Sequential & Parallel Execution**: Support for sequential runs and parallel concurrent workers (1–10 threads).
- **SSE Streaming**: Real-time Server-Sent Events (SSE) token streaming with Time-to-First-Byte (TTFB) measurement and live speed calculations.
- **Timeout Management**: Configurable per-request timeouts (default 300s) to accommodate local models and reasoning chains.
- **Bulk Retry**: One-click bulk retry for failed, pending, or idle results from the results toolbar.

### 3.2. Prompt Engineering & System Prompt Layer
- **Custom System Prompt Injection**: Enable/disable system directives with model-specific targeting or global application ("all models" vs. "specific models").
- **Built-in Personas & Presets**: Concise Expert, Deep Analyst, Code Architect.
- **Prompt Test Suites**: Nerdy Kings Test Battery (18 advanced reasoning and coding prompts), HTML Games Generators, and Classic Benchmarks.

### 3.3. Advanced Data Visualization & Comparison
- **Split View, Network Waterfall, Cards, & Compare**: 
  - *Split / Cards*: Detailed model outputs with formatted markdown, raw text, markdown preview, HTML snippet live frames, and audio players (TTS).
  - *DevTools Network Waterfall*: Sub-millisecond timing breakdown (Queue, Request, TTFB, Download, Total Duration).
  - *Model Comparison (Diff View)*: Side-by-side comparison with token-level insertions, deletions, and modifications.
  - *XY Capability Graph*: Interactive scatter plot of latency vs. speed/tokens with mouseover tooltips and zoom controls.

### 3.4. Persistence, Sync, & Export
- **Local History**: Persistent storage of past benchmark sessions in `localStorage` (last 50 runs).
- **Supabase Cloud Sync**: PostgreSQL cloud persistence with auto-sync, test connection, and sync log monitoring.
- **Export Formats**: JSON export bundles, CSV export for spreadsheets.
- **Shareable Links**: URL hash parameter encoding full benchmark configuration and successful results for instant sharing.

### 3.5. UI/UX Architecture
- **Collapsible Sidebar Accordion**: Clean layout with Configuration and History collapsed by default and Prompt active by default for optimal initial focus.
- **Multi-Theme Support**: Light, Dark, Sepia Light, Sepia Dark, and Greenish Sepia themes.
- **Responsive Layout**: Resizable sidebar with drag handles and touch support.

---

## 4. Technical Architecture & Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS 4, Lucide React, Framer Motion.
- **Backend / Proxy**: OpenAI-compatible REST API integration with robust error parsing and timeout handling.
- **Database & Storage**: Supabase (PostgreSQL) + `localStorage`.
- **Testing**: Vitest & Testing Library (50+ comprehensive unit tests with 100% passing rate).

---

## 5. Non-Functional Requirements
- **Performance**: Sub-200ms micro-interaction response times; real-time streaming updates without UI blocking.
- **Reliability**: Graceful error handling for gateway timeouts, network drops, and API failures with actionable troubleshooting advice.
- **Security**: Client-side API key and header handling via secure custom headers without exposing secrets.

---

## 6. Future Roadmap
- Headless CLI runner for CI/CD pipeline integration.
- Automated regression testing and baseline comparisons.
- Advanced cost-per-token analytics and tracking.
