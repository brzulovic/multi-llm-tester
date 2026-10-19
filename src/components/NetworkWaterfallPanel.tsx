/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ModelResult } from "../types";
import { 
  Activity, 
  Clock, 
  Zap, 
  Layers, 
  ArrowDownUp, 
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Info,
  Maximize2,
  RefreshCw
} from "lucide-react";

interface NetworkWaterfallPanelProps {
  results: ModelResult[];
  onSelectResult?: (id: string) => void;
  selectedId?: string | null;
  sortField?: 'name' | 'state' | 'time' | 'speed' | 'tokens' | null;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: 'name' | 'state' | 'time' | 'speed' | 'tokens') => void;
  onRetryModel?: (id: string, modelName: string) => void;
}

export function NetworkWaterfallPanel({ 
  results, 
  onSelectResult, 
  selectedId,
  sortField: controlledSortField,
  sortDirection: controlledSortDirection,
  onSortChange,
  onRetryModel
}: NetworkWaterfallPanelProps) {
  const [hoveredResult, setHoveredResult] = useState<string | null>(null);
  const [internalSortField, setInternalSortField] = useState<'name' | 'state' | 'time' | 'speed' | 'tokens' | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>('asc');

  const sortField = controlledSortField !== undefined ? controlledSortField : internalSortField;
  const sortDirection = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDirection;

  if (results.length === 0) return null;

  const handleSort = (field: 'name' | 'state' | 'time' | 'speed' | 'tokens') => {
    if (onSortChange) {
      onSortChange(field);
    } else {
      if (internalSortField === field) {
        if (field === 'speed' || field === 'tokens') {
          if (internalSortDirection === 'desc') {
            setInternalSortDirection('asc');
          } else {
            setInternalSortField(null);
            setInternalSortDirection('desc');
          }
        } else {
          if (internalSortDirection === 'asc') {
            setInternalSortDirection('desc');
          } else {
            setInternalSortField(null);
            setInternalSortDirection('asc');
          }
        }
      } else {
        setInternalSortField(field);
        setInternalSortDirection((field === 'speed' || field === 'tokens') ? 'desc' : 'asc');
      }
    }
  };

  const sortedResults = React.useMemo(() => {
    if (!sortField) return results;
    return [...results].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.modelName.localeCompare(b.modelName);
      } else if (sortField === 'state') {
        const stateRank: Record<string, number> = {
          success: 1,
          pending: 2,
          error: 3,
          idle: 4
        };
        const rankA = stateRank[a.status] || 99;
        const rankB = stateRank[b.status] || 99;
        cmp = rankA - rankB;
        if (cmp === 0) {
          const codeA = a.statusCode || (a.status === 'success' ? 200 : 500);
          const codeB = b.statusCode || (b.status === 'success' ? 200 : 500);
          cmp = codeA - codeB || a.modelName.localeCompare(b.modelName);
        }
      } else if (sortField === 'time') {
        const timeA = a.metrics?.durationMs ?? (a.status === 'success' ? 0 : 9999999);
        const timeB = b.metrics?.durationMs ?? (b.status === 'success' ? 0 : 9999999);
        cmp = timeA - timeB;
        if (cmp === 0) {
          cmp = a.modelName.localeCompare(b.modelName);
        }
      } else if (sortField === 'speed') {
        const speedA = a.metrics?.tokensPerSecond ?? 0;
        const speedB = b.metrics?.tokensPerSecond ?? 0;
        cmp = speedA - speedB;
        if (cmp === 0) {
          cmp = a.modelName.localeCompare(b.modelName);
        }
      } else if (sortField === 'tokens') {
        const tokA = a.metrics?.totalTokens ?? (a.metrics?.completionTokens ?? 0);
        const tokB = b.metrics?.totalTokens ?? (b.metrics?.completionTokens ?? 0);
        cmp = tokA - tokB;
        if (cmp === 0) {
          cmp = a.modelName.localeCompare(b.modelName);
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [results, sortField, sortDirection]);

  // Calculate session timeline bounds
  const completedOrRunning = results.filter(r => r.status !== "idle");
  if (completedOrRunning.length === 0) return null;

  // Find max end time to scale the waterfall
  let maxEndTimeMs = 1000;
  completedOrRunning.forEach((r) => {
    const start = r.startTimeOffsetMs || r.metrics?.queueMs || 0;
    const dur = r.metrics?.durationMs || 500;
    const end = start + dur;
    if (end > maxEndTimeMs) {
      maxEndTimeMs = end;
    }
  });

  // Add 10% breathing room to max timeline
  const timelineScaleMs = Math.max(1000, Math.ceil((maxEndTimeMs * 1.08) / 100) * 100);

  // Generate 5 timeline ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const ms = (timelineScaleMs / tickCount) * i;
    return {
      ms,
      label: ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`,
      percent: (i / tickCount) * 100
    };
  });

  // Summary statistics
  const finishedResults = results.filter(r => r.status === "success");
  const totalTokens = finishedResults.reduce((acc, r) => acc + (r.metrics?.totalTokens || 0), 0);
  const totalDurationSec = (maxEndTimeMs / 1000).toFixed(2);
  const avgSpeed = finishedResults.length > 0 
    ? (finishedResults.reduce((acc, r) => acc + (r.metrics?.tokensPerSecond || 0), 0) / finishedResults.length).toFixed(1)
    : "0";

  const fastestResult = finishedResults.length > 0
    ? [...finishedResults].sort((a, b) => (a.metrics?.durationMs || 999999) - (b.metrics?.durationMs || 999999))[0]
    : null;

  return (
    <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden font-sans">
      {/* DevTools Network Tab Header Bar */}
      <div className="bg-[#1E222B] text-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">DevTools</span>
          </div>
          <span className="text-gray-500">|</span>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Network Timing Waterfall</h3>
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-gray-400">
            Requests: <strong className="text-white">{results.length}</strong>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">
            Tokens: <strong className="text-indigo-300">{totalTokens.toLocaleString()}</strong>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">
            Finish: <strong className="text-emerald-300">{totalDurationSec}s</strong>
          </span>
        </div>
      </div>

      {/* Legend & Phase indicators */}
      <div className="bg-gray-50 dark:bg-[#161c28] px-5 py-2 border-b border-gray-200/70 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Phases:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm bg-gray-300 dark:bg-gray-600 inline-block" />
            <span className="text-gray-600 dark:text-gray-300">Queueing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span className="text-gray-600 dark:text-gray-300">Waiting (TTFB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm bg-indigo-500 inline-block" />
            <span className="text-gray-600 dark:text-gray-300">Token Generation & Download</span>
          </div>
        </div>

        {fastestResult && (
          <a
            href={`#${fastestResult.id}`}
            data-testid="fastest-result-anchor"
            onClick={(e) => {
              if (onSelectResult) {
                e.preventDefault();
                onSelectResult(fastestResult.id);
              }
            }}
            className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono transition-all group cursor-pointer shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700"
            title={`Jump to fastest result: ${fastestResult.modelName}`}
          >
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20 group-hover:scale-110 transition-transform" />
            <span>Fastest: <strong>{fastestResult.modelName}</strong> ({((fastestResult.metrics?.durationMs || 0) / 1000).toFixed(2)}s)</span>
            <ArrowDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
          </a>
        )}
      </div>

      {/* Table & Waterfall Area */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Table Header with Timeline Ruler */}
          <div className="grid grid-cols-12 bg-gray-100/90 dark:bg-[#181d2a] text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 py-2 px-4 items-center">
            {/* Sortable Name Column */}
            <button
              type="button"
              onClick={() => handleSort('name')}
              className="col-span-3 flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left font-bold uppercase tracking-wider group cursor-pointer focus:outline-none"
              title="Click to sort by model Name"
            >
              <span>Name / Method</span>
              {sortField === 'name' ? (
                sortDirection === 'asc' ? (
                  <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Sortable State Column */}
            <button
              type="button"
              onClick={() => handleSort('state')}
              className="col-span-1 flex items-center justify-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-center font-bold uppercase tracking-wider group cursor-pointer focus:outline-none"
              title="Click to sort by State / Status"
            >
              <span>State</span>
              {sortField === 'state' ? (
                sortDirection === 'asc' ? (
                  <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            <div className="col-span-1 text-center font-mono text-[10px] text-gray-500 dark:text-gray-400">Type</div>
            
            {/* Sortable Tokens Column */}
            <button
              type="button"
              onClick={() => handleSort('tokens')}
              data-testid="sort-tokens-btn"
              className="col-span-1 flex items-center justify-end gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right font-bold uppercase tracking-wider group cursor-pointer focus:outline-none"
              title="Click to sort by Tokens"
            >
              <span>Tokens</span>
              {sortField === 'tokens' ? (
                sortDirection === 'desc' ? (
                  <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Sortable Time Column */}
            <button
              type="button"
              onClick={() => handleSort('time')}
              data-testid="sort-time-btn"
              className="col-span-1 flex items-center justify-end gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right font-bold uppercase tracking-wider group cursor-pointer focus:outline-none"
              title="Click to sort by Time / duration"
            >
              <span>Time</span>
              {sortField === 'time' ? (
                sortDirection === 'asc' ? (
                  <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            {/* Sortable Speed Column */}
            <button
              type="button"
              onClick={() => handleSort('speed')}
              data-testid="sort-speed-btn"
              className="col-span-1 flex items-center justify-end gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right font-bold uppercase tracking-wider group cursor-pointer focus:outline-none"
              title="Click to sort by Speed / tokens per second"
            >
              <span>Speed</span>
              {sortField === 'speed' ? (
                sortDirection === 'desc' ? (
                  <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                )
              ) : (
                <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            
            {/* Waterfall Ruler Header */}
            <div className="col-span-4 pl-3 relative h-4">
              <div className="absolute inset-0 flex justify-between items-center text-[9px] font-mono text-gray-400 dark:text-gray-500 select-none">
                {ticks.map((t, idx) => (
                  <span 
                    key={idx} 
                    style={{ left: `${t.percent}%` }}
                    className={`absolute -translate-x-1/2 ${idx === 0 ? '!translate-x-0' : idx === ticks.length - 1 ? '!translate-x-[-100%]' : ''}`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs">
            {sortedResults.map((result) => {
              const startOffset = result.startTimeOffsetMs || result.metrics?.queueMs || 0;
              const duration = result.metrics?.durationMs || 0;
              const ttfb = result.metrics?.ttfbMs || (duration * 0.4);
              const download = result.metrics?.downloadMs || (duration - ttfb);

              const leftPercent = Math.min(95, Math.max(0, (startOffset / timelineScaleMs) * 100));
              const durationPercent = Math.max(2, Math.min(100 - leftPercent, (duration / timelineScaleMs) * 100));
              
              const ttfbRatio = duration > 0 ? Math.min(1, Math.max(0.1, ttfb / duration)) : 0.4;
              const downloadRatio = 1 - ttfbRatio;

              const isSelected = selectedId === result.id;
              const isHovered = hoveredResult === result.id;

              return (
                <div
                  key={result.id}
                  onClick={() => onSelectResult && onSelectResult(result.id)}
                  onMouseEnter={() => setHoveredResult(result.id)}
                  onMouseLeave={() => setHoveredResult(null)}
                  className={`grid grid-cols-12 py-2.5 px-4 items-center transition-colors cursor-pointer group ${
                    isSelected 
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40' 
                      : isHovered 
                        ? 'bg-gray-50 dark:bg-[#161c28]' 
                        : 'hover:bg-gray-50/70 dark:hover:bg-[#161c28]/60'
                  }`}
                >
                  {/* Model Name & Method */}
                  <div className="col-span-3 flex items-center gap-1.5 pr-2 overflow-hidden">
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[9px] font-black shrink-0">
                      POST
                    </span>
                    {result.hasSystemPrompt && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[8px] font-bold shrink-0" title="Custom System Prompt injected">
                        SYS
                      </span>
                    )}
                    <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 truncate" title={result.modelName}>
                      {result.modelName}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 text-center">
                    {result.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ...
                      </span>
                    )}
                    {result.status === "success" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold">
                        {result.statusCode || 200}
                      </span>
                    )}
                    {result.status === "error" && (
                      <div className="inline-flex items-center gap-1">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          result.isTimeout ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                        }`} title={result.isTimeout ? `Timed out after ${((result.metrics?.durationMs || 0)/1000).toFixed(1)}s` : result.error}>
                          {result.statusCode || 500} {result.isTimeout && <Clock className="w-2.5 h-2.5 ml-0.5 text-amber-700 dark:text-amber-400" />}
                        </span>
                        {onRetryModel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetryModel(result.id, result.modelName);
                            }}
                            title={`Retry ${result.modelName}`}
                            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                    {result.status === "idle" && (
                      <span className="text-gray-400 dark:text-gray-600 font-mono text-[10px]">-</span>
                    )}
                  </div>

                  {/* Type */}
                  <div className="col-span-1 text-center font-mono text-[10px] text-gray-500 dark:text-gray-400">
                    fetch
                  </div>

                  {/* Tokens */}
                  <div className="col-span-1 text-right font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                    {result.status === "success" ? (
                      <span title={`Prompt: ${result.metrics?.promptTokens || 0} | Completion: ${result.metrics?.completionTokens || 0}`}>
                        {result.metrics?.totalTokens || 0}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">-</span>
                    )}
                  </div>

                  {/* Time */}
                  <div className="col-span-1 text-right font-mono text-xs font-bold text-gray-800 dark:text-gray-200">
                    {result.status === "success" || result.status === "error" ? (
                      duration >= 1000 ? `${(duration / 1000).toFixed(2)}s` : `${Math.round(duration)}ms`
                    ) : result.status === "pending" ? (
                      <span className="text-amber-500 dark:text-amber-400 text-[10px]">active</span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">-</span>
                    )}
                  </div>

                  {/* Speed */}
                  <div className="col-span-1 text-right font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    {result.status === "success" && (result.metrics?.tokensPerSecond || 0) > 0 ? (
                      `${result.metrics?.tokensPerSecond.toFixed(1)}/s`
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">-</span>
                    )}
                  </div>

                  {/* Waterfall Timeline Track */}
                  <div className="col-span-4 pl-3 relative h-6 flex items-center">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40">
                      {ticks.map((t, idx) => (
                        <div 
                          key={idx} 
                          style={{ left: `${t.percent}%` }}
                          className="absolute top-0 bottom-0 w-[1px] bg-gray-200 dark:bg-gray-700/60" 
                        />
                      ))}
                    </div>

                    {/* The Bar */}
                    {result.status === "pending" && (
                      <div 
                        style={{ left: `${leftPercent}%`, width: '40px' }}
                        className="absolute h-3.5 bg-amber-400/80 rounded-sm animate-pulse flex items-center justify-center text-[8px] font-mono text-white"
                      />
                    )}

                    {(result.status === "success" || result.status === "error") && duration > 0 && (
                      <div
                        style={{ 
                          left: `${leftPercent}%`, 
                          width: `${durationPercent}%`,
                          minWidth: '12px' 
                        }}
                        className="group/bar relative h-3.5 rounded-sm flex overflow-hidden shadow-xs cursor-pointer transition-all hover:ring-2 hover:ring-indigo-400"
                      >
                        {/* TTFB phase segment */}
                        <div 
                          style={{ width: `${ttfbRatio * 100}%` }}
                          className="h-full bg-amber-400 hover:bg-amber-300 transition-colors"
                          title={`Waiting for response (TTFB): ${Math.round(ttfb)}ms`}
                        />
                        {/* Download / Content Generation phase segment */}
                        <div 
                          style={{ width: `${downloadRatio * 100}%` }}
                          className={`h-full ${result.status === 'error' ? 'bg-red-400' : 'bg-indigo-500 hover:bg-indigo-400'} transition-colors`}
                          title={`Content Generation & Download: ${Math.round(download)}ms`}
                        />

                        {/* Timing Label next to bar */}
                        <span className="absolute -right-1 translate-x-full pl-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-gray-500 dark:text-gray-300 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 bg-white/90 dark:bg-[#181d2a]/95 px-1 rounded shadow-xs">
                          {duration >= 1000 ? `${(duration / 1000).toFixed(2)}s` : `${Math.round(duration)}ms`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DevTools Network Tab Status Footer */}
      <div className="bg-[#1E222B] text-gray-400 px-5 py-2.5 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span>{results.length} requests</span>
          <span className="text-gray-600">|</span>
          <span>{totalTokens.toLocaleString()} tokens transferred</span>
          <span className="text-gray-600">|</span>
          <span>Finish: <strong className="text-emerald-400">{totalDurationSec} s</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <span>Avg Speed: <strong className="text-indigo-300">{avgSpeed} tok/s</strong></span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3 text-gray-400" />
            Click any row to view response
          </span>
        </div>
      </div>
    </div>
  );
}
