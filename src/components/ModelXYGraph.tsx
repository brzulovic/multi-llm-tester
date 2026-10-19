/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from "react";
import { 
  ModelResult 
} from "../types";
import { getModelCapabilities, ModelCapabilityInfo } from "../data/modelCapabilities";
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Hash, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  Layers, 
  Maximize2,
  Sliders,
  Cpu,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move
} from "lucide-react";

export type MetricKey = 'durationMs' | 'tps' | 'totalTokens' | 'completionTokens' | 'ttfbMs' | 'promptTokens';

interface MetricOption {
  key: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  format: (val: number) => string;
  getValue: (r: ModelResult) => number | null;
}

const METRIC_OPTIONS: Record<MetricKey, MetricOption> = {
  durationMs: {
    key: 'durationMs',
    label: 'Duration / Latency',
    shortLabel: 'Latency',
    unit: 'ms',
    format: (val) => val >= 1000 ? `${(val / 1000).toFixed(2)}s` : `${Math.round(val)}ms`,
    getValue: (r) => r.metrics?.durationMs ?? (r.status === 'success' ? 0 : null)
  },
  tps: {
    key: 'tps',
    label: 'Generation Speed (Tokens / Sec)',
    shortLabel: 'Speed',
    unit: 'tok/s',
    format: (val) => `${val.toFixed(1)} tok/s`,
    getValue: (r) => r.metrics?.tokensPerSecond ?? null
  },
  totalTokens: {
    key: 'totalTokens',
    label: 'Total Tokens',
    shortLabel: 'Total Tokens',
    unit: 'tokens',
    format: (val) => `${Math.round(val).toLocaleString()} tokens`,
    getValue: (r) => r.metrics?.totalTokens ?? (r.metrics?.completionTokens ? (r.metrics.completionTokens + (r.metrics.promptTokens || 0)) : null)
  },
  completionTokens: {
    key: 'completionTokens',
    label: 'Output / Completion Tokens',
    shortLabel: 'Output Tokens',
    unit: 'tokens',
    format: (val) => `${Math.round(val).toLocaleString()} tokens`,
    getValue: (r) => r.metrics?.completionTokens ?? null
  },
  promptTokens: {
    key: 'promptTokens',
    label: 'Prompt Tokens',
    shortLabel: 'Prompt Tokens',
    unit: 'tokens',
    format: (val) => `${Math.round(val).toLocaleString()} tokens`,
    getValue: (r) => r.metrics?.promptTokens ?? null
  },
  ttfbMs: {
    key: 'ttfbMs',
    label: 'Time to First Byte (TTFB)',
    shortLabel: 'TTFB',
    unit: 'ms',
    format: (val) => `${Math.round(val)}ms`,
    getValue: (r) => r.metrics?.ttfbMs ?? null
  }
};

interface ModelXYGraphProps {
  results: ModelResult[];
  allSelectedModels?: string[];
  selectedId?: string | null;
  onSelectResult?: (id: string) => void;
  systemPromptTargetModels?: string[];
  customSystemPrompt?: string;
}

interface PlotPoint {
  id: string;
  modelName: string;
  result?: ModelResult;
  capabilities: ModelCapabilityInfo;
  xValue: number;
  yValue: number;
  hasInjectedSystemPrompt: boolean;
  status: 'success' | 'error' | 'pending' | 'idle';
  svgX: number;
  svgY: number;
}

export const ModelXYGraph: React.FC<ModelXYGraphProps> = ({
  results,
  allSelectedModels = [],
  selectedId,
  onSelectResult,
  systemPromptTargetModels = [],
  customSystemPrompt = ""
}) => {
  const [xAxisKey, setXAxisKey] = useState<MetricKey>('durationMs');
  const [yAxisKey, setYAxisKey] = useState<MetricKey>('tps');
  const [hoveredPoint, setHoveredPoint] = useState<PlotPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state for inspecting tightly clustered results
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev * 1.35).toFixed(2)), 6));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(Number((prev / 1.35).toFixed(2)), 1);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 440;
  const padding = { top: 40, right: 50, bottom: 65, left: 75 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Native SVG dynamic viewBox for zoom and pan
  const viewWidth = svgWidth / zoomLevel;
  const viewHeight = svgHeight / zoomLevel;
  const maxPanX = (svgWidth - viewWidth) / 2;
  const maxPanY = (svgHeight - viewHeight) / 2;
  const clampedPanX = Math.max(-maxPanX * 1.5, Math.min(maxPanX * 1.5, panOffset.x));
  const clampedPanY = Math.max(-maxPanY * 1.5, Math.min(maxPanY * 1.5, panOffset.y));
  const viewBoxX = (svgWidth - viewWidth) / 2 + clampedPanX;
  const viewBoxY = (svgHeight - viewHeight) / 2 + clampedPanY;

  const xMetric = METRIC_OPTIONS[xAxisKey];
  const yMetric = METRIC_OPTIONS[yAxisKey];

  // Merge results with all configured models so that even idle/pending models show up
  const modelsToPlot = useMemo(() => {
    const list: Array<{ modelName: string; result?: ModelResult }> = [];
    const seen = new Set<string>();

    // 1. From current results
    results.forEach((r) => {
      list.push({ modelName: r.modelName, result: r });
      seen.add(r.modelName.toLowerCase());
    });

    // 2. From allSelectedModels if not already in results
    allSelectedModels.forEach((m) => {
      const trimmed = m.trim();
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        list.push({ modelName: trimmed, result: undefined });
        seen.add(trimmed.toLowerCase());
      }
    });

    return list;
  }, [results, allSelectedModels]);

  // Extract raw points and calculate min/max
  const { points, xMin, xMax, yMin, yMax } = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    const rawPoints = modelsToPlot.map((item, index) => {
      const res = item.result;
      const capabilities = getModelCapabilities(item.modelName);
      
      const hasSystemPrompt = Boolean(
        res?.hasSystemPrompt || 
        systemPromptTargetModels.some(m => m.trim().toLowerCase() === item.modelName.trim().toLowerCase())
      );

      // Extract X and Y values or provide defaults based on status/capabilities
      let xVal = res ? xMetric.getValue(res) : null;
      let yVal = res ? yMetric.getValue(res) : null;

      // Fallback for idle/pending models or missing metrics so they stay visible on the chart
      if (xVal === null || isNaN(xVal)) {
        if (xAxisKey === 'durationMs') xVal = 0;
        else if (xAxisKey === 'tps') xVal = 0;
        else if (xAxisKey === 'totalTokens') xVal = 0;
        else xVal = 0;
      }

      if (yVal === null || isNaN(yVal)) {
        if (yAxisKey === 'tps') yVal = 0;
        else if (yAxisKey === 'durationMs') yVal = 0;
        else if (yAxisKey === 'totalTokens') yVal = 0;
        else yVal = 0;
      }

      if (xVal < minX) minX = xVal;
      if (xVal > maxX) maxX = xVal;
      if (yVal < minY) minY = yVal;
      if (yVal > maxY) maxY = yVal;

      return {
        id: res?.id || `model-${item.modelName}-${index}`,
        modelName: item.modelName,
        result: res,
        capabilities,
        xValue: xVal,
        yValue: yVal,
        hasInjectedSystemPrompt: hasSystemPrompt,
        status: res ? res.status : 'idle',
      };
    });

    // Sanitize min and max with reasonable padding
    if (minX === Infinity || maxX === -Infinity) {
      minX = 0;
      maxX = 100;
    }
    if (minY === Infinity || maxY === -Infinity) {
      minY = 0;
      maxY = 100;
    }

    // Always include 0 as minimum for speed and tokens, and duration
    minX = Math.min(0, minX);
    minY = Math.min(0, minY);

    // Add 15% headroom to max for visual breathing room
    maxX = maxX === 0 ? 10 : maxX * 1.15;
    maxY = maxY === 0 ? 10 : maxY * 1.15;

    // Calculate SVG coordinates
    const computedPoints: PlotPoint[] = rawPoints.map((pt) => {
      const xRatio = (pt.xValue - minX) / (maxX - minX || 1);
      const yRatio = (pt.yValue - minY) / (maxY - minY || 1);

      const svgX = padding.left + xRatio * plotWidth;
      // In SVG, Y coordinates go from top (0) to bottom (height)
      const svgY = padding.top + (1 - yRatio) * plotHeight;

      return {
        ...pt,
        svgX,
        svgY
      };
    });

    return {
      points: computedPoints,
      xMin: minX,
      xMax: maxX,
      yMin: minY,
      yMax: maxY
    };
  }, [modelsToPlot, xAxisKey, yAxisKey, xMetric, yMetric, systemPromptTargetModels]);

  // Tick generator for gridlines and labels
  const xTicks = useMemo(() => {
    const count = 5;
    const step = (xMax - xMin) / count;
    return Array.from({ length: count + 1 }, (_, i) => xMin + i * step);
  }, [xMin, xMax]);

  const yTicks = useMemo(() => {
    const count = 5;
    const step = (yMax - yMin) / count;
    return Array.from({ length: count + 1 }, (_, i) => yMin + i * step);
  }, [yMin, yMax]);

  const handlePointMouseEnter = (pt: PlotPoint, e: React.MouseEvent) => {
    setHoveredPoint(pt);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handlePointMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current && hoveredPoint) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(Number((prev * zoomFactor).toFixed(2)), 1), 6);
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panStartRef.current = { ...panOffset };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handlePointMouseMove(e);
    if (isDragging && zoomLevel > 1) {
      const dx = (e.clientX - dragStartRef.current.x) / zoomLevel;
      const dy = (e.clientY - dragStartRef.current.y) / zoomLevel;
      setPanOffset({
        x: panStartRef.current.x - dx,
        y: panStartRef.current.y - dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      data-testid="model-xy-graph-container"
      className="relative bg-white dark:bg-[#111622] rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden font-sans transition-colors duration-200"
    >
      {/* Top Header & Metric Pickers */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Model Capability & Benchmark XY Graph</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                {points.length} {points.length === 1 ? 'model' : 'models'}
              </span>
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Compare latency vs speed and inspect model architecture, token capacity, and capabilities on mouseover.
          </p>
        </div>

        {/* Axis Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* X Axis Control */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#161c28] px-2.5 py-1.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-gray-500">X-Axis:</span>
            <select
              value={xAxisKey}
              onChange={(e) => setXAxisKey(e.target.value as MetricKey)}
              data-testid="xy-graph-x-axis-select"
              aria-label="Select X axis metric"
              className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {Object.values(METRIC_OPTIONS).map((opt) => (
                <option key={opt.key} value={opt.key} className="dark:bg-[#111622] text-gray-900 dark:text-gray-100">
                  {opt.label} ({opt.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Y Axis Control */}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#161c28] px-2.5 py-1.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-gray-500">Y-Axis:</span>
            <select
              value={yAxisKey}
              onChange={(e) => setYAxisKey(e.target.value as MetricKey)}
              data-testid="xy-graph-y-axis-select"
              aria-label="Select Y axis metric"
              className="bg-transparent text-gray-800 dark:text-gray-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {Object.values(METRIC_OPTIONS).map((opt) => (
                <option key={opt.key} value={opt.key} className="dark:bg-[#111622] text-gray-900 dark:text-gray-100">
                  {opt.label} ({opt.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Zoom Controls for Tight Results */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#161c28] p-1 rounded-xl border border-gray-200/70 dark:border-gray-700/70">
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-gray-500 px-1">Zoom:</span>
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              data-testid="xy-graph-zoom-out-btn"
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            </button>
            <span 
              data-testid="xy-graph-zoom-level"
              className="text-[11px] font-mono font-bold px-1.5 text-indigo-600 dark:text-indigo-400 min-w-[38px] text-center"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 6}
              data-testid="xy-graph-zoom-in-btn"
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors cursor-pointer"
              title="Zoom in (tight results)"
            >
              <ZoomIn className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                data-testid="xy-graph-reset-zoom-btn"
                className="px-1.5 py-0.5 text-[10px] font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                title="Reset zoom to 100%"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas with Zoom & Pan */}
      <div 
        className={`p-4 sm:p-6 overflow-x-auto select-none relative ${zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredPoint(null);
          setIsDragging(false);
        }}
      >
        <svg
          viewBox={`${viewBoxX} ${viewBoxY} ${viewWidth} ${viewHeight}`}
          className="w-full h-auto min-w-[620px] max-h-[460px] overflow-visible transition-all duration-75"
        >
          {/* Subtle Optimal Quadrant Highlight (Low Latency / High Speed) */}
          {xAxisKey === 'durationMs' && yAxisKey === 'tps' && (
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth / 2}
              height={plotHeight / 2}
              fill="currentColor"
              className="text-emerald-500/5 dark:text-emerald-400/5"
              rx={12}
            />
          )}

          {/* Y-Axis Horizontal Gridlines and Ticks */}
          {yTicks.map((val, idx) => {
            const yRatio = (val - yMin) / (yMax - yMin || 1);
            const y = padding.top + (1 - yRatio) * plotHeight;
            return (
              <g key={`y-grid-${idx}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-gray-200 dark:text-gray-800"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-gray-400 dark:fill-gray-500 font-medium"
                >
                  {yMetric.format(val)}
                </text>
              </g>
            );
          })}

          {/* X-Axis Vertical Gridlines and Ticks */}
          {xTicks.map((val, idx) => {
            const xRatio = (val - xMin) / (xMax - xMin || 1);
            const x = padding.left + xRatio * plotWidth;
            return (
              <g key={`x-grid-${idx}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={svgHeight - padding.bottom}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-gray-200 dark:text-gray-800"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={svgHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-gray-400 dark:fill-gray-500 font-medium"
                >
                  {xMetric.format(val)}
                </text>
              </g>
            );
          })}

          {/* Solid Axis Lines */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth="1.5"
          />

          {/* X-Axis Main Label */}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 12}
            textAnchor="middle"
            className="text-xs font-bold fill-gray-600 dark:fill-gray-300 tracking-wide"
          >
            {xMetric.label} ({xMetric.unit}) →
          </text>

          {/* Y-Axis Main Label (Rotated) */}
          <text
            x={-(padding.top + plotHeight / 2)}
            y={18}
            transform="rotate(-90)"
            textAnchor="middle"
            className="text-xs font-bold fill-gray-600 dark:fill-gray-300 tracking-wide"
          >
            ↑ {yMetric.label} ({yMetric.unit})
          </text>

          {/* Model Plot Nodes */}
          {points.map((pt) => {
            const isHovered = hoveredPoint?.id === pt.id;
            const isSelected = selectedId === pt.id;

            // Determine node color by status
            let fillColor = "#10B981"; // Success Emerald
            let strokeColor = "#059669";
            let glowClass = "shadow-emerald-500/30";

            if (pt.status === "error") {
              fillColor = "#F43F5E"; // Rose
              strokeColor = "#E11D48";
              glowClass = "shadow-rose-500/30";
            } else if (pt.status === "pending") {
              fillColor = "#F59E0B"; // Amber
              strokeColor = "#D97706";
              glowClass = "shadow-amber-500/30";
            } else if (pt.status === "idle") {
              fillColor = "#6366F1"; // Indigo
              strokeColor = "#4F46E5";
              glowClass = "shadow-indigo-500/30";
            }

            return (
              <g
                key={pt.id}
                className="cursor-pointer transition-all duration-150 group"
                onClick={() => onSelectResult?.(pt.id)}
                onMouseEnter={(e) => handlePointMouseEnter(pt, e)}
                data-testid={`xy-node-${pt.modelName}`}
              >
                {/* System Prompt Injected Halo Ring */}
                {pt.hasInjectedSystemPrompt && (
                  <circle
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r={isHovered ? 20 : 15}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="animate-spin-slow opacity-80"
                  />
                )}

                {/* Outer Glow / Pulse on hover or selected */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={pt.svgX}
                    cy={pt.svgY}
                    r={isHovered ? 17 : 13}
                    fill={fillColor}
                    fillOpacity="0.25"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Point */}
                <circle
                  cx={pt.svgX}
                  cy={pt.svgY}
                  r={isHovered ? 8 : (isSelected ? 7 : 5.5)}
                  fill={fillColor}
                  stroke={isSelected ? "#FFFFFF" : strokeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="filter drop-shadow-sm transition-transform duration-150"
                />

                {/* Model Name Label pill next to point */}
                <text
                  x={pt.svgX + 10}
                  y={pt.svgY + 4}
                  className={`text-[11px] font-bold select-none transition-all duration-150 ${
                    isHovered || isSelected
                      ? "fill-indigo-600 dark:fill-indigo-400 font-extrabold text-[12px]"
                      : "fill-gray-700 dark:fill-gray-300"
                  }`}
                >
                  {pt.modelName}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Mouseover Capabilities Card (Tooltip) */}
        {hoveredPoint && tooltipPos && (
          <div
            data-testid="xy-graph-tooltip"
            style={{
              left: Math.min(tooltipPos.x + 18, (containerRef.current?.clientWidth || 700) - 340),
              top: Math.max(10, Math.min(tooltipPos.y - 120, (containerRef.current?.clientHeight || 450) - 320)),
            }}
            className="absolute z-30 w-80 bg-white/95 dark:bg-[#161c28]/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/80 p-4 pointer-events-none transition-opacity duration-150 animate-in fade-in zoom-in-95"
          >
            {/* Header: Model Name & Status */}
            <div className="flex items-start justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2.5 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                    {hoveredPoint.capabilities.name}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Provider: <strong className="text-gray-700 dark:text-gray-300">{hoveredPoint.capabilities.provider}</strong>
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  hoveredPoint.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : hoveredPoint.status === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : hoveredPoint.status === 'pending'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {hoveredPoint.status === 'success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                {hoveredPoint.status === 'error' && <XCircle className="w-2.5 h-2.5" />}
                {hoveredPoint.status === 'pending' && <RotateCw className="w-2.5 h-2.5 animate-spin" />}
                {hoveredPoint.status}
              </span>
            </div>

            {/* Main Model Capabilities Info Box */}
            <div className="space-y-2 text-xs">
              {/* Context Window & Architecture */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#0f131c] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                    Context Window
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    {hoveredPoint.capabilities.contextWindowFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">
                    Parameters / Type
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-500" />
                    {hoveredPoint.capabilities.parameterSize || 'Standard'}
                  </span>
                </div>
              </div>

              {/* Modalities Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Modalities:
                </span>
                {hoveredPoint.capabilities.modalities.map((m) => (
                  <span
                    key={m}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    {m}
                  </span>
                ))}
                {hoveredPoint.capabilities.functionCalling && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Tool Use / Functions
                  </span>
                )}
              </div>

              {/* Strengths & Description */}
              {hoveredPoint.capabilities.strengths && hoveredPoint.capabilities.strengths.length > 0 && (
                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Key Strengths: </span>
                  {hoveredPoint.capabilities.strengths.join(", ")}
                </div>
              )}

              {/* Benchmark Result Performance */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 flex items-center justify-between">
                  <span>Current Benchmark Metrics</span>
                  {hoveredPoint.hasInjectedSystemPrompt ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      <Sparkles className="w-2.5 h-2.5" /> System Prompt Active
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400">Default Prompt</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0f131c] px-2 py-1 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {hoveredPoint.result?.metrics?.durationMs 
                        ? `${(hoveredPoint.result.metrics.durationMs / 1000).toFixed(2)}s` 
                        : (hoveredPoint.status === 'idle' ? 'Not run' : '-')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0f131c] px-2 py-1 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {hoveredPoint.result?.metrics?.tokensPerSecond 
                        ? `${hoveredPoint.result.metrics.tokensPerSecond.toFixed(1)} t/s` 
                        : '-'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0f131c] px-2 py-1 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">Tokens:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {hoveredPoint.result?.metrics?.completionTokens 
                        ? `${hoveredPoint.result.metrics.completionTokens} out` 
                        : '-'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-[#0f131c] px-2 py-1 rounded-lg">
                    <span className="text-gray-500 dark:text-gray-400">TTFB:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {hoveredPoint.result?.metrics?.ttfbMs 
                        ? `${Math.round(hoveredPoint.result.metrics.ttfbMs)}ms` 
                        : '-'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer / Legend & Model Capabilities Quick Cards */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-[#0b0f17] border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs shadow-emerald-400 inline-block" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Error</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Configured / Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-dashed border-purple-500 inline-flex items-center justify-center text-[9px] text-purple-600 dark:text-purple-400 font-bold">
              ⚡
            </span>
            <span>Custom System Prompt Injected</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Hover over any model node for detailed specifications & architecture</span>
          </span>
          {zoomLevel > 1 ? (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
              <Move className="w-3 h-3" /> Drag chart to pan across tight points • Scroll to zoom
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-[10px]">
              (Use Zoom controls or scroll wheel if results are tight)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default ModelXYGraph;
