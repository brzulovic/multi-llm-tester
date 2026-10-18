/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  RefreshCw, 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Copy, 
  Check, 
  X, 
  Table as TableIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchSupabaseTableData } from '../lib/supabase';

interface SupabaseDataGridProps {
  runsTableName: string;
  resultsTableName: string;
}

export function SupabaseDataGrid({ runsTableName, resultsTableName }: SupabaseDataGridProps) {
  const [activeTable, setActiveTable] = useState<'runs' | 'results'>('runs');
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCellContent, setSelectedCellContent] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const currentTableName = activeTable === 'runs' ? runsTableName : resultsTableName;

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchSupabaseTableData(currentTableName, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: sortColumn,
        ascending: sortDirection === 'asc'
      });

      if (res.error) {
        setError(res.error);
        setData([]);
        setTotalCount(0);
      } else {
        setData(res.data);
        setTotalCount(res.count);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load table content from Supabase');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTable, page, pageSize, sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
    setPage(1);
  };

  // Get dynamic column keys from rows
  const columns = useMemo(() => {
    if (data.length === 0) {
      if (activeTable === 'runs') {
        return ['id', 'created_at', 'total_models', 'successful_models', 'fastest_model', 'fastest_time_ms', 'prompt'];
      }
      return ['id', 'run_id', 'model_name', 'status', 'latency_ms', 'tokens_per_sec', 'token_count', 'output', 'created_at'];
    }
    const keysSet = new Set<string>();
    // Prioritize key columns first
    const primaryKeys = activeTable === 'runs' 
      ? ['id', 'created_at', 'total_models', 'successful_models', 'fastest_model', 'fastest_time_ms', 'prompt', 'endpoint']
      : ['id', 'run_id', 'model_name', 'status', 'latency_ms', 'tokens_per_sec', 'token_count', 'output', 'created_at'];

    primaryKeys.forEach(k => keysSet.add(k));
    data.forEach(row => {
      Object.keys(row).forEach(k => keysSet.add(k));
    });

    return Array.from(keysSet);
  }, [data, activeTable]);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery]);

  // Export current table view as CSV or JSON
  const handleExport = (format: 'csv' | 'json') => {
    if (filteredData.length === 0) return;
    let content = '';
    let mimeType = 'text/plain';
    let fileName = `${currentTableName}_${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(filteredData, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      const headers = columns.join(',');
      const rows = filteredData.map(row => {
        return columns.map(col => {
          let val = row[col];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        }).join(',');
      });
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      fileName += '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil((totalCount || 0) / pageSize) || 1;

  return (
    <div className="flex flex-col h-full space-y-3 font-sans text-xs">
      {/* Table Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
        {/* Table tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTable('runs'); setPage(1); }}
            data-testid="grid-tab-runs"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTable === 'runs'
                ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Benchmark Runs</span>
            <code className="text-[10px] font-mono opacity-60">({runsTableName})</code>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTable('results'); setPage(1); }}
            data-testid="grid-tab-results"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTable === 'results'
                ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Model Results</span>
            <code className="text-[10px] font-mono opacity-60">({resultsTableName})</code>
          </button>
        </div>

        {/* Search, Refresh & Export */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table rows..."
              data-testid="supabase-grid-search-input"
              className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs outline-none focus:border-indigo-500 w-48 sm:w-56"
            />
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            data-testid="supabase-grid-refresh-btn"
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh table data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={filteredData.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161c28] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold cursor-pointer disabled:opacity-50"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error querying Supabase table <code className="font-mono">{currentTableName}</code>:</p>
            <p className="text-xs mt-0.5 opacity-90">{error}</p>
            {error.includes('does not exist') && (
              <p className="text-[11px] mt-1 text-rose-600 dark:text-rose-400">
                Tip: Run <code className="font-mono font-bold">make supabase-init</code> or apply <code className="font-mono">scripts/supabase_schema.sql</code> to create tables.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Grid Table Container */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0b0f17] max-h-[50vh] min-h-[260px] relative shadow-inner">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#0b0f17]/70 backdrop-blur-2xs z-20 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-gray-700 dark:text-gray-300">Fetching rows from Supabase...</span>
          </div>
        )}

        {filteredData.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 dark:text-gray-500 space-y-2">
            <TableIcon className="w-8 h-8 opacity-40 text-indigo-400" />
            <p className="font-bold text-gray-700 dark:text-gray-300">No records found in table <code className="font-mono">{currentTableName}</code></p>
            <p className="text-xs max-w-sm">
              {searchQuery ? `No rows matched query "${searchQuery}".` : 'Run a benchmark from the main workbench with "Auto-Sync" enabled to record results here.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[#161c28] border-b border-gray-200 dark:border-gray-800 z-10 text-gray-600 dark:text-gray-300 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                {columns.map(col => {
                  const isSorted = sortColumn === col;
                  return (
                    <th 
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-3.5 py-2.5 border-r border-gray-100 dark:border-gray-800/80 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none transition-colors"
                      title={`Click to sort by ${col}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{col}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 opacity-30 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono text-[11px]">
              {filteredData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  {columns.map(col => {
                    const val = row[col];
                    let displayVal: React.ReactNode = String(val ?? '');

                    // Special column formatters
                    if (val === null || val === undefined) {
                      displayVal = <span className="text-gray-300 dark:text-gray-600">-</span>;
                    } else if (col === 'status') {
                      displayVal = (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-max ${
                          val === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {val === 'success' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                          {String(val)}
                        </span>
                      );
                    } else if (col === 'latency_ms' || col === 'fastest_time_ms') {
                      displayVal = typeof val === 'number' ? (
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {val >= 1000 ? `${(val / 1000).toFixed(2)}s` : `${Math.round(val)}ms`}
                        </span>
                      ) : String(val);
                    } else if (col === 'tokens_per_sec') {
                      displayVal = typeof val === 'number' ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {val.toFixed(1)} tok/s
                        </span>
                      ) : String(val);
                    } else if (col === 'created_at' || col === 'timestamp') {
                      try {
                        const date = new Date(val);
                        displayVal = (
                          <span className="text-gray-500 dark:text-gray-400" title={date.toISOString()}>
                            {date.toLocaleDateString()} {date.toLocaleTimeString()}
                          </span>
                        );
                      } catch {
                        displayVal = String(val);
                      }
                    } else if (typeof val === 'object') {
                      displayVal = (
                        <button
                          type="button"
                          onClick={() => setSelectedCellContent({ title: col, content: JSON.stringify(val, null, 2) })}
                          className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          View JSON ({Object.keys(val || {}).length} keys)
                        </button>
                      );
                    } else if (typeof val === 'string' && val.length > 50) {
                      displayVal = (
                        <button
                          type="button"
                          onClick={() => setSelectedCellContent({ title: col, content: val })}
                          className="truncate max-w-[200px] block hover:text-indigo-600 dark:hover:text-indigo-400 text-left cursor-pointer"
                          title="Click to view full content"
                        >
                          {val.slice(0, 48)}...
                        </button>
                      );
                    }

                    return (
                      <td key={col} className="px-3.5 py-2 border-r border-gray-100 dark:border-gray-800/60 truncate max-w-[280px]">
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-gray-500 dark:text-gray-400 text-xs">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong>{filteredData.length}</strong> {totalCount !== null ? `of ${totalCount}` : ''} rows
          </span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <div className="flex items-center gap-1">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 font-bold cursor-pointer text-xs"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cell Content Modal (for viewing large texts or JSON) */}
      {selectedCellContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111622]">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Cell Detail: {selectedCellContent.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedCellContent.content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCellContent(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs whitespace-pre-wrap leading-relaxed bg-gray-50/50 dark:bg-[#0b0f17]">
              {selectedCellContent.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SupabaseDataGrid;
