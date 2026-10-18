/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ModelResult } from "../types";
import { 
  Clock, 
  Zap, 
  Layers, 
  Hash, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Server,
  ArrowRight
} from "lucide-react";

interface DevToolsTimingDetailProps {
  result: ModelResult;
}

export function DevToolsTimingDetail({ result }: DevToolsTimingDetailProps) {
  const [showFullTiming, setShowFullTiming] = useState(false);

  if (!result.metrics && result.status !== "success" && result.status !== "error") {
    return null;
  }

  const metrics = result.metrics || {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    durationMs: 0,
    tokensPerSecond: 0,
  };

  const totalMs = metrics.durationMs || 1;
  const queueMs = metrics.queueMs || result.startTimeOffsetMs || 0;
  const requestSentMs = metrics.requestSentMs || Math.min(2, Math.round(totalMs * 0.02));
  const ttfbMs = metrics.ttfbMs || Math.max(1, Math.round(totalMs * 0.35));
  const downloadMs = metrics.downloadMs || Math.max(1, totalMs - ttfbMs - requestSentMs);

  // Proportions for visual progress bars
  const totalPhaseSum = requestSentMs + ttfbMs + downloadMs;
  const requestSentPct = Math.max(2, (requestSentMs / totalPhaseSum) * 100);
  const ttfbPct = Math.max(5, (ttfbMs / totalPhaseSum) * 100);
  const downloadPct = Math.max(5, (downloadMs / totalPhaseSum) * 100);

  // Prompt vs Completion token ratio
  const totalTok = metrics.totalTokens || 1;
  const promptTokPct = Math.round((metrics.promptTokens / totalTok) * 100) || 0;
  const completionTokPct = Math.round((metrics.completionTokens / totalTok) * 100) || 0;

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 font-sans">
      {/* DevTools Network Summary Ribbon */}
      <div className="bg-[#1E222B] text-gray-200 rounded-xl p-3 mb-3 border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
            POST
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            result.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {result.statusCode || (result.status === 'success' ? '200 OK' : '500 ERR')}
          </span>
          <span className="text-gray-400 text-[11px] truncate max-w-[150px] sm:max-w-[220px]">
            {result.modelName}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-gray-400">
            Time: <strong className="text-white">
              {totalMs >= 1000 ? `${(totalMs / 1000).toFixed(2)}s` : `${Math.round(totalMs)}ms`}
            </strong>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">
            Speed: <strong className="text-indigo-400">{metrics.tokensPerSecond.toFixed(1)} t/s</strong>
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">
            Tokens: <strong className="text-emerald-400">{metrics.totalTokens}</strong>
          </span>
        </div>
      </div>

      {/* DevTools Mini Waterfall Bar */}
      <div className="bg-gray-50 dark:bg-[#161c28] rounded-xl p-3 border border-gray-200/80 dark:border-gray-800 mb-3">
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
            <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>DevTools Network Timing</span>
          </div>
          <button
            onClick={() => setShowFullTiming(!showFullTiming)}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors cursor-pointer"
          >
            {showFullTiming ? (
              <>Hide Breakdown <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Inspect Breakdown <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>

        {/* The Multi-Phase Waterfall Bar */}
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/60 rounded-md overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${requestSentPct}%` }}
            className="h-full bg-sky-400 hover:bg-sky-300 transition-colors"
            title={`Request Sent: ${Math.round(requestSentMs)}ms`}
          />
          <div 
            style={{ width: `${ttfbPct}%` }}
            className="h-full bg-amber-400 hover:bg-amber-300 transition-colors"
            title={`Waiting for server response (TTFB): ${Math.round(ttfbMs)}ms`}
          />
          <div 
            style={{ width: `${downloadPct}%` }}
            className="h-full bg-indigo-500 hover:bg-indigo-400 transition-colors"
            title={`Content Download & Generation: ${Math.round(downloadMs)}ms`}
          />
        </div>

        {/* Phase Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[10px] font-mono text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-sky-400" />
            <span>Sent: {Math.round(requestSentMs)}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-amber-400" />
            <span>TTFB: {Math.round(ttfbMs)}ms</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-indigo-500" />
            <span>Generation: {Math.round(downloadMs)}ms</span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 font-bold">
            Total: {totalMs >= 1000 ? `${(totalMs / 1000).toFixed(2)}s` : `${Math.round(totalMs)}ms`}
          </div>
        </div>
      </div>

      {/* Expanded DevTools Timing Tab (matching Chrome DevTools Timing view) */}
      {showFullTiming && (
        <div className="bg-[#181B20] text-gray-300 rounded-xl p-4 border border-gray-800 font-mono text-xs space-y-4 shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-800 pb-2 flex items-center justify-between text-gray-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Timing Phase</span>
            <div className="flex gap-12 pr-2">
              <span>Start</span>
              <span>Duration</span>
            </div>
          </div>

          {/* Section: Resource Scheduling */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Resource Scheduling</div>
            <div className="flex items-center justify-between py-1 px-1 hover:bg-gray-800/50 rounded">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-gray-500 rounded-xs" />
                <span className="text-gray-300">Queueing</span>
              </div>
              <div className="flex items-center gap-10 font-medium">
                <span className="text-gray-500 text-[11px]">0 ms</span>
                <span className="text-gray-400 text-[11px] w-14 text-right">{Math.round(queueMs)} ms</span>
              </div>
            </div>
          </div>

          {/* Section: Request / Response */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Request/Response</div>
            
            <div className="flex items-center justify-between py-1 px-1 hover:bg-gray-800/50 rounded">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-sky-400 rounded-xs" />
                <span className="text-gray-300">Request sent</span>
              </div>
              <div className="flex items-center gap-10 font-medium">
                <span className="text-gray-500 text-[11px]">{Math.round(queueMs)} ms</span>
                <span className="text-sky-300 text-[11px] w-14 text-right">{Math.round(requestSentMs)} ms</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 px-1 hover:bg-gray-800/50 rounded">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                <span className="text-gray-300">Waiting for server response (TTFB)</span>
              </div>
              <div className="flex items-center gap-10 font-medium">
                <span className="text-gray-500 text-[11px]">{Math.round(queueMs + requestSentMs)} ms</span>
                <span className="text-amber-300 text-[11px] w-14 text-right">{Math.round(ttfbMs)} ms</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 px-1 hover:bg-gray-800/50 rounded">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs" />
                <span className="text-gray-300">Content Download / Token Stream</span>
              </div>
              <div className="flex items-center gap-10 font-medium">
                <span className="text-gray-500 text-[11px]">{Math.round(queueMs + requestSentMs + ttfbMs)} ms</span>
                <span className="text-indigo-300 text-[11px] w-14 text-right">{Math.round(downloadMs)} ms</span>
              </div>
            </div>
          </div>

          {/* Section: Payload & Tokens Transfer */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Token Transfer & Throughput</div>
            
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#232731] p-2.5 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-400 mb-1">Tokens (Prompt / Comp)</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span className="text-indigo-400">{metrics.promptTokens}</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-emerald-400">{metrics.completionTokens}</span>
                  <span className="text-[10px] text-gray-500 font-normal">({metrics.totalTokens} tot)</span>
                </div>
                {/* Visual Ratio Bar */}
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden flex">
                  <div style={{ width: `${promptTokPct}%` }} className="h-full bg-indigo-400" title={`Prompt: ${metrics.promptTokens}`} />
                  <div style={{ width: `${completionTokPct}%` }} className="h-full bg-emerald-400" title={`Completion: ${metrics.completionTokens}`} />
                </div>
              </div>

              <div className="bg-[#232731] p-2.5 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-400 mb-1">Throughput Speed</div>
                <div className="text-sm font-bold text-indigo-300">
                  {metrics.tokensPerSecond.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">tok/sec</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Latency: {Math.round(ttfbMs)}ms TTFB
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
