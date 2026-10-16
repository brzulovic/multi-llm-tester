import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Clock, 
  Zap, 
  FileText, 
  Timer, 
  Maximize2, 
  Minimize2, 
  Split, 
  ListFilter,
  CheckCircle2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ModelResult, HistoryEntry } from '../types';
import { computeTokenDiff, DiffToken } from '../lib/diff';

export interface SelectableModelResult {
  id: string;
  sourceRunId: string;
  sourceRunPrompt: string;
  sourceTimestamp: number;
  modelResult: ModelResult;
}

interface ModelComparisonViewProps {
  currentResults: ModelResult[];
  history: HistoryEntry[];
  currentPrompt: string;
  initialModelAId?: string;
  initialModelBId?: string;
}

export function ModelComparisonView({
  currentResults,
  history,
  currentPrompt,
  initialModelAId,
  initialModelBId
}: ModelComparisonViewProps) {
  // Aggregate all completed model results from active results and history
  const allSelectableModels = useMemo<SelectableModelResult[]>(() => {
    const list: SelectableModelResult[] = [];
    const seenIds = new Set<string>();

    // 1. Current run results (if completed/success)
    currentResults.forEach((r, idx) => {
      if (r.status === 'success' || r.output) {
        const uniqueId = `current-${r.id || idx}-${r.modelName}`;
        seenIds.add(uniqueId);
        list.push({
          id: uniqueId,
          sourceRunId: 'current',
          sourceRunPrompt: currentPrompt || 'Current Run',
          sourceTimestamp: Date.now(),
          modelResult: r
        });
      }
    });

    // 2. Historical entries
    history.forEach((entry) => {
      entry.results.forEach((r, idx) => {
        if (r.status === 'success' || r.output) {
          const uniqueId = `hist-${entry.id}-${r.id || idx}-${r.modelName}`;
          if (!seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            list.push({
              id: uniqueId,
              sourceRunId: entry.id,
              sourceRunPrompt: entry.prompt,
              sourceTimestamp: entry.timestamp,
              modelResult: r
            });
          }
        }
      });
    });

    return list;
  }, [currentResults, history, currentPrompt]);

  // Selected models state
  const [selectedAId, setSelectedAId] = useState<string>('');
  const [selectedBId, setSelectedBId] = useState<string>('');
  const [diffMode, setDiffMode] = useState<'side-by-side' | 'unified' | 'raw'>('side-by-side');
  const [isCopiedA, setIsCopiedA] = useState(false);
  const [isCopiedB, setIsCopiedB] = useState(false);
  const [syncScroll, setSyncScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize or update selection if IDs change or if empty
  useEffect(() => {
    if (allSelectableModels.length >= 2) {
      if (!selectedAId || !allSelectableModels.some(m => m.id === selectedAId)) {
        setSelectedAId(initialModelAId && allSelectableModels.some(m => m.id === initialModelAId)
          ? initialModelAId
          : allSelectableModels[0].id);
      }
      if (!selectedBId || !allSelectableModels.some(m => m.id === selectedBId)) {
        setSelectedBId(initialModelBId && allSelectableModels.some(m => m.id === initialModelBId)
          ? initialModelBId
          : (allSelectableModels[1] ? allSelectableModels[1].id : allSelectableModels[0].id));
      }
    } else if (allSelectableModels.length === 1) {
      if (!selectedAId) setSelectedAId(allSelectableModels[0].id);
      if (!selectedBId) setSelectedBId(allSelectableModels[0].id);
    }
  }, [allSelectableModels, initialModelAId, initialModelBId]);

  const modelAData = useMemo(() => {
    return allSelectableModels.find(m => m.id === selectedAId);
  }, [allSelectableModels, selectedAId]);

  const modelBData = useMemo(() => {
    return allSelectableModels.find(m => m.id === selectedBId);
  }, [allSelectableModels, selectedBId]);

  const textA = modelAData?.modelResult.output || '';
  const textB = modelBData?.modelResult.output || '';

  // Compute token-level diff
  const diffResult = useMemo(() => {
    return computeTokenDiff(textA, textB);
  }, [textA, textB]);

  // Handle swapping Model A and B
  const handleSwap = () => {
    const temp = selectedAId;
    setSelectedAId(selectedBId);
    setSelectedBId(temp);
  };

  // Synchronized scrolling refs
  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);
  const isScrollingSync = useRef(false);

  const handleScrollA = () => {
    if (!syncScroll || isScrollingSync.current || !scrollRefA.current || !scrollRefB.current) return;
    isScrollingSync.current = true;
    const ratio = scrollRefA.current.scrollTop / (scrollRefA.current.scrollHeight - scrollRefA.current.clientHeight || 1);
    scrollRefB.current.scrollTop = ratio * (scrollRefB.current.scrollHeight - scrollRefB.current.clientHeight);
    setTimeout(() => { isScrollingSync.current = false; }, 50);
  };

  const handleScrollB = () => {
    if (!syncScroll || isScrollingSync.current || !scrollRefA.current || !scrollRefB.current) return;
    isScrollingSync.current = true;
    const ratio = scrollRefB.current.scrollTop / (scrollRefB.current.scrollHeight - scrollRefB.current.clientHeight || 1);
    scrollRefA.current.scrollTop = ratio * (scrollRefA.current.scrollHeight - scrollRefA.current.clientHeight);
    setTimeout(() => { isScrollingSync.current = false; }, 50);
  };

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (allSelectableModels.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/60">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          No Completed Model Outputs Yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Run a prompt with at least two models or import history to compare responses side-by-side with token-level diff highlighting.
        </p>
      </div>
    );
  }

  // Calculate speed / latency differences
  const durationA = modelAData?.modelResult.metrics?.durationMs;
  const durationB = modelBData?.modelResult.metrics?.durationMs;
  const speedA = modelAData?.modelResult.metrics?.tokensPerSecond;
  const speedB = modelBData?.modelResult.metrics?.tokensPerSecond;

  let speedComparisonText = '';
  if (durationA && durationB && durationA > 0 && durationB > 0) {
    if (durationA < durationB) {
      const ratio = (durationB / durationA).toFixed(1);
      const diffMs = Math.round(durationB - durationA);
      speedComparisonText = `${modelAData.modelResult.modelName} was ${ratio}x faster (-${diffMs}ms)`;
    } else if (durationB < durationA) {
      const ratio = (durationA / durationB).toFixed(1);
      const diffMs = Math.round(durationA - durationB);
      speedComparisonText = `${modelBData.modelResult.modelName} was ${ratio}x faster (-${diffMs}ms)`;
    } else {
      speedComparisonText = 'Both models completed in identical time';
    }
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto bg-gray-50 dark:bg-[#0b0f17] p-4 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700' : ''}`}>
      {/* Top Header & Model Selectors Bar */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Model Output Comparison
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  {diffResult.metrics.similarityPercentage}% Match
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Side-by-side evaluation with token-level diff highlighting
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & Fullscreen */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300">
              <button
                type="button"
                onClick={() => setDiffMode('side-by-side')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  diffMode === 'side-by-side'
                    ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold'
                    : 'hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Side-by-side token diff"
              >
                Side-by-Side Diff
              </button>
              <button
                type="button"
                onClick={() => setDiffMode('unified')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  diffMode === 'unified'
                    ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold'
                    : 'hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Inline unified diff"
              >
                Unified Diff
              </button>
              <button
                type="button"
                onClick={() => setDiffMode('raw')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  diffMode === 'raw'
                    ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold'
                    : 'hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                title="Raw plain outputs without highlights"
              >
                Raw Text
              </button>
            </div>

            {diffMode === 'side-by-side' && (
              <button
                type="button"
                onClick={() => setSyncScroll(!syncScroll)}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  syncScroll 
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
                title={syncScroll ? 'Sync scroll enabled' : 'Sync scroll disabled'}
              >
                <Split className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Model Selection Selectboxes */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Model A Dropdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              <span>Model A (Baseline / Reference)</span>
              {modelAData && (
                <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                  {diffResult.metrics.totalTokensA} tokens
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedAId}
                onChange={(e) => setSelectedAId(e.target.value)}
                data-testid="compare-select-model-a"
                className="w-full appearance-none px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all pr-8"
              >
                {allSelectableModels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.modelResult.modelName} &middot; {item.sourceRunPrompt.slice(0, 30)}... &middot; {item.modelResult.metrics?.durationMs ? `${Math.round(item.modelResult.metrics.durationMs)}ms` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Swap Model A and Model B"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Model B Dropdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              <span>Model B (Comparison / Target)</span>
              {modelBData && (
                <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                  {diffResult.metrics.totalTokensB} tokens
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={selectedBId}
                onChange={(e) => setSelectedBId(e.target.value)}
                data-testid="compare-select-model-b"
                className="w-full appearance-none px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all pr-8"
              >
                {allSelectableModels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.modelResult.modelName} &middot; {item.sourceRunPrompt.slice(0, 30)}... &middot; {item.modelResult.metrics?.durationMs ? `${Math.round(item.modelResult.metrics.durationMs)}ms` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Diff Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17] border border-gray-200/80 dark:border-gray-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
              Token Similarity
            </div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{diffResult.metrics.similarityPercentage}%</span>
              <span className="text-[10px] text-gray-400 font-normal">
                ({diffResult.metrics.equalTokens} identical)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-0.5">
              Unique to Model A
            </div>
            <div className="font-bold text-rose-700 dark:text-rose-300">
              {diffResult.metrics.removedTokens} tokens
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
              Unique to Model B
            </div>
            <div className="font-bold text-emerald-700 dark:text-emerald-300">
              {diffResult.metrics.addedTokens} tokens
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
              Speed Comparison
            </div>
            <div className="font-semibold text-indigo-700 dark:text-indigo-300 truncate" title={speedComparisonText || 'N/A'}>
              {speedComparisonText || 'Comparable'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Diff Display Body */}
      {diffMode === 'unified' ? (
        /* Unified Inline Diff */
        <div className="bg-white dark:bg-[#111622] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#0b0f17]/60 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              Unified Inline Diff
              <span className="font-normal text-gray-500">
                (Strikethrough = removed from Model A, Green = added in Model B)
              </span>
            </span>
          </div>
          <div className="p-5 max-h-[600px] overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
            {diffResult.diff.map((token, idx) => {
              if (token.type === 'equal') {
                return <span key={idx} className="text-gray-800 dark:text-gray-200">{token.value}</span>;
              } else if (token.type === 'removed') {
                return (
                  <span 
                    key={idx} 
                    className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 line-through decoration-rose-500 px-0.5 rounded-xs mx-[0.5px]"
                    title="Unique to Model A"
                  >
                    {token.value}
                  </span>
                );
              } else {
                return (
                  <span 
                    key={idx} 
                    className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-0.5 rounded-xs mx-[0.5px]"
                    title="Unique to Model B"
                  >
                    {token.value}
                  </span>
                );
              }
            })}
          </div>
        </div>
      ) : (
        /* Side-by-Side View (Highlighted Diff or Raw Clean Text) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Model A Column */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl border border-rose-200/80 dark:border-rose-950/50 shadow-xs overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="p-4 border-b border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-[#161217]/50 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {modelAData?.modelResult.modelName || 'Model A'}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {durationA ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      {Math.round(durationA)}ms
                    </span>
                  ) : null}
                  {speedA ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {speedA.toFixed(1)} t/s
                    </span>
                  ) : null}
                  {modelAData?.modelResult.metrics?.ttfbMs ? (
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3 text-indigo-400" />
                      TTFT: {Math.round(modelAData.modelResult.metrics.ttfbMs)}ms
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(textA, setIsCopiedA)}
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                title="Copy Model A response"
              >
                {isCopiedA ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Output Container */}
            <div
              ref={scrollRefA}
              onScroll={handleScrollA}
              data-testid="compare-output-a"
              className="p-5 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-gray-800 dark:text-gray-200"
            >
              {diffMode === 'raw' ? (
                textA || <span className="text-gray-400 italic">No output</span>
              ) : (
                diffResult.tokensAWithDiff.map((token, idx) => {
                  if (token.type === 'removed') {
                    return (
                      <span 
                        key={idx} 
                        className="bg-rose-100 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 font-semibold px-0.5 rounded-xs border-b border-rose-400/80"
                        title="Diff: Present in Model A, missing in Model B"
                      >
                        {token.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{token.value}</span>;
                })
              )}
            </div>
          </div>

          {/* Model B Column */}
          <div className="bg-white dark:bg-[#111622] rounded-2xl border border-emerald-200/80 dark:border-emerald-950/50 shadow-xs overflow-hidden flex flex-col">
            {/* Header Banner */}
            <div className="p-4 border-b border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-[#0f1715]/50 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {modelBData?.modelResult.modelName || 'Model B'}
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  {durationB ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      {Math.round(durationB)}ms
                    </span>
                  ) : null}
                  {speedB ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {speedB.toFixed(1)} t/s
                    </span>
                  ) : null}
                  {modelBData?.modelResult.metrics?.ttfbMs ? (
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3 text-indigo-400" />
                      TTFT: {Math.round(modelBData.modelResult.metrics.ttfbMs)}ms
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(textB, setIsCopiedB)}
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                title="Copy Model B response"
              >
                {isCopiedB ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Output Container */}
            <div
              ref={scrollRefB}
              onScroll={handleScrollB}
              data-testid="compare-output-b"
              className="p-5 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed whitespace-pre-wrap select-text text-gray-800 dark:text-gray-200"
            >
              {diffMode === 'raw' ? (
                textB || <span className="text-gray-400 italic">No output</span>
              ) : (
                diffResult.tokensBWithDiff.map((token, idx) => {
                  if (token.type === 'added') {
                    return (
                      <span 
                        key={idx} 
                        className="bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 font-semibold px-0.5 rounded-xs border-b border-emerald-400/80"
                        title="Diff: Present in Model B, missing in Model A"
                      >
                        {token.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{token.value}</span>;
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
