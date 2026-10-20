# Export Templates

## HTML Report Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLM Benchmark Report - {{runId}}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 30px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric-card { background: #f5f5f5; padding: 20px; border-radius: 8px; }
    .metric-value { font-size: 2em; font-weight: bold; color: #333; }
    .metric-label { color: #666; font-size: 0.9em; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f5f5f5; font-weight: 600; }
    .status-success { color: #28a745; }
    .status-error { color: #dc3545; }
    .diff-view { font-family: monospace; white-space: pre-wrap; }
    .diff-add { background: #e6ffe6; }
    .diff-remove { background: #ffe6e6; }
    .diff-modify { background: #fffde6; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LLM Benchmark Report</h1>
    <p><strong>Run ID:</strong> {{runId}}</p>
    <p><strong>Timestamp:</strong> {{timestamp}}</p>
    <p><strong>Prompt:</strong> {{prompt}}</p>
    <p><strong>Endpoint:</strong> {{endpoint}}</p>
    <p><strong>Models Tested:</strong> {{modelsCount}}</p>
    <p><strong>Mode:</strong> {{isParallel ? 'Parallel (' + parallelCount + ' workers)' : 'Sequential'}}</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value">{{successCount}}/{{modelsCount}}</div>
      <div class="metric-label">Successful Runs</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{avgDuration}}ms</div>
      <div class="metric-label">Avg Duration</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{avgSpeed}} tok/s</div>
      <div class="metric-label">Avg Generation Speed</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{totalTokens}}</div>
      <div class="metric-label">Total Tokens</div>
    </div>
  </div>

  <h2>Results</h2>
  <table>
    <thead>
      <tr>
        <th>Model</th>
        <th>Status</th>
        <th>Duration (ms)</th>
        <th>Tokens/sec</th>
        <th>TTFB (ms)</th>
        <th>Prompt Tokens</th>
        <th>Completion Tokens</th>
        <th>System Prompt</th>
      </tr>
    </thead>
    <tbody>
      {{#each results}}
      <tr>
        <td>{{modelName}}</td>
        <td class="status-{{status}}">{{status}}</td>
        <td>{{metrics.durationMs}}</td>
        <td>{{metrics.tokensPerSecond}}</td>
        <td>{{metrics.ttfbMs}}</td>
        <td>{{metrics.promptTokens}}</td>
        <td>{{metrics.completionTokens}}</td>
        <td>{{#if hasSystemPrompt}}Yes{{else}}No{{/if}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  {{#if comparison}}
  <h2>Model Comparison</h2>
  <div class="diff-view">{{comparison.diffHtml}}</div>
  <p>Similarity Score: {{comparison.similarityScore}}%</p>
  {{/if}}
</body>
</html>
```

## CSV Export Format

```csv
run_id,timestamp,prompt,endpoint,model_name,status,duration_ms,tokens_per_second,prompt_tokens,completion_tokens,total_tokens,ttfb_ms,has_system_prompt,error_message
hist-1771459200000,2026-10-20T10:00:00Z,"Describe capabilities...",http://localhost:4100/v1/chat/completions,gpt-4o,success,1250,42.3,18,53,71,45,false,
hist-1771459200000,2026-10-20T10:00:00Z,"Describe capabilities...",http://localhost:4100/v1/chat/completions,claude-3-5-sonnet,success,980,58.2,18,57,75,32,true,
```

## JSON Export Format

```json
{
  "version": 1,
  "exportedAt": "2026-10-20T10:00:00Z",
  "run": {
    "id": "hist-1771459200000",
    "timestamp": 1771459200000,
    "prompt": "Describe all your capabilities...",
    "endpoint": "http://localhost:4100/v1/chat/completions",
    "customHeaders": "Authorization: Bearer sk-...\nx-litellm-api-key: Bearer sk-...",
    "models": ["gpt-4o", "claude-3-5-sonnet", "deepseek-r1"],
    "isParallel": true,
    "parallelCount": 3,
    "streamResponse": true,
    "timeoutSeconds": 300,
    "systemPrompt": {
      "enabled": true,
      "content": "You are an expert AI assistant...",
      "mode": "specific",
      "targetModels": ["gpt-4o", "claude-3-5-sonnet"]
    },
    "results": [
      {
        "id": "gpt-4o-0-1771459200000",
        "modelName": "gpt-4o",
        "status": "success",
        "output": "I am GPT-4o, a multimodal model...",
        "metrics": {
          "promptTokens": 18,
          "completionTokens": 53,
          "totalTokens": 71,
          "durationMs": 1250,
          "tokensPerSecond": 42.3,
          "ttfbMs": 45,
          "downloadMs": 1205,
          "queueMs": 0,
          "requestSentMs": 2
        },
        "hasSystemPrompt": true,
        "systemPrompt": "You are an expert AI assistant..."
      }
    ]
  }
}
```

## Markdown Report Template

```markdown
# LLM Benchmark Report

**Run ID:** {{runId}}
**Date:** {{timestamp}}
**Endpoint:** {{endpoint}}
**Mode:** {{isParallel ? 'Parallel (' + parallelCount + ' workers)' : 'Sequential'}}
**Models:** {{modelsCount}}

## Prompt
{{prompt}}

## Summary
- **Successful:** {{successCount}}/{{modelsCount}}
- **Avg Duration:** {{avgDuration}}ms
- **Avg Speed:** {{avgSpeed}} tok/s
- **Total Tokens:** {{totalTokens}}

## Results

| Model | Status | Duration | Speed (tok/s) | TTFB (ms) | Prompt Tokens | Completion Tokens | System Prompt |
|-------|--------|----------|---------------|-----------|---------------|-------------------|---------------|
{{#each results}}
| {{modelName}} | {{status}} | {{metrics.durationMs}}ms | {{metrics.tokensPerSecond}} | {{metrics.ttfbMs}} | {{metrics.promptTokens}} | {{metrics.completionTokens}} | {{#if hasSystemPrompt}}✓{{else}}✗{{/if}} |
{{/each}}

{{#if comparison}}
## Comparison: {{comparison.modelA}} vs {{comparison.modelB}}

**Similarity Score:** {{comparison.similarityScore}}%

{{comparison.diffMarkdown}}
{{/if}}
```