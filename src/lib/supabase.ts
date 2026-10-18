import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoryEntry } from '../types';

export const DEFAULT_TABLE_PREFIX = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_TABLE_PREFIX)
  ? import.meta.env.VITE_SUPABASE_TABLE_PREFIX.trim() 
  : 'llm_tester_';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  tablePrefix: string;
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: { url: string; anonKey: string } | null = null;

const STORAGE_KEYS = {
  URL: 'supabase_project_url',
  ANON_KEY: 'supabase_anon_key',
  AUTO_SYNC: 'supabase_auto_sync',
  TABLE_PREFIX: 'supabase_table_prefix'
};

/**
 * Returns namespaced table and view names based on the configured prefix.
 * Defaults to 'llm_tester_' to prevent name collisions with other projects (e.g. archon_*).
 */
export function getTableNames(prefix?: string) {
  const p = (prefix !== undefined ? prefix : getSupabaseConfig().tablePrefix || DEFAULT_TABLE_PREFIX).trim();
  return {
    prefix: p,
    runs: `${p}benchmark_runs`,
    results: `${p}benchmark_results`,
    summaryView: `${p}view_model_performance_summary`
  };
}

/**
 * Retrieves the current Supabase configuration.
 * Prioritizes localStorage if set by the user in UI, falls back to Vite env variables.
 */
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const envPrefix = (import.meta.env.VITE_SUPABASE_TABLE_PREFIX || DEFAULT_TABLE_PREFIX).trim();

  let storedUrl: string | null = null;
  let storedKey: string | null = null;
  let storedPrefix: string | null = null;
  let autoSync = true;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      storedUrl = localStorage.getItem(STORAGE_KEYS.URL);
      storedKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);
      storedPrefix = localStorage.getItem(STORAGE_KEYS.TABLE_PREFIX);
      const storedSync = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC);
      if (storedSync !== null) {
        autoSync = storedSync === 'true';
      }
    } catch {
      // Ignore localStorage access errors (e.g. sandboxed iframe restrictions)
    }
  }

  return {
    url: storedUrl !== null ? storedUrl.trim() : envUrl,
    anonKey: storedKey !== null ? storedKey.trim() : envKey,
    tablePrefix: storedPrefix !== null ? storedPrefix.trim() : envPrefix,
    autoSync
  };
}

/**
 * Saves custom Supabase credentials and settings to localStorage.
 */
export function setSupabaseConfig(config: Partial<SupabaseConfig>): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    if (config.url !== undefined) {
      localStorage.setItem(STORAGE_KEYS.URL, config.url.trim());
    }
    if (config.anonKey !== undefined) {
      localStorage.setItem(STORAGE_KEYS.ANON_KEY, config.anonKey.trim());
    }
    if (config.tablePrefix !== undefined) {
      localStorage.setItem(STORAGE_KEYS.TABLE_PREFIX, config.tablePrefix.trim());
    }
    if (config.autoSync !== undefined) {
      localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, String(config.autoSync));
    }
    // Invalidate client cache on config change
    cachedClient = null;
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Checks whether Supabase credentials (URL and Anon key) are configured.
 */
export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

/**
 * Initializes and caches the Supabase client instance.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (
    cachedClient && 
    lastUsedConfig && 
    lastUsedConfig.url === config.url && 
    lastUsedConfig.anonKey === config.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    lastUsedConfig = { url: config.url, anonKey: config.anonKey };
    return cachedClient;
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

/**
 * Tests connection to the Supabase database and verifies the prefixed table exists.
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tableExists: boolean;
  tableTested?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase URL and Anon Key are not configured yet.',
      tableExists: false
    };
  }

  const tables = getTableNames();

  try {
    const { data, error } = await client
      .from(tables.runs)
      .select('id')
      .limit(1);

    if (error) {
      if (
        error.code === '42P01' || 
        error.code === 'PGRST205' || 
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('could not find the table')
      ) {
        return {
          connected: true,
          message: `Connected to Supabase, but the "${tables.runs}" table does not exist. Please apply scripts/supabase_schema.sql.`,
          tableExists: false,
          tableTested: tables.runs
        };
      }
      return {
        connected: false,
        message: `Supabase query error: ${error.message} (${error.code || 'unknown'})`,
        tableExists: false,
        tableTested: tables.runs
      };
    }

    return {
      connected: true,
      message: `Successfully connected to Supabase table "${tables.runs}"! (${data?.length ?? 0} runs detected)`,
      tableExists: true,
      tableTested: tables.runs
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Failed to reach Supabase endpoint.',
      tableExists: false,
      tableTested: tables.runs
    };
  }
}

export interface InsertRunResult {
  success: boolean;
  runId: string;
  insertedCount: number;
  error?: string;
}

/**
 * Inserts all results and metadata of a completed benchmark run into the prefixed Supabase tables.
 */
export async function insertBenchmarkRunToSupabase(
  entry: HistoryEntry,
  options?: { isParallel?: boolean; parallelCount?: number }
): Promise<InsertRunResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      runId: entry.id,
      insertedCount: 0,
      error: 'Supabase is not configured (missing URL or Anon Key).'
    };
  }

  const tables = getTableNames();

  try {
    const successfulResults = entry.results.filter(r => r.status === 'success');
    const failedResults = entry.results.filter(r => r.status === 'error');

    // Find fastest model in this run
    let fastestModel: string | null = null;
    let fastestTimeMs: number | null = null;

    if (successfulResults.length > 0) {
      const sortedBySpeed = [...successfulResults].sort((a, b) => {
        const timeA = a.metrics?.durationMs ?? Infinity;
        const timeB = b.metrics?.durationMs ?? Infinity;
        return timeA - timeB;
      });
      fastestModel = sortedBySpeed[0].modelName;
      fastestTimeMs = sortedBySpeed[0].metrics?.durationMs ?? null;
    }

    // 1. Prepare run record for the prefixed benchmark_runs table
    const runPayload = {
      id: entry.id,
      timestamp: entry.timestamp,
      created_at: new Date(entry.timestamp).toISOString(),
      prompt: entry.prompt,
      endpoint: entry.endpoint || null,
      custom_headers: entry.customHeaders || entry.headers || null,
      is_parallel: options?.isParallel ?? false,
      parallel_count: options?.parallelCount ?? 1,
      total_models: entry.results.length,
      successful_models: successfulResults.length,
      failed_models: failedResults.length,
      fastest_model: fastestModel,
      fastest_time_ms: fastestTimeMs,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        clientVersion: '1.0.0',
        tablePrefix: tables.prefix
      }
    };

    // Upsert run record
    const { error: runError } = await client
      .from(tables.runs)
      .upsert(runPayload, { onConflict: 'id' });

    if (runError) {
      console.error(`[Supabase] Error inserting ${tables.runs}:`, runError);
      return {
        success: false,
        runId: entry.id,
        insertedCount: 0,
        error: `Failed to insert benchmark run into "${tables.runs}": ${runError.message}`
      };
    }

    // 2. Prepare individual model result records for the prefixed benchmark_results table
    if (entry.results && entry.results.length > 0) {
      const resultsPayload = entry.results.map((r, idx) => ({
        id: r.id || `${entry.id}-${idx}`,
        run_id: entry.id,
        model_name: r.modelName,
        status: r.status,
        output: r.output || null,
        error_message: r.error || null,
        latency_ms: r.metrics?.durationMs ?? null,
        ttft_ms: r.metrics?.ttfbMs ?? null,
        tokens_per_sec: r.metrics?.tokensPerSecond ?? null,
        token_count: r.metrics?.totalTokens ?? null,
        timing_breakdown: r.metrics ? {
          durationMs: r.metrics.durationMs,
          ttfbMs: r.metrics.ttfbMs,
          downloadMs: r.metrics.downloadMs,
          queueMs: r.metrics.queueMs,
          requestSentMs: r.metrics.requestSentMs,
          tokensPerSecond: r.metrics.tokensPerSecond
        } : null,
        diagnostics: (r.isTimeout || r.statusCode || r.rawErrorDetails) ? {
          statusCode: r.statusCode,
          isTimeout: r.isTimeout,
          rawErrorDetails: r.rawErrorDetails
        } : null,
        created_at: new Date(entry.timestamp).toISOString()
      }));

      const { error: resultsError } = await client
        .from(tables.results)
        .upsert(resultsPayload, { onConflict: 'id' });

      if (resultsError) {
        console.error(`[Supabase] Error inserting ${tables.results}:`, resultsError);
        return {
          success: false,
          runId: entry.id,
          insertedCount: 0,
          error: `Run created, but failed to insert model results into "${tables.results}": ${resultsError.message}`
        };
      }
    }

    return {
      success: true,
      runId: entry.id,
      insertedCount: entry.results.length
    };
  } catch (err: any) {
    console.error('[Supabase] Exception during insertBenchmarkRun:', err);
    return {
      success: false,
      runId: entry.id,
      insertedCount: 0,
      error: err?.message || 'Unexpected error while inserting to Supabase'
    };
  }
}

/**
 * Fetches rows and total count from a given Supabase table for data grid viewing.
 */
export async function fetchSupabaseTableData(
  tableName: string,
  options?: { limit?: number; offset?: number; orderBy?: string; ascending?: boolean }
): Promise<{ data: any[]; count: number | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: [], count: null, error: 'Supabase client is not configured (missing URL or Key).' };
  }

  try {
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;
    const orderBy = options?.orderBy || 'created_at';
    const ascending = options?.ascending ?? false;

    // First attempt ordering by specified column or created_at
    let query = client
      .from(tableName)
      .select('*', { count: 'exact' });

    try {
      query = query.order(orderBy, { ascending });
    } catch {
      // Ignore ordering errors if column does not exist
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      // If order by created_at failed because column doesn't exist, try unordered select
      if (error.code === '42703' || error.message?.includes('does not exist')) {
        const fallback = await client.from(tableName).select('*', { count: 'exact' }).range(offset, offset + limit - 1);
        if (fallback.error) {
          return { data: [], count: null, error: fallback.error.message };
        }
        return { data: fallback.data || [], count: fallback.count ?? (fallback.data?.length || 0), error: null };
      }
      return { data: [], count: null, error: error.message };
    }

    return {
      data: data || [],
      count: count ?? (data?.length || 0),
      error: null
    };
  } catch (err: any) {
    return { data: [], count: null, error: err?.message || 'Failed to query Supabase table' };
  }
}

