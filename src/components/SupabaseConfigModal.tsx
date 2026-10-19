/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  FolderKanban,
  Table as TableIcon,
  Sliders,
  Layers,
  Activity
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  setSupabaseConfig, 
  testSupabaseConnection, 
  isSupabaseConfigured,
  DEFAULT_TABLE_PREFIX
} from '../lib/supabase';
import { SupabaseDataGrid } from './SupabaseDataGrid';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
  syncLogs?: Array<{
    id: string;
    timestamp: number;
    status: 'success' | 'error' | 'syncing';
    message: string;
    runId?: string;
  }>;
}

export function SupabaseConfigModal({ isOpen, onClose, onConfigSaved, syncLogs = [] }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tablePrefix, setTablePrefix] = useState(DEFAULT_TABLE_PREFIX);
  const [autoSync, setAutoSync] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [modalView, setModalView] = useState<'config' | 'grid'>('config');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl ${
          modalView === 'grid' ? 'max-w-5xl' : 'max-w-xl'
        } w-full max-h-[92vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100 transition-all duration-200`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="supabase-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/70 dark:bg-[#0d121c]/70 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 id="supabase-modal-title" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Supabase Database {modalView === 'grid' ? 'Data Grid' : 'Setup'}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                  isSupabaseConfigured() 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                }`}>
                  {isSupabaseConfigured() ? 'Connected' : 'Not Configured'}
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {modalView === 'grid' 
                  ? 'Inspect, search, sort, and export benchmark data stored in Supabase' 
                  : 'Automatically insert benchmark runs and performance metrics after each test.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher tabs in header */}
            <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalView('config')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  modalView === 'config'
                    ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-2xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSupabaseConfig({ url, anonKey, tablePrefix: currentPrefix, autoSync });
                  setModalView('grid');
                }}
                disabled={!url || !anonKey}
                data-testid="header-view-data-grid-tab"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  modalView === 'grid'
                    ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-2xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-40'
                }`}
              >
                <TableIcon className="w-3 h-3" />
                <span>Data Grid</span>
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              aria-label="Close Supabase modal"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Config or Grid Table */}
        {modalView === 'grid' ? (
          <div className="p-5 sm:p-6 flex-1 overflow-hidden flex flex-col min-h-[400px]">
            <SupabaseDataGrid 
              runsTableName={runsTableName}
              resultsTableName={resultsTableName}
            />
          </div>
        ) : (
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
                  data-testid="supabase-url-input"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Supabase Anon (Public) Key
                </label>
                <input 
                  type="password" 
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  data-testid="supabase-key-input"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Table Prefix Configuration */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                    Table Name Prefix
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Prevents naming collisions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={tablePrefix}
                    onChange={(e) => setTablePrefix(e.target.value)}
                    placeholder="llm_tester_"
                    className="w-48 px-3.5 py-2 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    → <span className="text-indigo-600 dark:text-indigo-400 font-bold">{runsTableName}</span>
                  </span>
                </div>
              </div>

              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${autoSync ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Automatic Sync</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Insert results to Supabase after each run</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Test Result Callout */}
            {testResult && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                testResult.connected && testResult.tableExists
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : testResult.connected && !testResult.tableExists
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}>
                {testResult.connected && testResult.tableExists ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testResult.connected ? 'Connection Succeeded' : 'Connection Failed'}</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            {/* Database Schema Setup Helper */}
            <div className="p-4 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  Database Migration & SQL Schema
                </span>
                <button
                  type="button"
                  onClick={handleCopySchemaSql}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
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

            {/* Sync Log Panel */}
            <div className="p-4 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Supabase Sync Log ({syncLogs.length})
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Recent database operations</span>
              </div>

              {syncLogs.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-[#111622] rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
                  No sync operations logged yet. Run a benchmark with Auto Sync enabled.
                </div>
              ) : (
                <div className="max-h-[180px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1 font-mono text-[11px]">
                  {syncLogs.map((log) => {
                    const badgeColor = 
                      log.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                      log.status === 'error' ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800' :
                      'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 animate-pulse';

                    return (
                      <div key={log.id} className="p-2 bg-white dark:bg-[#111622] rounded-lg border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 border ${badgeColor}`}>
                            {log.status}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 truncate">{log.message}</span>
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer with "Test Connection" and "View Data in Grid Table" */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0d121c]/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !url || !anonKey}
              data-testid="supabase-test-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Test Connection</span>
            </button>

            {/* Button next to Test Connection to show in a grid table content from Supabase */}
            <button
              type="button"
              onClick={() => {
                if (modalView === 'grid') {
                  setModalView('config');
                } else {
                  setSupabaseConfig({ url, anonKey, tablePrefix: currentPrefix, autoSync });
                  setModalView('grid');
                }
              }}
              disabled={!url || !anonKey}
              data-testid="supabase-view-data-grid-btn"
              title="Show in a grid table content from Supabase"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                modalView === 'grid'
                  ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                  : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              } disabled:opacity-50`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{modalView === 'grid' ? 'Connection Settings' : 'View Data Grid Table'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {modalView === 'grid' ? 'Close' : 'Cancel'}
            </button>
            {modalView === 'config' && (
              <button
                type="button"
                onClick={handleSave}
                data-testid="supabase-save-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saveSuccess ? 'Saved!' : 'Save Settings'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default SupabaseConfigModal;
