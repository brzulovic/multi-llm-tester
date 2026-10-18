/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BookOpen, 
  Code, 
  X, 
  Copy, 
  Check, 
  Download, 
  Search, 
  ExternalLink,
  ShieldCheck,
  Terminal,
  Layers,
  FileText
} from "lucide-react";

export type DocTab = 'docs' | 'api' | 'privacy';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: DocTab;
}

export const README_CONTENT = `# LLM Multi-Tester & Benchmark Workbench

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
- **Mouseover Capabilities Card**: Hover over any model node on the chart to inspect context windows, modalities, parameter sizes, architecture, and live run telemetry.

### 4. Chrome DevTools-Grade Network Waterfall
- **Sub-Millisecond Timing Breakdown**: Queueing / Stagger Delay, Request Sent, Waiting (TTFB), and Content Download streaming time.
- **Sortable Columns & State Filtering**: Sort by Name, State, Time, Speed, or Tokens; filter results by State.

### 5. Token-Level Model Comparison & Diff Viewer
- Side-by-side or unified view with token-by-token diff highlighting and similarity metrics.

### 6. Themes & Supabase Cloud Sync
- Full support for Light, Dark, Sepia Light, Sepia Dark, and Greenish Sepia.
- Optional automatic persistence to Supabase PostgreSQL and offline CSV/JSON history export.`;

export const REFERENCE_CONTENT = `# LLM Multi-Tester API & Protocol Reference

This document details the REST API endpoints, JSON payload structures, Server-Sent Events (SSE) streaming protocols, and metrics schemas utilized by the LLM Multi-Tester workbench.

---

## 📡 1. Endpoints Overview

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| \`/v1/chat/completions\` | \`POST\` | Primary conversational inference endpoint supporting messages, streaming, and usage metrics. |
| \`/v1/models\` | \`GET\` | Discovery endpoint returning available models from the target proxy or engine. |
| \`/v1/completions\` | \`POST\` | Legacy text completion endpoint for older generation models. |

---

## 📨 2. POST \`/v1/chat/completions\` Request Payload

### Headers
\`\`\`http
Content-Type: application/json
X-Request-Timeout: 300
Request-Timeout: 300
Authorization: Bearer <API_KEY> (Optional / Gateway dependent)
x-litellm-api-key: Bearer <KEY> (Optional / LiteLLM proxy)
\`\`\`

### Request Body Schema
\`\`\`json
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
\`\`\`

### Parameter Definitions
- **\`model\`** *(string, required)*: Identifier of the target model (e.g. \`gpt-4o\`, \`claude-3-5-sonnet\`, \`deepseek-r1\`, \`myGemma3\`).
- **\`messages\`** *(array, required)*: Array of message objects with \`role\` (\`system\`, \`user\`, or \`assistant\`) and \`content\` *(string)*.
  - When **Custom System Prompt** is enabled for this model, a \`{ "role": "system", "content": "..." }\` message is prepended to the array.
- **\`stream\`** *(boolean, optional, default: \`true\`)*: When enabled, response is delivered incrementally via Server-Sent Events (SSE).
- **\`stream_options.include_usage\`** *(boolean, optional)*: Instructs the engine to include token consumption statistics in the final SSE chunk.
- **\`timeout\` / \`request_timeout\`** *(number, optional)*: Timeout window in seconds sent to LiteLLM/vLLM proxies to prevent prematue gateway aborts.

---

## ⚡ 3. Server-Sent Events (SSE) Protocol

When \`stream: true\`, the gateway emits chunked text events:

\`\`\`http
data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"Hello"},"index":0}]}
data: {"id":"chatcmpl-1","choices":[{"delta":{"content":" world"},"index":0}]}
data: {"id":"chatcmpl-1","choices":[{"delta":{}}],"usage":{"prompt_tokens":18,"completion_tokens":42,"total_tokens":60}}
data: [DONE]
\`\`\`

### Parser Rules
1. Strip leading \`data:\` and whitespace.
2. Ignore empty lines and heartbeat comments (\`: ping\`).
3. Terminate stream upon reading \`[DONE]\`.
4. Extract incremental token content from \`choices[0].delta.content\` or legacy \`choices[0].text\`.
5. Capture usage statistics from \`usage.prompt_tokens\` and \`usage.completion_tokens\`.`;

export const PRIVACY_CONTENT = `# Privacy & Security Policy

## 🔒 Local-First Architecture
LLM Multi-Tester runs entirely in your client web browser. 

- **No Third-Party Telemetry**: We do not track, log, or sell your test prompts, benchmarks, or API responses.
- **Direct Network Traffic**: All inference requests are dispatched directly from your browser to your configured API base URL (e.g. localhost, Ollama, vLLM, or your private cloud proxy).
- **API Keys & Headers**: Any custom headers (such as Authorization or LiteLLM API keys) are stored only in your browser's \`localStorage\` and are never forwarded to any third-party server.
- **Optional Supabase Cloud Sync**: Database synchronization only connects to the specific Supabase project credentials that you explicitly configure.`;

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'docs'
}) => {
  const [activeTab, setActiveTab] = useState<DocTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync tab if initialTab changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const activeContent = activeTab === 'docs' 
    ? README_CONTENT 
    : (activeTab === 'api' ? REFERENCE_CONTENT : PRIVACY_CONTENT);

  const activeFileName = activeTab === 'docs' 
    ? 'README.md' 
    : (activeTab === 'api' ? 'REFERENCE.md' : 'PRIVACY.md');

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      data-testid="docs-modal-overlay"
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#111622] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden font-sans z-10 transition-colors"
        data-testid="docs-modal-container"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 bg-gray-50/70 dark:bg-[#161c28]/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              {activeTab === 'docs' && <BookOpen className="w-5 h-5" />}
              {activeTab === 'api' && <Code className="w-5 h-5" />}
              {activeTab === 'privacy' && <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{activeTab === 'docs' ? 'Documentation' : (activeTab === 'api' ? 'API Reference' : 'Privacy & Security')}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {activeFileName}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeTab === 'docs' ? 'Complete guide to LLM Multi-Tester capabilities and usage' : (activeTab === 'api' ? 'REST API payloads, SSE stream protocols, and metrics schemas' : 'Client-side data security and local execution policy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-700 hover:border-indigo-400 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer shadow-2xs"
              title="Copy raw markdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer shadow-2xs"
              title="Download markdown file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              data-testid="close-docs-modal"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Quick Search */}
        <div className="px-5 py-2.5 sm:px-6 border-b border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111622]">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              data-testid="tab-docs"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'docs' 
                  ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-300 shadow-xs font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentation (README)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('api')}
              data-testid="tab-api-ref"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'api' 
                  ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-300 shadow-xs font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>API Reference</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              data-testid="tab-privacy"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'privacy' 
                  ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-300 shadow-xs font-bold' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in document..."
              className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Document Body View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed text-sm bg-white dark:bg-[#111622]">
          <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed p-4 rounded-2xl bg-gray-50 dark:bg-[#0b0f17] border border-gray-200/80 dark:border-gray-800 overflow-x-auto text-gray-800 dark:text-gray-300 selection:bg-indigo-200 dark:selection:bg-indigo-950">
            {searchQuery.trim() 
              ? activeContent.split("\n").filter(line => line.toLowerCase().includes(searchQuery.toLowerCase())).join("\n") || "No matching sections found for query."
              : activeContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-[#161c28]/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Files available in workspace root: <code className="font-mono">README.md</code> & <code className="font-mono">REFERENCE.md</code></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default DocumentationModal;
