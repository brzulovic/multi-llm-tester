-- =====================================================================
-- Supabase Schema for LLM Multi-Tester Benchmark Runs and Results
-- =====================================================================
-- Table prefix: llm_ (or llm_tester_)
-- This prefix guarantees complete namespace isolation from other projects
-- (such as archon_* tables) sharing the same Supabase database.
-- =====================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- Migration Helper:
-- If unprefixed tables exist from an earlier setup, rename them
-- to llm_benchmark_runs to preserve existing data.
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'benchmark_runs') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_benchmark_runs') THEN
        ALTER TABLE public.benchmark_runs RENAME TO llm_benchmark_runs;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'benchmark_results') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_benchmark_results') THEN
        ALTER TABLE public.benchmark_results RENAME TO llm_benchmark_results;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_tester_benchmark_runs') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_benchmark_runs') THEN
        ALTER TABLE public.llm_tester_benchmark_runs RENAME TO llm_benchmark_runs;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_tester_benchmark_results') 
       AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'llm_benchmark_results') THEN
        ALTER TABLE public.llm_tester_benchmark_results RENAME TO llm_benchmark_results;
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- Table: llm_benchmark_runs
-- Stores high-level session metadata for each multi-model benchmark run
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.llm_benchmark_runs (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    timestamp BIGINT NOT NULL,
    prompt TEXT NOT NULL,
    endpoint TEXT,
    custom_headers TEXT,
    is_parallel BOOLEAN NOT NULL DEFAULT false,
    parallel_count INTEGER NOT NULL DEFAULT 1,
    total_models INTEGER NOT NULL DEFAULT 0,
    successful_models INTEGER NOT NULL DEFAULT 0,
    failed_models INTEGER NOT NULL DEFAULT 0,
    fastest_model TEXT,
    fastest_time_ms NUMERIC,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------
-- Table: llm_benchmark_results
-- Stores individual model performance metrics, token speeds, and outputs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.llm_benchmark_results (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES public.llm_benchmark_runs(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending', 'idle')),
    output TEXT,
    error_message TEXT,
    latency_ms NUMERIC,
    ttft_ms NUMERIC,
    tokens_per_sec NUMERIC,
    token_count INTEGER,
    timing_breakdown JSONB,
    diagnostics JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------
-- Compatibility Views for alternate prefix llm_tester_
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.llm_tester_benchmark_runs AS 
SELECT * FROM public.llm_benchmark_runs;

CREATE OR REPLACE VIEW public.llm_tester_benchmark_results AS 
SELECT * FROM public.llm_benchmark_results;

-- ---------------------------------------------------------------------
-- Indexes for fast querying & dashboard performance
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_llm_runs_created_at 
    ON public.llm_benchmark_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_llm_runs_timestamp 
    ON public.llm_benchmark_runs (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_llm_results_run_id 
    ON public.llm_benchmark_results (run_id);

CREATE INDEX IF NOT EXISTS idx_llm_results_model_name 
    ON public.llm_benchmark_results (model_name);

CREATE INDEX IF NOT EXISTS idx_llm_results_status 
    ON public.llm_benchmark_results (status);

CREATE INDEX IF NOT EXISTS idx_llm_results_speed 
    ON public.llm_benchmark_results (tokens_per_sec DESC);

-- ---------------------------------------------------------------------
-- Row Level Security (RLS)
-- Enables public read/write access using Supabase anon key
-- ---------------------------------------------------------------------
ALTER TABLE public.llm_benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_benchmark_results ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Allow anon and auth read access to llm_benchmark_runs" ON public.llm_benchmark_runs;
DROP POLICY IF EXISTS "Allow anon and auth insert access to llm_benchmark_runs" ON public.llm_benchmark_runs;
DROP POLICY IF EXISTS "Allow anon and auth update access to llm_benchmark_runs" ON public.llm_benchmark_runs;
DROP POLICY IF EXISTS "Allow anon and auth delete access to llm_benchmark_runs" ON public.llm_benchmark_runs;

DROP POLICY IF EXISTS "Allow anon and auth read access to llm_benchmark_results" ON public.llm_benchmark_results;
DROP POLICY IF EXISTS "Allow anon and auth insert access to llm_benchmark_results" ON public.llm_benchmark_results;
DROP POLICY IF EXISTS "Allow anon and auth update access to llm_benchmark_results" ON public.llm_benchmark_results;
DROP POLICY IF EXISTS "Allow anon and auth delete access to llm_benchmark_results" ON public.llm_benchmark_results;

-- Policies for llm_benchmark_runs
CREATE POLICY "Allow anon and auth read access to llm_benchmark_runs"
    ON public.llm_benchmark_runs FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon and auth insert access to llm_benchmark_runs"
    ON public.llm_benchmark_runs FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow anon and auth update access to llm_benchmark_runs"
    ON public.llm_benchmark_runs FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon and auth delete access to llm_benchmark_runs"
    ON public.llm_benchmark_runs FOR DELETE
    TO anon, authenticated
    USING (true);

-- Policies for llm_benchmark_results
CREATE POLICY "Allow anon and auth read access to llm_benchmark_results"
    ON public.llm_benchmark_results FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon and auth insert access to llm_benchmark_results"
    ON public.llm_benchmark_results FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow anon and auth update access to llm_benchmark_results"
    ON public.llm_benchmark_results FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon and auth delete access to llm_benchmark_results"
    ON public.llm_benchmark_results FOR DELETE
    TO anon, authenticated
    USING (true);

-- ---------------------------------------------------------------------
-- Analytical Views: Model Aggregated Performance
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW public.llm_view_model_performance_summary AS
SELECT 
    model_name,
    COUNT(*) AS total_runs,
    COUNT(*) FILTER (WHERE status = 'success') AS success_count,
    COUNT(*) FILTER (WHERE status = 'error') AS error_count,
    ROUND(AVG(latency_ms) FILTER (WHERE status = 'success'), 2) AS avg_latency_ms,
    ROUND(MIN(latency_ms) FILTER (WHERE status = 'success'), 2) AS min_latency_ms,
    ROUND(AVG(ttft_ms) FILTER (WHERE status = 'success'), 2) AS avg_ttft_ms,
    ROUND(AVG(tokens_per_sec) FILTER (WHERE status = 'success'), 2) AS avg_tokens_per_sec,
    ROUND(MAX(tokens_per_sec) FILTER (WHERE status = 'success'), 2) AS max_tokens_per_sec,
    MAX(created_at) AS last_tested_at
FROM public.llm_benchmark_results
GROUP BY model_name
ORDER BY avg_tokens_per_sec DESC NULLS LAST;

CREATE OR REPLACE VIEW public.llm_tester_view_model_performance_summary AS
SELECT * FROM public.llm_view_model_performance_summary;
