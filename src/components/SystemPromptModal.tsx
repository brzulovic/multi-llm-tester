/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Check, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  FileText 
} from "lucide-react";

export interface SystemPromptPreset {
  label: string;
  description: string;
  text: string;
}

export const SYSTEM_PROMPT_PRESETS: SystemPromptPreset[] = [
  {
    label: "Concise Expert",
    description: "Direct, factual, zero-fluff expert responses",
    text: "You are an expert AI assistant. Provide concise, direct, and factual answers without fluff."
  },
  {
    label: "Deep Analyst",
    description: "Step-by-step reasoning, edge cases, in-depth evaluation",
    text: "You are a meticulous technical analyst. Provide step-by-step reasoning, edge-case evaluation, and in-depth analysis."
  },
  {
    label: "Code Architect",
    description: "Optimal, clean, well-commented architectural code",
    text: "You are a senior software architect. Output clean, optimal, well-commented code strictly conforming to best practices."
  }
];

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customSystemPrompt: string;
  setCustomSystemPrompt: (val: string) => void;
  enableSystemPrompt: boolean;
  setEnableSystemPrompt: (val: boolean) => void;
  systemPromptMode: 'all' | 'specific';
  setSystemPromptMode: (val: 'all' | 'specific') => void;
  systemPromptTargetModels: string[];
  setSystemPromptTargetModels: (val: string[] | ((prev: string[]) => string[])) => void;
  configuredModels: string[];
  toggleSystemPromptModel: (modelName: string) => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  customSystemPrompt,
  setCustomSystemPrompt,
  enableSystemPrompt,
  setEnableSystemPrompt,
  systemPromptMode,
  setSystemPromptMode,
  systemPromptTargetModels,
  setSystemPromptTargetModels,
  configuredModels,
  toggleSystemPromptModel,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="system-prompt-layer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-prompt-layer-title"
    >
      <div 
        className="bg-white dark:bg-[#111622] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Layer Header */}
        <div className="px-5 py-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="system-prompt-layer-title" className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Custom System Prompt Layer
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  enableSystemPrompt 
                    ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {enableSystemPrompt ? 'Enabled' : 'Disabled'}
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure system directives and selectively inject into benchmarking payloads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Toggle switch inside layer */}
            <button
              type="button"
              role="switch"
              aria-checked={enableSystemPrompt}
              onClick={() => setEnableSystemPrompt(!enableSystemPrompt)}
              data-testid="layer-enable-system-prompt-switch"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableSystemPrompt ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              title={enableSystemPrompt ? 'Disable System Prompt' : 'Enable System Prompt'}
            >
              <span className="sr-only">Toggle System Prompt</span>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enableSystemPrompt ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={onClose}
              data-testid="close-system-prompt-layer-btn"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Close layer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layer Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-sm">
          {/* Presets Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Presets:
              </span>
              <span className="text-[11px] text-gray-400">Click to apply template</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SYSTEM_PROMPT_PRESETS.map((preset) => {
                const isActive = customSystemPrompt.trim() === preset.text.trim();
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setCustomSystemPrompt(preset.text);
                      setEnableSystemPrompt(true);
                    }}
                    data-testid={`preset-btn-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700 ring-1 ring-purple-400 dark:ring-purple-600 shadow-2xs' 
                        : 'bg-gray-50/70 dark:bg-[#161c28] border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">
                        {preset.label}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Directive Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="layer-custom-system-prompt-textarea" className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                System Directive Content
              </label>
              {customSystemPrompt && (
                <button
                  type="button"
                  onClick={() => setCustomSystemPrompt("")}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>
            <textarea
              id="layer-custom-system-prompt-textarea"
              data-testid="layer-system-prompt-textarea"
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder="You are a meticulous technical analyst. Provide step-by-step reasoning, edge-case evaluation, and in-depth analysis."
              rows={4}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm font-mono leading-relaxed focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Prepends a <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-purple-600 dark:text-purple-400">&#123;&quot;role&quot;: &quot;system&quot;, &quot;content&quot;: &quot;...&quot;&#125;</code> message to the request payload.
            </p>
          </div>

          {/* Target Models for Injection */}
          <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Target Models for Injection
                </label>
                <p className="text-[11px] text-gray-400">
                  Select whether all models or only specific models receive the directive
                </p>
              </div>

              {/* Mode Toggle Buttons: Specific Models vs All Models */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSystemPromptMode('specific')}
                  data-testid="layer-system-prompt-mode-specific"
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    systemPromptMode === 'specific'
                      ? 'bg-white dark:bg-[#111622] text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Specific Models
                </button>
                <button
                  type="button"
                  onClick={() => setSystemPromptMode('all')}
                  data-testid="layer-system-prompt-mode-all"
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    systemPromptMode === 'all'
                      ? 'bg-white dark:bg-[#111622] text-purple-700 dark:text-purple-300 shadow-xs font-bold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  All Models
                </button>
              </div>
            </div>

            {systemPromptMode === 'specific' ? (
              <div className="space-y-2.5 bg-gray-50/70 dark:bg-[#0b0f17] p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Click models to toggle system prompt injection:
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSystemPromptTargetModels([...configuredModels])}
                      className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <button
                      type="button"
                      onClick={() => setSystemPromptTargetModels([])}
                      className="text-gray-500 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white dark:bg-[#161c28] rounded-xl border border-gray-200 dark:border-gray-700">
                  {configuredModels.length === 0 ? (
                    <span className="text-xs text-gray-400 py-2 px-1">
                      No models found in the model list. Add models in the Model List configuration.
                    </span>
                  ) : (
                    configuredModels.map((modelName) => {
                      const isTargeted = systemPromptTargetModels.some(
                        tm => tm.toLowerCase() === modelName.toLowerCase()
                      );
                      return (
                        <button
                          key={modelName}
                          type="button"
                          onClick={() => toggleSystemPromptModel(modelName)}
                          data-testid={`layer-system-prompt-chip-${modelName}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isTargeted
                              ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-300 shadow-2xs font-bold'
                              : 'bg-gray-50 dark:bg-[#111622] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isTargeted ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <span className="font-mono">{modelName}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Selected: <strong>{systemPromptTargetModels.length}</strong> of {configuredModels.length} models
                  </span>
                  {systemPromptTargetModels.length === 0 && (
                    <span className="text-amber-600 dark:text-amber-400 text-[11px]">
                      ⚠️ No models selected. The prompt will not be injected.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="leading-relaxed">
                  System prompt will be injected into payloads for <strong>all {configuredModels.length} models</strong> during benchmarking.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Layer Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-[#0d121c]/80 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {enableSystemPrompt ? (
              <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {systemPromptMode === 'all' 
                  ? `Active for all ${configuredModels.length} models` 
                  : `Active for ${systemPromptTargetModels.length} selected model(s)`}
              </span>
            ) : (
              <span>Prompt is currently disabled</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                if (customSystemPrompt.trim().length > 0) {
                  setEnableSystemPrompt(true);
                }
                onClose();
              }}
              data-testid="layer-apply-btn"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 active:scale-95 text-white transition-all shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
