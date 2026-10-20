# Supabase Schema

## Tables

### llm_benchmark_runs
Stores benchmark run metadata.

```sql
CREATE TABLE llm_benchmark_runs (
  id TEXT PRIMARY KEY,                    -- e.g. 'hist-1771459200000'
  created_at TIMESTAMPTZ NOT NULL,        -- Timestamp of execution
  prompt TEXT NOT NULL,                   -- Full prompt query
  system_prompt TEXT,                     -- Custom system directive if enabled
  endpoint TEXT NOT NULL,                 -- Target API endpoint
  is_parallel BOOLEAN NOT NULL,           -- Concurrency mode
  parallel_count INTEGER NOT NULL,        -- Concurrency worker limit
  models_count INTEGER NOT NULL,          -- Total models tested
  status TEXT NOT NULL                    -- 'completed' or 'partial_failure'
);
```

### llm_benchmark_results
Stores individual model results within a run.

```sql
CREATE TABLE llm_benchmark_results (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES llm_benchmark_runs(id),
  model_name TEXT NOT NULL,
  status TEXT NOT NULL,                   -- 'success' | 'error'
  output_text TEXT,
  duration_ms NUMERIC,
  tokens_per_second NUMERIC,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  ttfb_ms NUMERIC,
  has_system_prompt BOOLEAN,
  error_message TEXT
);
```

## Indexes

```sql
CREATE INDEX idx_runs_created_at ON llm_benchmark_runs(created_at DESC);
CREATE INDEX idx_results_run_id ON llm_benchmark_results(run_id);
CREATE INDEX idx_results_model_name ON llm_benchmark_results(model_name);
```

## Common Queries

### Get recent runs with result counts
```sql
SELECT 
  r.*,
  COUNT(res.id) as result_count,
  COUNT(CASE WHEN res.status = 'success' THEN 1 END) as success_count
FROM llm_benchmark_runs r
LEFT JOIN llm_benchmark_results res ON res.run_id = r.id
GROUP BY r.id
ORDER BY r.created_at DESC
LIMIT 50;
```

### Get model performance across runs
```sql
SELECT 
  model_name,
  AVG(duration_ms) as avg_duration,
  AVG(tokens_per_second) as avg_speed,
  COUNT(*) as run_count,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count
FROM llm_benchmark_results
WHERE status = 'success'
GROUP BY model_name
ORDER BY avg_speed DESC;
```