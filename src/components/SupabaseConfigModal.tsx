import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  RefreshCw,
  FolderKanban
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured,
  DEFAULT_TABLE_PREFIX
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export function SupabaseConfigModal({ isOpen, onClose, onConfigSaved }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tablePrefix, setTablePrefix] = useState(DEFAULT_TABLE_PREFIX);
  const [autoSync, setAutoSync] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected: boolean;
    message: string;
    tableExists: boolean;
    tableTested?: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTablePrefix(config.tablePrefix || DEFAULT_TABLE_PREFIX);
      setAutoSync(config.autoSync);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPrefix = (tablePrefix || DEFAULT_TABLE_PREFIX).trim();
  const runsTableName = `${currentPrefix}benchmark_runs`;
  const resultsTableName = `${currentPrefix}benchmark_results`;

  const handleSave = () => {
    setSupabaseConfig({
      url,
      anonKey,
      tablePrefix: currentPrefix,
      autoSync
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onConfigSaved?.();
  };

  const handleTest = async () => {
    // Save current values first so the client can use them
    setSupabaseConfig({ url, anonKey, tablePrefix: currentPrefix, autoSync });
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySchemaSql = async () => {
    try {
      const res = await fetch('/scripts/supabase_schema.sql');
      let sqlText = '';
      if (res.ok) {
        sqlText = await res.text();
      }
      if (!sqlText) {
        sqlText = `-- Supabase Schema for LLM Multi-Tester (Prefix: ${currentPrefix})
-- Run 'make supabase-init' or copy scripts/supabase_schema.sql`;
      }
      await navigator.clipboard.writeText(sqlText);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#0d121c]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 id="supabase-modal-title" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Supabase Database Setup
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                  isSupabaseConfigured() 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                }`}>
                  {isSupabaseConfigured() ? 'Configured' : 'Not Configured'}
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automatically insert benchmark runs and performance metrics after each test.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close Supabase modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-sm">
          {/* Credentials Form */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                Supabase Project URL
              </label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                Found in Supabase Dashboard &gt; Project Settings &gt; API
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                Supabase Anon / Public API Key
              </label>
              <input 
                type="password" 
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                Use your public &quot;anon&quot; key. Row Level Security policies protect your tables.
              </span>
            </div>

            {/* Table prefix setting to avoid collisions with archon_* */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1 flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                Table Prefix
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tablePrefix}
                  onChange={(e) => setTablePrefix(e.target.value)}
                  placeholder="llm_tester_"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                Prefix for database tables to avoid collisions with other projects (e.g. <code className="font-mono text-gray-600 dark:text-gray-300">archon_*</code>). Default is <code className="font-mono text-indigo-600 dark:text-indigo-400">llm_tester_</code>.
              </span>
            </div>

            {/* Auto sync toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0b0f17]/70 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Insert results to Supabase after each run
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Every time a benchmark finishes, automatically saves all model latencies, ttft, and token stats.
                </p>
              </div>
            </label>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
              testResult.connected && testResult.tableExists
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                : testResult.connected
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
            }`}>
              {testResult.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.connected && !testResult.tableExists && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Use the &quot;Copy Schema SQL&quot; button below and run it in the Supabase SQL editor to create the prefixed tables.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Database Setup & Makefile commands */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0b0f17] border border-gray-200/80 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                Database Schema &amp; Scripts
              </span>
              <button
                type="button"
                onClick={handleCopySchemaSql}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                title="Copy schema SQL to clipboard"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy Schema SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Run this in your terminal to initialize the tables (<code className="font-mono text-indigo-600 dark:text-indigo-400">{runsTableName}</code> and <code className="font-mono text-indigo-600 dark:text-indigo-400">{resultsTableName}</code>):
            </p>

            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
              <p className="text-gray-400"># Using Makefile with your database connection URL:</p>
              <p className="text-emerald-400">make supabase-init DATABASE_URL=&quot;postgresql://postgres:pwd@db.ref.supabase.co:5432/postgres&quot;</p>
              <p className="text-gray-400 pt-1"># Or verify connectivity:</p>
              <p className="text-indigo-300">make supabase-verify</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d121c]/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || !url || !anonKey}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Test Connection
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              {saveSuccess ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
