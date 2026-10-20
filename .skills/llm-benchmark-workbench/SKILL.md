---
name: llm-benchmark-workbench
description: |
  Comprehensive LLM benchmarking and comparison workbench skill. Use this skill whenever the user wants to:
  - Set up, configure, or run LLM benchmarks against multiple models/providers
  - Compare model outputs with token-level diff analysis
  - Visualize performance metrics (latency, TTFB, tokens/sec, cost)
  - Manage prompt engineering workflows with system prompt injection
  - Export/import benchmark results (JSON, CSV, Supabase)
  - Configure multi-provider endpoints (OpenAI, Ollama, vLLM, Groq, LiteLLM)
  - Create automated benchmark pipelines with CI/CD integration
  - Analyze model capabilities with interactive XY graphs and waterfall charts
  - Build prompt testing suites (Nerdy Kings, Classic, Custom)
  
  This skill encapsulates the full LLM Multi-Tester workbench functionality as a reusable agent skill.
---

# LLM Benchmark Workbench Skill

This skill provides a complete framework for benchmarking, comparing, and analyzing Large Language Models across multiple providers and endpoints.

## Core Capabilities

### 1. Multi-Model Execution Engine
- **Sequential & Parallel Dispatch**: Run models consecutively or concurrently (1-10 workers)
- **SSE Streaming**: Real-time token streaming with TTFB measurement
- **Timeout Management**: Configurable per-request timeouts (default 300s for 50s+ local models)
- **Retry Logic**: Bulk retry by status (failed, pending, idle)

### 2. Prompt Engineering & System Prompts
- **Model-Specific Injection**: Target specific models with custom system directives
- **Global Injection**: Apply system prompts to all models
- **Preset Personas**: Concise Expert, Deep Analyst, Code Architect
- **Visual Indicators**: Badges showing which models have system prompts

### 3. Interactive Visualizations
- **XY Capability Graph**: Plot any metric pairing (Latency vs Speed, Tokens vs Cost, etc.)
- **Network Waterfall**: DevTools-grade timing breakdown (Queue, Request, TTFB, Download)
- **Token-Level Diff**: Side-by-side comparison with insertions/deletions/modifications
- **Model Cards**: Formatted/Raw/MD/HTML/Audio output modes

### 4. Data Persistence & Export
- **Local History**: Automatic localStorage persistence (50 sessions)
- **Supabase Sync**: PostgreSQL cloud sync with auto/manual modes
- **Import/Export**: JSON bundles, CSV for spreadsheets
- **Shareable Links**: Encode full benchmark state in URL

### 5. Multi-Provider Support
- OpenAI-compatible endpoints (v1/chat/completions, v1/models)
- Ollama, vLLM, LM Studio, Groq, LiteLLM proxies
- Custom headers & authentication
- Endpoint presets with quick switching

## Usage Patterns

### Basic Benchmark Run
```
1. Configure endpoint (base URL + endpoint type)
2. Add custom headers (API keys, routing)
3. Select/fetch models
4. Choose prompt preset or write custom
5. Configure parallelism & streaming
6. Run benchmark
7. Analyze results in waterfall, cards, graph, or compare views
```

### Advanced Comparison
```
1. Run benchmark with multiple models
2. Switch to Comparison view
3. Select two models for token-level diff
4. Analyze similarity scores & vocabulary divergence
5. Export results for reporting
```

### CI/CD Integration
```
1. Export benchmark configuration
2. Run headless via CLI (future)
3. Compare against baseline metrics
4. Fail/pass based on regression thresholds
```

## Configuration Schema

```typescript
interface BenchmarkConfig {
  endpoint: string;           // Full API endpoint URL
  customHeaders: string;      // One header per line
  models: string[];           // Model identifiers
  prompt: string;             // Test prompt
  isParallel: boolean;        // Concurrent execution
  parallelCount: number;      // Worker limit (1-10)
  streamResponse: boolean;    // SSE streaming
  timeoutSeconds: number;     // Request timeout
  systemPrompt: {
    enabled: boolean;
    content: string;
    mode: 'specific' | 'all';
    targetModels: string[];
  };
}
```

## Result Metrics

```typescript
interface NetworkTimingMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  tokensPerSecond: number;
  ttfbMs?: number;           // Time to First Byte
  downloadMs?: number;       // Stream duration
  queueMs?: number;          // Concurrency queue delay
  requestSentMs?: number;    // Serialization overhead
}
```

## Theme Support
- Light, Dark, Sepia Light, Sepia Dark, Greenish Sepia
- Persisted in localStorage
- Auto-detect system preference

## Files & Resources

### Scripts (in `scripts/`)
- `run-benchmark.ts` - Headless benchmark runner
- `export-results.ts` - Export to various formats
- `sync-supabase.ts` - Database synchronization
- `compare-models.ts` - Diff analysis utility

### References (in `references/`)
- `api-reference.md` - REST API & SSE protocol
- `metrics-schema.md` - Timing & metrics definitions
- `supabase-schema.md` - Database tables & queries
- `prompt-presets.md` - Built-in test prompts

### Assets (in `assets/`)
- Theme color palettes
- Icon mappings for model capabilities
- Export templates (HTML, Markdown, CSV)

## Integration Points

### With Other Skills
- **wiki-ingest**: Save benchmark results to knowledge base
- **wiki-query**: Retrieve historical benchmark data
- **wiki-research**: Research model capabilities online
- **cross-linker**: Connect benchmark concepts in wiki
- **daily-update**: Include benchmark runs in daily digest

### External Tools
- **Supabase**: PostgreSQL backend for persistence
- **Vercel/Netlify**: Deploy benchmark dashboards
- **GitHub Actions**: CI/CD pipeline integration
- **Langfuse**: LLM observability (optional)

## Best Practices

1. **Start with presets** - Use Nerdy Kings or Classic prompts for standardized evaluation
2. **Enable SSE streaming** - Prevents 50s gateway timeouts, measures true TTFB
3. **Use parallel mode wisely** - 2-4 workers for API endpoints, 1 for local models
4. **Set adequate timeouts** - 300s default handles slow local models
5. **Tag system prompts** - Visual badges help track which models got custom instructions
6. **Export regularly** - JSON for full fidelity, CSV for spreadsheet analysis
6. **Sync to Supabase** - Enables cross-device history and team collaboration

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 504 Gateway Timeout | Increase timeoutSeconds, enable streamResponse |
| No models fetched | Check endpoint URL, verify /v1/models accessibility |
| CORS errors | Use proxy (LiteLLM, nginx) or configure CORS on server |
| Slow local models | Reduce parallelCount to 1, increase timeout |
| Missing metrics | Ensure stream_options.include_usage: true |

## Version History
- v1.0.0 - Initial skill extraction from LLM Multi-Tester workbench