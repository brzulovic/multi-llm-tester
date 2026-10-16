import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  isSupabaseConfigured, 
  insertBenchmarkRunToSupabase,
  getSupabaseClient,
  getTableNames,
  DEFAULT_TABLE_PREFIX
} from './supabase';
import type { HistoryEntry } from '../types';

describe('Supabase Integration Module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads default configuration from localStorage and env with table prefix', () => {
    const config = getSupabaseConfig();
    expect(config).toBeDefined();
    expect(config.autoSync).toBe(true);
    expect(config.tablePrefix).toBe(DEFAULT_TABLE_PREFIX);
  });

  it('provides table names prefixed with configured prefix', () => {
    const tables = getTableNames();
    expect(tables.prefix).toBe(DEFAULT_TABLE_PREFIX);
    expect(tables.runs).toBe(`${DEFAULT_TABLE_PREFIX}benchmark_runs`);
    expect(tables.results).toBe(`${DEFAULT_TABLE_PREFIX}benchmark_results`);
    expect(tables.summaryView).toBe(`${DEFAULT_TABLE_PREFIX}view_model_performance_summary`);
  });

  it('supports custom table prefixes to avoid collisions with other projects (like archon_*)', () => {
    setSupabaseConfig({ tablePrefix: 'my_custom_eval_' });
    const config = getSupabaseConfig();
    expect(config.tablePrefix).toBe('my_custom_eval_');

    const tables = getTableNames();
    expect(tables.runs).toBe('my_custom_eval_benchmark_runs');
    expect(tables.results).toBe('my_custom_eval_benchmark_results');
  });

  it('saves and retrieves custom credentials via localStorage', () => {
    setSupabaseConfig({ url: '', anonKey: '' });
    expect(isSupabaseConfigured()).toBe(false);

    setSupabaseConfig({
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key-12345',
      tablePrefix: 'llm_',
      autoSync: true
    });

    expect(isSupabaseConfigured()).toBe(true);
    const updated = getSupabaseConfig();
    expect(updated.url).toBe('https://test-project.supabase.co');
    expect(updated.anonKey).toBe('test-anon-key-12345');
    expect(updated.tablePrefix).toBe('llm_');
    expect(updated.autoSync).toBe(true);
  });

  it('handles missing credentials when attempting to insert benchmark runs', async () => {
    setSupabaseConfig({ url: '', anonKey: '' });
    
    const sampleEntry: HistoryEntry = {
      id: 'test-run-1',
      timestamp: Date.now(),
      prompt: 'Hello world',
      endpoint: 'http://localhost:4100/v1/chat/completions',
      results: [
        {
          id: 'res-1',
          modelName: 'model-a',
          status: 'success',
          output: 'Response A',
          metrics: {
            durationMs: 150,
            promptTokens: 10,
            completionTokens: 25,
            totalTokens: 35,
            tokensPerSecond: 166.7,
            ttfbMs: 40
          }
        }
      ]
    };

    const result = await insertBenchmarkRunToSupabase(sampleEntry);
    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('initializes Supabase client when valid configuration is set', () => {
    setSupabaseConfig({
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key-12345'
    });

    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client).not.toBeNull();
  });
});
