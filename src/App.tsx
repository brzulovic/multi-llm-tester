/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Settings, 
  Layers, 
  Zap, 
  Clock, 
  Hash, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Cpu,
  RefreshCw,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  List,
  History,
  Download,
  Upload,
  Calendar,
  ChevronRight,
  Activity,
  BarChart2,
  LayoutGrid,
  Maximize2,
  CheckSquare,
  Square,
  Shuffle,
  PanelLeftClose,
  PanelLeftOpen,
  UploadCloud,
  FileJson,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Sun,
  Moon,
  Database,
  GitCompare,
  Sparkles,
  FileSpreadsheet,
  ArrowDownAZ,
  ArrowUpAZ,
  Coffee,
  Leaf,
  BookOpen,
  Check,
  Server,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ModelResult, HistoryEntry } from "./types";
import { NetworkWaterfallPanel } from "./components/NetworkWaterfallPanel";
import { DevToolsTimingDetail } from "./components/DevToolsTimingDetail";
import { SupabaseConfigModal } from "./components/SupabaseConfigModal";
import { ModelComparisonView } from "./components/ModelComparisonView";
import { COMMON_TEST_PROMPTS, NERDY_KINGS_PROMPTS, CLASSIC_TEST_PROMPTS } from "./data/prompts";
import { convertHistoryToCSV, downloadCSV } from "./lib/csvExport";
import {
  buildApiUrl,
  parseApiUrl,
  ENDPOINT_TYPES,
  DEFAULT_API_PRESETS,
  ApiPreset
} from "./lib/apiUrl";
import { 
  insertBenchmarkRunToSupabase, 
  getSupabaseConfig, 
  isSupabaseConfigured 
} from "./lib/supabase";

export type ThemeMode = 'light' | 'dark' | 'sepia-light' | 'sepia-dark' | 'sepia-green';

export const THEME_OPTIONS: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'sepia-light', label: 'Sepia Light', icon: BookOpen },
  { id: 'sepia-dark', label: 'Sepia Dark', icon: Coffee },
  { id: 'sepia-green', label: 'Greenish Sepia', icon: Leaf },
];

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("llm_tester_theme") as ThemeMode | null;
      if (saved && ['light', 'dark', 'sepia-light', 'sepia-dark', 'sepia-green'].includes(saved)) {
        return saved;
      }
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-light", "theme-dark", "theme-sepia-light", "theme-sepia-dark", "theme-sepia-green");
    root.classList.add(`theme-${theme}`);
    if (theme === "dark" || theme === "sepia-dark") {
      root.classList.add("dark");
    }
    try {
      localStorage.setItem("llm_tester_theme", theme);
    } catch {}
  }, [theme]);

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isThemeMenuOpen]);

  const toggleTheme = () => {
    const currentIndex = THEME_OPTIONS.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    setTheme(THEME_OPTIONS[nextIndex].id);
  };

  const [proxyBaseUrl, setProxyBaseUrl] = useState<string>(() => {
    return localStorage.getItem("benchmark_proxy_base_url") || "http://localhost:4100/";
  });
  const [endpointType, setEndpointType] = useState<string>(() => {
    return localStorage.getItem("benchmark_endpoint_type") || "/v1/chat/completions";
  });
  const [customEndpointPath, setCustomEndpointPath] = useState<string>("");
  const [apiPresets, setApiPresets] = useState<ApiPreset[]>(() => {
    try {
      const saved = localStorage.getItem("benchmark_api_presets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load saved API presets", e);
    }
    return DEFAULT_API_PRESETS;
  });
  const [showAddApiModal, setShowAddApiModal] = useState<boolean>(false);
  const [newApiName, setNewApiName] = useState<string>("");
  const [newApiUrl, setNewApiUrl] = useState<string>("");
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);

  const endpoint = buildApiUrl(proxyBaseUrl, endpointType, customEndpointPath);

  const setEndpoint = (newFullUrl: string) => {
    if (!newFullUrl) return;
    const parsed = parseApiUrl(newFullUrl);
    setProxyBaseUrl(parsed.baseUrl);
    setEndpointType(parsed.endpointType);
    if (parsed.customPath) {
      setCustomEndpointPath(parsed.customPath);
    } else {
      setCustomEndpointPath("");
    }
    try {
      localStorage.setItem("benchmark_proxy_base_url", parsed.baseUrl);
      localStorage.setItem("benchmark_endpoint_type", parsed.endpointType);
    } catch (_) {}
  };

  const handleProxyBaseUrlChange = (newUrl: string) => {
    setProxyBaseUrl(newUrl);
    try {
      localStorage.setItem("benchmark_proxy_base_url", newUrl);
    } catch (_) {}
  };

  const handleEndpointTypeChange = (newType: string) => {
    setEndpointType(newType);
    try {
      localStorage.setItem("benchmark_endpoint_type", newType);
    } catch (_) {}
  };

  const selectApiPreset = (preset: ApiPreset) => {
    setProxyBaseUrl(preset.baseUrl);
    try {
      localStorage.setItem("benchmark_proxy_base_url", preset.baseUrl);
    } catch (_) {}
  };

  const handleAddApiPreset = () => {
    if (!newApiUrl.trim()) return;
    const trimmedUrl = newApiUrl.trim();
    const formattedUrl = trimmedUrl.endsWith('/') ? trimmedUrl : `${trimmedUrl}/`;
    const name = newApiName.trim() || formattedUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const newPreset: ApiPreset = {
      id: `custom-${Date.now()}`,
      name,
      baseUrl: formattedUrl,
      isCustom: true
    };
    const updated = [...apiPresets, newPreset];
    setApiPresets(updated);
    try {
      localStorage.setItem("benchmark_api_presets", JSON.stringify(updated));
      localStorage.setItem("benchmark_proxy_base_url", formattedUrl);
    } catch (_) {}
    setProxyBaseUrl(formattedUrl);
    setNewApiName("");
    setNewApiUrl("");
    setShowAddApiModal(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = apiPresets.filter(p => p.id !== id);
    setApiPresets(updated);
    try {
      localStorage.setItem("benchmark_api_presets", JSON.stringify(updated));
    } catch (_) {}
  };

  const copyCombinedEndpoint = () => {
    navigator.clipboard?.writeText(endpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };
  const [customHeaders, setCustomHeaders] = useState("x-litellm-api-key: Bearer sk-1234");
  const [showEndpointField, setShowEndpointField] = useState<boolean>(true);
  const [showCustomHeadersField, setShowCustomHeadersField] = useState<boolean>(true);
  const [modelList, setModelList] = useState("free");
  const [prompt, setPrompt] = useState("Describe all your capabilities, including your name and a detailed description of your model architecture and features.");
  const [isParallel, setIsParallel] = useState(false);
  const [parallelCount, setParallelCount] = useState(2);
  const [results, setResults] = useState<ModelResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "waterfall" | "cards" | "compare">("split");
  const [comparisonModelAId, setComparisonModelAId] = useState<string | undefined>();
  const [comparisonModelBId, setComparisonModelBId] = useState<string | undefined>();
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(300); // Default 300s (5m) to allow 50s+ local models
  const [streamResponse, setStreamResponse] = useState<boolean>(true); // Streams SSE tokens to prevent idle timeout
  const [showLeftColumn, setShowLeftColumn] = useState<boolean>(true);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const historyFileInputRef = useRef<HTMLInputElement>(null);
  const sessionStartTimeRef = useRef<number>(0);

  // Supabase Database Integration state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<{
    status: 'idle' | 'syncing' | 'synced' | 'error';
    message?: string;
    runId?: string;
  } | null>(null);
  const lastInsertedRunIdRef = useRef<string | null>(null);

  type SidebarTab = "config" | "prompt" | "history" | "all";
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("config");

  const [collapsed, setCollapsed] = useState({
    config: false,
    prompt: false,
    history: true
  });

  const configSectionRef = useRef<HTMLDivElement>(null);
  const promptSectionRef = useRef<HTMLDivElement>(null);
  const historySectionRef = useRef<HTMLDivElement>(null);

  const goToSection = (tab: SidebarTab) => {
    setSidebarTab(tab);
    if (!showLeftColumn) {
      setShowLeftColumn(true);
    }

    if (tab === "config") {
      setCollapsed(prev => ({ ...prev, config: false }));
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", "#section-config");
      }
      setTimeout(() => {
        if (configSectionRef.current?.scrollIntoView) {
          configSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    } else if (tab === "prompt") {
      setCollapsed(prev => ({ ...prev, prompt: false }));
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", "#section-prompt");
      }
      setTimeout(() => {
        if (promptSectionRef.current?.scrollIntoView) {
          promptSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    } else if (tab === "history") {
      setCollapsed(prev => ({ ...prev, history: false }));
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", "#section-history");
      }
      setTimeout(() => {
        if (historySectionRef.current?.scrollIntoView) {
          historySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    } else if (tab === "all") {
      setCollapsed({ config: false, prompt: false, history: false });
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", "#section-config");
      }
      setTimeout(() => {
        if (configSectionRef.current?.scrollIntoView) {
          configSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  const switchSidebarTab = goToSection;

  useEffect(() => {
    if (!showLeftColumn || typeof IntersectionObserver === "undefined") return;

    const sections = [
      { id: "section-config", tab: "config" as SidebarTab },
      { id: "section-prompt", tab: "prompt" as SidebarTab },
      { id: "section-history", tab: "history" as SidebarTab },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          const match = sections.find((s) => s.id === visible.target.id);
          if (match && sidebarTab !== "all") {
            setSidebarTab(match.tab);
          }
        }
      },
      { threshold: 0.25 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [showLeftColumn, sidebarTab]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("llm_tester_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("llm_tester_history", JSON.stringify(history));
  }, [history]);

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchModels = async () => {
    setIsFetchingModels(true);
    try {
      // Derive models endpoint from proxy base URL or chat completions endpoint
      const modelsUrl = buildApiUrl(proxyBaseUrl, "/v1/models") || endpoint.replace(/chat\/completions\/?$/, "models");
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (customHeaders.trim()) {
        customHeaders.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(":").trim();
          }
        });
      }

      const response = await fetch(modelsUrl, { headers });
      if (!response.ok) throw new Error(`Failed to fetch models: ${response.status}`);
      
      const data = await response.json();
      // OpenAI format is { data: [{ id: "model-id", ... }, ...] }
      const models = (data.data || []).map((m: any) => m.id).sort();
      setAvailableModels(models);
      setShowModelSelector(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to fetch models");
    } finally {
      setIsFetchingModels(false);
    }
  };

  const toggleModel = (model: string) => {
    const currentModels = modelList.split("\n").map(m => m.trim()).filter(Boolean);
    if (currentModels.includes(model)) {
      setModelList(currentModels.filter(m => m !== model).join("\n"));
    } else {
      setModelList(currentModels.length > 0 ? `${currentModels.join("\n")}\n${model}` : model);
    }
  };

  const addModel = toggleModel;

  const selectAllModels = () => {
    const currentSet = new Set(modelList.split("\n").map(m => m.trim()).filter(Boolean));
    const matching = availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));
    matching.forEach(m => currentSet.add(m));
    setModelList(Array.from(currentSet).join("\n"));
  };

  const unselectAllModels = () => {
    const matching = new Set(
      availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
    );
    const currentModels = modelList.split("\n").map(m => m.trim()).filter(Boolean);
    const remaining = currentModels.filter(m => !matching.has(m));
    setModelList(remaining.join("\n"));
  };

  const [modelSortOrder, setModelSortOrder] = useState<'none' | 'asc' | 'desc' | 'random'>('none');

  const sortModelList = (direction: 'asc' | 'desc') => {
    const models = modelList.split("\n").map(m => m.trim()).filter(Boolean);
    if (models.length <= 1) return;
    const sorted = [...models].sort((a, b) => {
      const cmp = a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
      return direction === 'asc' ? cmp : -cmp;
    });
    setModelSortOrder(direction);
    setModelList(sorted.join("\n"));
  };

  const shuffleModelList = () => {
    const models = modelList.split("\n").map(m => m.trim()).filter(Boolean);
    if (models.length <= 1) return;
    const shuffled = [...models];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // If it happens to be the exact same order and length > 1, reverse it
    if (shuffled.every((m, idx) => m === models[idx])) {
      shuffled.reverse();
    }
    setModelSortOrder('random');
    setModelList(shuffled.join("\n"));
  };

  const exportHistory = () => {
    // Export endpoint, customHeaders, and history sessions
    const exportBundle = {
      version: 1,
      endpoint,
      customHeaders,
      headers: customHeaders,
      exportedAt: new Date().toISOString(),
      history,
    };
    const dataStr = JSON.stringify(exportBundle, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `llm-tester-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportHistoryToCSV = () => {
    // If no history and no finished current results, inform the user
    const hasCurrentResults = results.some(r => r.status === 'success' || r.status === 'error');
    if (history.length === 0 && !hasCurrentResults) {
      setImportStatus({
        type: 'error',
        message: 'No benchmark data available to export to CSV yet. Run a prompt test first!'
      });
      return;
    }

    const csvData = convertHistoryToCSV(history, {
      results,
      prompt,
      endpoint
    });

    if (!csvData) {
      setImportStatus({
        type: 'error',
        message: 'No benchmark records found to export to CSV.'
      });
      return;
    }

    downloadCSV(csvData);
    setImportStatus({
      type: 'success',
      message: `Exported benchmark data to CSV successfully! (${history.length > 0 ? history.length + ' history session(s)' : 'Current session'} exported)`
    });
  };

  const handleProcessImportedText = (text: string) => {
    try {
      const imported = JSON.parse(text);
      let replacedEndpoint = false;
      let replacedHeaders = false;

      const tryReplaceConfig = (sourceObj: any) => {
        if (sourceObj && typeof sourceObj === 'object') {
          if (typeof sourceObj.endpoint === 'string' && sourceObj.endpoint.trim()) {
            setEndpoint(sourceObj.endpoint.trim());
            setShowEndpointField(true);
            replacedEndpoint = true;
          }
          const headersVal = sourceObj.customHeaders ?? sourceObj.headers;
          if (typeof headersVal === 'string') {
            setCustomHeaders(headersVal);
            setShowCustomHeadersField(true);
            replacedHeaders = true;
          }
        }
      };

      if (Array.isArray(imported)) {
        if (imported.length === 0) {
          setImportStatus({ type: 'error', message: "The imported JSON array is empty." });
          return;
        }

        // If the first session item has endpoint / headers, replace with new values
        if (imported[0]?.endpoint || imported[0]?.customHeaders !== undefined || imported[0]?.headers !== undefined) {
          tryReplaceConfig(imported[0]);
        }

        if (imported[0].results || imported[0].prompt) {
          setHistory(prev => [...imported, ...prev].slice(0, 100));
          const replacedItems = [replacedEndpoint && "API endpoint", replacedHeaders && "headers"].filter(Boolean).join(" & ");
          setImportStatus({ 
            type: 'success', 
            message: `Imported ${imported.length} history session${imported.length === 1 ? '' : 's'}${replacedItems ? ` and replaced ${replacedItems} with new values!` : '!'}` 
          });
        } else if (imported[0].modelName) {
          // Array of ModelResult
          const newEntry: HistoryEntry = {
            id: `imported-${Date.now()}`,
            timestamp: Date.now(),
            prompt: prompt || "Imported benchmark results",
            endpoint,
            customHeaders,
            results: imported
          };
          setHistory(prev => [newEntry, ...prev].slice(0, 100));
          setImportStatus({ type: 'success', message: "Imported benchmark results as a new history session!" });
        } else {
          setHistory(prev => [...imported, ...prev].slice(0, 100));
          setImportStatus({ type: 'success', message: `Imported ${imported.length} items to history!` });
        }
      } else if (imported && typeof imported === 'object') {
        // Extract and replace endpoint and customHeaders from imported object
        tryReplaceConfig(imported);

        if (Array.isArray(imported.history)) {
          // Top-level exported bundle with endpoint, customHeaders, and history
          setHistory(prev => [...imported.history, ...prev].slice(0, 100));
          const replacedItems = [replacedEndpoint && "API endpoint", replacedHeaders && "headers"].filter(Boolean).join(" & ");
          setImportStatus({ 
            type: 'success', 
            message: `Imported ${imported.history.length} history session${imported.history.length === 1 ? '' : 's'}${replacedItems ? ` and replaced ${replacedItems} with new values!` : '!'}` 
          });
        } else if (imported.results || imported.prompt) {
          const entry: HistoryEntry = {
            id: imported.id || `imported-${Date.now()}`,
            timestamp: imported.timestamp || Date.now(),
            prompt: imported.prompt || "",
            endpoint: imported.endpoint || endpoint,
            customHeaders: imported.customHeaders ?? imported.headers ?? customHeaders,
            results: imported.results || []
          };
          setHistory(prev => [entry, ...prev].slice(0, 100));
          const replacedItems = [replacedEndpoint && "API endpoint", replacedHeaders && "headers"].filter(Boolean).join(" & ");
          setImportStatus({ 
            type: 'success', 
            message: `History session imported successfully${replacedItems ? ` (replaced ${replacedItems})` : ''}!` 
          });
        } else if (replacedEndpoint || replacedHeaders) {
          const replacedItems = [replacedEndpoint && "API endpoint", replacedHeaders && "headers"].filter(Boolean).join(" & ");
          setImportStatus({ 
            type: 'success', 
            message: `Replaced ${replacedItems} with new imported values!` 
          });
        } else {
          throw new Error("Unrecognized JSON format. Expected history session data.");
        }
      } else {
        throw new Error("JSON root must be an array or object.");
      }
    } catch (err: any) {
      setImportStatus({ type: 'error', message: `Failed to import: ${err?.message || "Invalid JSON"}` });
    }
    setTimeout(() => {
      setImportStatus(null);
    }, 4500);
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleProcessImportedText(content);
    };
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: "Failed to read file from disk." });
    };
    reader.readAsText(file);
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setPrompt(entry.prompt);
    if (entry.endpoint) {
      setEndpoint(entry.endpoint);
      setShowEndpointField(true);
    }
    const headersVal = entry.customHeaders ?? entry.headers;
    if (typeof headersVal === "string") {
      setCustomHeaders(headersVal);
      setShowCustomHeadersField(true);
    }
    setResults(entry.results);
    goToSection("prompt");
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const generateResults = async () => {
    if (!prompt.trim() || !modelList.trim()) return;

    const models = modelList
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    if (models.length === 0) return;

    setIsGenerating(true);
    sessionStartTimeRef.current = performance.now();
    const initialResults: ModelResult[] = models.map((model, index) => ({
      id: `${model}-${index}-${Date.now()}`,
      modelName: model,
      status: "idle",
      output: "",
    }));

    setResults(initialResults);

    if (isParallel) {
      await runParallel(initialResults);
    } else {
      await runSequential(initialResults);
    }

    setIsGenerating(false);

    // Save to history after generation is complete
    // We need to get the latest results state, but since we're in an async function
    // that updates state multiple times, we'll use a functional update or a ref
    // For simplicity here, we'll capture the results after a short delay or 
    // better, use a separate effect to detect completion.
  };

  // Effect to save to history when generation finishes
  useEffect(() => {
    if (!isGenerating && results.length > 0 && results.some(r => r.status === 'success' || r.status === 'error')) {
      const newEntry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        prompt,
        endpoint,
        customHeaders,
        headers: customHeaders,
        results: [...results]
      };
      
      setHistory(prev => {
        // Prevent duplicate entries if the results haven't changed (e.g. from a re-render)
        if (prev.length > 0 && prev[0].prompt === newEntry.prompt && JSON.stringify(prev[0].results) === JSON.stringify(newEntry.results)) {
          return prev;
        }
        return [newEntry, ...prev].slice(0, 50); // Keep last 50 entries
      });

      // After each run, insert all the results to Supabase if configured and autoSync is enabled
      if (lastInsertedRunIdRef.current !== newEntry.id) {
        lastInsertedRunIdRef.current = newEntry.id;
        const supabaseConfig = getSupabaseConfig();

        if (supabaseConfig.autoSync && supabaseConfig.url && supabaseConfig.anonKey) {
          setSupabaseSyncStatus({ status: 'syncing', runId: newEntry.id });
          insertBenchmarkRunToSupabase(newEntry, { isParallel, parallelCount })
            .then((res) => {
              if (res.success) {
                setSupabaseSyncStatus({
                  status: 'synced',
                  message: `Saved ${res.insertedCount} results to Supabase`,
                  runId: newEntry.id
                });
              } else {
                setSupabaseSyncStatus({
                  status: 'error',
                  message: res.error || 'Failed to insert into Supabase',
                  runId: newEntry.id
                });
              }
            })
            .catch((err) => {
              setSupabaseSyncStatus({
                status: 'error',
                message: err?.message || 'Error inserting into Supabase',
                runId: newEntry.id
              });
            });
        }
      }
    }
  }, [isGenerating]);

  const runSequential = async (initialResults: ModelResult[]) => {
    for (let i = 0; i < initialResults.length; i++) {
      await processModel(initialResults[i].id, initialResults[i].modelName);
    }
  };

  const runParallel = async (initialResults: ModelResult[]) => {
    const queue = [...initialResults];
    const active = new Set<string>();
    const limit = Math.max(1, parallelCount);

    return new Promise<void>((resolve) => {
      const next = async () => {
        if (queue.length === 0 && active.size === 0) {
          resolve();
          return;
        }

        while (queue.length > 0 && active.size < limit) {
          const item = queue.shift()!;
          active.add(item.id);
          
          processModel(item.id, item.modelName).finally(() => {
            active.delete(item.id);
            next();
          });
        }
      };
      next();
    });
  };

  const processModel = async (id: string, modelName: string) => {
    const queueMs = sessionStartTimeRef.current > 0 
      ? Math.max(0, performance.now() - sessionStartTimeRef.current) 
      : 0;

    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "pending", startTimeOffsetMs: queueMs } : r))
    );

    const fetchStartTime = performance.now();
    let statusCode = 200;
    let statusText = "OK";
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => {
      controller.abort(new Error(`Client request timed out after ${timeoutSeconds}s`));
    }, timeoutSeconds * 1000);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Request-Timeout": String(timeoutSeconds),
        "Request-Timeout": String(timeoutSeconds),
      };

      if (customHeaders.trim()) {
        customHeaders.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(":").trim();
          }
        });
      }

      const bodyPayload: Record<string, any> = {
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        stream: streamResponse,
        timeout: timeoutSeconds,
        request_timeout: timeoutSeconds,
      };

      if (streamResponse) {
        bodyPayload.stream_options = { include_usage: true };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      statusCode = response.status;
      statusText = response.statusText || (response.ok ? "OK" : "Error");
      const ttfbEnd = performance.now();
      const ttfbMs = Math.max(1, ttfbEnd - fetchStartTime);

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        let rawDetails = "";
        try {
          const errorText = await response.text();
          rawDetails = errorText;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.error?.message) {
              errorMsg = parsed.error.message;
            } else if (parsed.message) {
              errorMsg = parsed.message;
            } else if (typeof parsed.error === "string") {
              errorMsg = parsed.error;
            } else if (parsed.detail) {
              errorMsg = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
            }
          } catch {
            if (errorText.trim()) {
              errorMsg = errorText.slice(0, 400);
            }
          }
        } catch {}

        const durationMs = performance.now() - fetchStartTime;
        const isTimeout = 
          response.status === 504 ||
          (response.status === 500 && (
            durationMs >= 45000 ||
            errorMsg.toLowerCase().includes("timeout") ||
            rawDetails.toLowerCase().includes("timeout")
          ));

        const customError: any = new Error(errorMsg);
        customError.isTimeout = isTimeout;
        customError.statusCode = response.status;
        customError.statusText = response.statusText;
        customError.rawDetails = rawDetails;
        throw customError;
      }

      const contentType = response.headers?.get?.("content-type") || "";
      const isSSE = streamResponse && contentType.includes("text/event-stream") && response.body;

      if (isSSE && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedOutput = "";
        let promptTokens = 0;
        let completionTokens = 0;
        let totalTokens = 0;
        let firstTokenReceived = false;
        let firstTokenTtfbMs = ttfbMs;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          if (!firstTokenReceived) {
            firstTokenReceived = true;
            firstTokenTtfbMs = Math.max(1, performance.now() - fetchStartTime);
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.replace(/^data:\s*/, "");
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || "";
              if (delta) {
                accumulatedOutput += delta;
              }
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens || promptTokens;
                completionTokens = parsed.usage.completion_tokens || completionTokens;
                totalTokens = parsed.usage.total_tokens || totalTokens;
              }
            } catch {}
          }

          // Real-time progress update
          const currentDuration = performance.now() - fetchStartTime;
          const currentCompTokens = completionTokens || Math.max(1, Math.round(accumulatedOutput.length / 4));
          const currentTps = currentCompTokens > 0 ? (currentCompTokens / (currentDuration / 1000)) : 0;

          setResults((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    output: accumulatedOutput,
                    metrics: {
                      promptTokens: promptTokens || Math.round(prompt.length / 4),
                      completionTokens: currentCompTokens,
                      totalTokens: (promptTokens || Math.round(prompt.length / 4)) + currentCompTokens,
                      durationMs: currentDuration,
                      tokensPerSecond: currentTps,
                      ttfbMs: firstTokenTtfbMs,
                      downloadMs: Math.max(1, currentDuration - firstTokenTtfbMs),
                      queueMs,
                      requestSentMs: Math.min(2, Math.round(firstTokenTtfbMs * 0.05)),
                    },
                  }
                : r
            )
          );
        }

        const downloadEnd = performance.now();
        const durationMs = downloadEnd - fetchStartTime;
        const finalPromptTokens = promptTokens || Math.max(1, Math.round(prompt.length / 4));
        const finalCompletionTokens = completionTokens || Math.max(1, Math.round(accumulatedOutput.length / 4));
        const finalTotalTokens = totalTokens || (finalPromptTokens + finalCompletionTokens);
        const tokensPerSecond = finalCompletionTokens > 0 ? (finalCompletionTokens / (durationMs / 1000)) : 0;
        const downloadMs = Math.max(1, durationMs - firstTokenTtfbMs);

        setResults((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "success",
                  statusCode,
                  statusText,
                  startTimeOffsetMs: queueMs,
                  output: accumulatedOutput || "No output received",
                  metrics: {
                    promptTokens: finalPromptTokens,
                    completionTokens: finalCompletionTokens,
                    totalTokens: finalTotalTokens,
                    durationMs,
                    tokensPerSecond,
                    ttfbMs: firstTokenTtfbMs,
                    downloadMs,
                    queueMs,
                    requestSentMs: Math.min(2, Math.round(firstTokenTtfbMs * 0.05)),
                  },
                }
              : r
          )
        );
      } else {
        // Standard JSON response
        const downloadStart = performance.now();
        const data = await response.json();
        const downloadEnd = performance.now();
        const downloadMs = Math.max(1, downloadEnd - downloadStart);
        const durationMs = downloadEnd - fetchStartTime;

        const output = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || "No output received";
        const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        
        const completionTokens = usage.completion_tokens || 0;
        const promptTokens = usage.prompt_tokens || 0;
        const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
        const tokensPerSecond = completionTokens > 0 ? (completionTokens / (durationMs / 1000)) : 0;

        setResults((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "success",
                  statusCode,
                  statusText,
                  startTimeOffsetMs: queueMs,
                  output,
                  metrics: {
                    promptTokens,
                    completionTokens,
                    totalTokens,
                    durationMs,
                    tokensPerSecond,
                    ttfbMs,
                    downloadMs,
                    queueMs,
                    requestSentMs: Math.min(2, Math.round(ttfbMs * 0.05)),
                  },
                }
              : r
          )
        );
      }
    } catch (err: any) {
      const durationMs = Math.max(1, performance.now() - fetchStartTime);
      const isTimeout = 
        Boolean(err?.isTimeout) ||
        statusCode === 504 ||
        (statusCode === 500 && (
          durationMs >= 45000 ||
          (err?.message && String(err.message).toLowerCase().includes("timeout"))
        )) ||
        (err?.name === "AbortError") ||
        (err?.message && String(err.message).toLowerCase().includes("timed out"));

      const errorMessage = err?.message || (typeof err === "string" ? err : "Unknown error");

      setResults((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "error",
                statusCode: statusCode !== 200 ? statusCode : 500,
                statusText: statusText !== "OK" ? statusText : "Error",
                startTimeOffsetMs: queueMs,
                isTimeout,
                rawErrorDetails: err?.rawDetails,
                metrics: {
                  promptTokens: 0,
                  completionTokens: 0,
                  totalTokens: 0,
                  durationMs,
                  tokensPerSecond: 0,
                  ttfbMs: durationMs,
                  downloadMs: 0,
                  queueMs,
                  requestSentMs: 1,
                },
                error: errorMessage,
              }
            : r
        )
      );
    } finally {
      clearTimeout(timeoutTimer);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [sortField, setSortField] = useState<'name' | 'state' | 'time' | 'speed' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSortChange = (field: 'name' | 'state' | 'time' | 'speed') => {
    if (sortField === field) {
      if (field === 'speed') {
        if (sortDirection === 'desc') {
          setSortDirection('asc');
        } else {
          setSortField(null);
          setSortDirection('desc');
        }
      } else {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else {
          setSortField(null);
          setSortDirection('asc');
        }
      }
    } else {
      setSortField(field);
      setSortDirection(field === 'speed' ? 'desc' : 'asc');
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
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [results, sortField, sortDirection]);

  const finishedResults = results.filter(r => r.status === "success");
  const fastestResult = finishedResults.length > 0
    ? [...finishedResults].sort((a, b) => (a.metrics?.durationMs || 999999) - (b.metrics?.durationMs || 999999))[0]
    : null;

  return (
    <div className={`min-h-screen theme-${theme} ${theme === 'dark' || theme === 'sepia-dark' ? 'dark' : ''} bg-[#F8F9FA] dark:bg-[#0b0f17] text-[#1A1A1A] dark:text-[#E6EDF3] font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40 transition-colors duration-200`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111622] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950">
              <Layers className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight">LLM Multi-Tester</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Sequential & Parallel Benchmarking</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setShowLeftColumn(prev => !prev)}
              data-testid="toggle-left-column-btn"
              className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200/70 dark:border-gray-700 shadow-2xs"
              title={showLeftColumn ? "Hide configuration and prompt column" : "Show configuration and prompt column"}
              aria-label={showLeftColumn ? "Hide configuration and prompt column" : "Show configuration and prompt column"}
            >
              {showLeftColumn ? (
                <>
                  <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="sr-only">Hide Controls</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="sr-only">Show Controls</span>
                </>
              )}
            </button>

            {/* Supabase Database Integration Button */}
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              data-testid="supabase-config-btn"
              aria-label="Open Supabase database settings"
              title={isSupabaseConfigured() ? "Supabase: Configured (click to configure/sync)" : "Supabase: Click to configure database connection"}
              className="relative flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200/70 dark:border-gray-700 shadow-2xs"
            >
              <Database className={`w-4 h-4 ${isSupabaseConfigured() ? 'text-emerald-500' : 'text-gray-400'}`} />
              <span className="sr-only">Supabase</span>
              {supabaseSyncStatus?.status === 'syncing' ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-emerald-500 absolute -top-0.5 -right-0.5" />
              ) : isSupabaseConfigured() ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-[#111622]" />
              ) : null}
            </button>

            {/* Theme Picker: Light, Dark, Sepia Light, Sepia Dark, Greenish Sepia */}
            <div className="relative" ref={themeMenuRef}>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(prev => !prev)}
                data-testid="theme-toggle-btn"
                aria-label={`Theme: ${THEME_OPTIONS.find(t => t.id === theme)?.label || theme}. Click to choose theme.`}
                title={`Theme: ${THEME_OPTIONS.find(t => t.id === theme)?.label || theme}`}
                className="flex items-center gap-1 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-700 transition-all cursor-pointer shadow-2xs text-xs font-bold"
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
                {theme === 'sepia-light' && <BookOpen className="w-4 h-4 text-amber-700" />}
                {theme === 'sepia-dark' && <Coffee className="w-4 h-4 text-amber-500" />}
                {theme === 'sepia-green' && <Leaf className="w-4 h-4 text-emerald-600" />}
                <span className="sr-only">
                  {THEME_OPTIONS.find(t => t.id === theme)?.label}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isThemeMenuOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#161c28] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 text-xs"
                  role="menu"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    Theme
                  </div>
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTheme(opt.id);
                          setIsThemeMenuOpen(false);
                        }}
                        data-testid={`theme-option-${opt.id}`}
                        className={`w-full flex items-center justify-between px-3 py-1.5 transition-colors cursor-pointer text-left text-xs ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ready Status Indicator: Moved far right, icons/dot do the job */}
            <div 
              className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 shadow-2xs"
              title={isGenerating ? 'Processing benchmark runs...' : 'Ready to benchmark'}
              aria-label={isGenerating ? 'Processing' : 'Ready'}
              data-testid="status-indicator"
            >
              <div 
                className={`w-2.5 h-2.5 rounded-full ${
                  isGenerating 
                    ? 'bg-amber-500 animate-pulse' 
                    : 'bg-emerald-500 shadow-2xs shadow-emerald-400'
                }`} 
              />
              <span className="sr-only">{isGenerating ? 'Processing...' : 'Ready'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Sidebar Controls - Toggled View Column */}
        {showLeftColumn && (
        <div className="lg:col-span-4 space-y-3">
          {/* Column View Section Switcher / Navigation */}
          <div className="bg-white/95 dark:bg-[#111622]/95 rounded-2xl p-1 shadow-xs border border-gray-200/80 dark:border-gray-800 flex items-center gap-1 sticky top-[58px] z-10 backdrop-blur-sm">
            <button 
              type="button"
              data-testid="tab-config"
              aria-label="Go to Configuration section"
              onClick={() => goToSection('config')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Go to Configuration section"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>

            <button 
              type="button"
              data-testid="tab-prompt"
              aria-label="Go to Prompt section"
              onClick={() => goToSection('prompt')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Go to Prompt section"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Prompt</span>
            </button>

            <button 
              type="button"
              data-testid="tab-history"
              aria-label="Go to History section"
              onClick={() => goToSection('history')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Go to History section"
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {history.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  sidebarTab === 'history' ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}>
                  {history.length}
                </span>
              )}
            </button>

            <button 
              type="button"
              data-testid="tab-all"
              aria-label="View all sections"
              onClick={() => goToSection('all')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sidebarTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="View all sections stacked"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-0.5" />

            {/* Column Visibility Toggle Button */}
            <button
              type="button"
              data-testid="toggle-visibility-button"
              aria-label="Toggle Column Visibility"
              onClick={() => setShowLeftColumn(false)}
              className="flex items-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
              title="Hide controls column"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold"></span>
            </button>
          </div>

          {/* Configuration View */}
          <div id="section-config" ref={configSectionRef} className="scroll-mt-24 transition-all duration-300">
            <section className="bg-white dark:bg-[#111622] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button 
                onClick={() => toggleSection('config')}
                className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2>Configuration</h2>
              </div>
              {collapsed.config ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
            </button>
            
            <AnimatePresence>
              {!collapsed.config && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 space-y-3 border-t border-gray-50 dark:border-gray-800/60 pt-3 sm:px-5 sm:pb-4"
                >
                  <div>
                    <div 
                      onClick={() => setShowEndpointField(prev => !prev)}
                      className="flex items-center justify-between cursor-pointer select-none mb-1 group"
                      role="button"
                      tabIndex={0}
                      aria-expanded={showEndpointField}
                      aria-label="Toggle API Endpoint input field"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowEndpointField(prev => !prev); } }}
                      data-testid="toggle-endpoint-field"
                    >
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">
                        API Endpoint
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {!showEndpointField && endpoint && (
                          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 truncate max-w-[140px] hidden sm:inline">
                            {endpoint.replace(/^https?:\/\//, '')}
                          </span>
                        )}
                        {showEndpointField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    {showEndpointField && (
                      <div className="space-y-2.5 pt-1" data-testid="endpoint-input-container">
                        {/* API Base URL presets row & Add API */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Server className="w-3.5 h-3.5 text-indigo-500" />
                              <span>API Base URL</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowAddApiModal(prev => !prev)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                              data-testid="add-api-btn"
                              title="Add custom API Base URL"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add API</span>
                            </button>
                          </div>

                          {/* Quick API presets chips */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {apiPresets.map((preset) => {
                              const isSelected = proxyBaseUrl.replace(/\/+$/, '') === preset.baseUrl.replace(/\/+$/, '');
                              return (
                                <div key={preset.id} className="inline-flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => selectApiPreset(preset)}
                                    className={`px-2 py-0.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer border ${
                                      isSelected
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold'
                                        : 'bg-white dark:bg-[#111622] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                    title={preset.baseUrl}
                                    data-testid={`preset-${preset.id}`}
                                  >
                                    {preset.name}
                                  </button>
                                  {preset.isCustom && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                                      className="ml-0.5 text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                                      title="Remove preset"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Inline Add API Form */}
                          {showAddApiModal && (
                            <div className="p-2.5 mb-2 bg-gray-100/90 dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 rounded-xl space-y-1.5 text-xs animate-in fade-in duration-150">
                              <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200">Add API Base URL</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                <input
                                  type="text"
                                  placeholder="Name (e.g. Local vLLM)"
                                  value={newApiName}
                                  onChange={(e) => setNewApiName(e.target.value)}
                                  className="px-2 py-1 bg-white dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs outline-none focus:border-indigo-500"
                                  data-testid="new-api-name-input"
                                />
                                <input
                                  type="text"
                                  placeholder="http://localhost:8000/"
                                  value={newApiUrl}
                                  onChange={(e) => setNewApiUrl(e.target.value)}
                                  className="px-2 py-1 bg-white dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
                                  data-testid="new-api-url-input"
                                />
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setShowAddApiModal(false)}
                                  className="px-2 py-0.5 text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleAddApiPreset}
                                  className="px-2.5 py-0.5 text-[11px] font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                                  data-testid="save-new-api-btn"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Custom Proxy Base URL input field */}
                        <div>
                          <label htmlFor="proxy-base-url-input" className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Custom Proxy Base URL
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                              id="proxy-base-url-input"
                              type="text" 
                              value={proxyBaseUrl}
                              onChange={(e) => handleProxyBaseUrlChange(e.target.value)}
                              data-testid="custom-proxy-base-url-input"
                              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                              placeholder="http://localhost:4100/"
                            />
                          </div>
                        </div>

                        {/* Endpoint Type Select Box */}
                        <div>
                          <label htmlFor="endpoint-type-select" className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                            Endpoint Type
                          </label>
                          <select
                            id="endpoint-type-select"
                            value={endpointType}
                            onChange={(e) => handleEndpointTypeChange(e.target.value)}
                            data-testid="endpoint-type-select"
                            className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono cursor-pointer"
                          >
                            {ENDPOINT_TYPES.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label} ({opt.description})
                              </option>
                            ))}
                          </select>
                          {endpointType === 'custom' && (
                            <div className="mt-1.5">
                              <input
                                type="text"
                                value={customEndpointPath}
                                onChange={(e) => setCustomEndpointPath(e.target.value)}
                                placeholder="/v1/custom/endpoint"
                                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                data-testid="custom-endpoint-path-input"
                              />
                            </div>
                          )}
                        </div>

                        {/* Combined Effective Target URL Preview */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-100/80 dark:bg-[#161c28]/80 border border-gray-200/60 dark:border-gray-700/60 text-xs">
                          <div className="flex items-center gap-1.5 overflow-hidden min-w-0 mr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 shrink-0">Target URL:</span>
                            <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 truncate" title={endpoint} data-testid="target-endpoint-display">
                              {endpoint}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={copyCombinedEndpoint}
                            className="shrink-0 p-1 rounded-md text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Copy full target endpoint URL"
                            aria-label="Copy full target endpoint URL"
                            data-testid="copy-endpoint-btn"
                          >
                            {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div 
                      onClick={() => setShowCustomHeadersField(prev => !prev)}
                      className="flex items-center justify-between cursor-pointer select-none mb-1 group"
                      role="button"
                      tabIndex={0}
                      aria-expanded={showCustomHeadersField}
                      aria-label="Toggle Custom Headers textarea field"
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowCustomHeadersField(prev => !prev); } }}
                      data-testid="toggle-headers-field"
                    >
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">
                        Custom Headers (one per line)
                      </label>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {!showCustomHeadersField && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 hidden sm:inline">
                            {customHeaders.trim() ? `${customHeaders.trim().split('\n').length} configured` : 'none'}
                          </span>
                        )}
                        {showCustomHeadersField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    {showCustomHeadersField && (
                      <textarea 
                        value={customHeaders}
                        onChange={(e) => setCustomHeaders(e.target.value)}
                        data-testid="custom-headers-textarea"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[64px] font-mono leading-relaxed"
                        placeholder="x-litellm-api-key: Bearer sk-1234"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Model List (one per line)</label>
                      <div className="flex items-center gap-1.5">
                        {/* Sort Ordering Controls: A-Z, Z-A, and Shuffle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200/60 dark:border-gray-700/60" title="Sort ordering">
                          <button
                            type="button"
                            onClick={() => sortModelList('asc')}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              modelSortOrder === 'asc' 
                                ? 'bg-white dark:bg-[#161c28] text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title="Sort models A-Z (Ascending)"
                            aria-label="Sort models A to Z"
                            data-testid="sort-models-asc-btn"
                          >
                            <ArrowDownAZ className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => sortModelList('desc')}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              modelSortOrder === 'desc' 
                                ? 'bg-white dark:bg-[#161c28] text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title="Sort models Z-A (Descending)"
                            aria-label="Sort models Z to A"
                            data-testid="sort-models-desc-btn"
                          >
                            <ArrowUpAZ className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={shuffleModelList}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              modelSortOrder === 'random' 
                                ? 'bg-white dark:bg-[#161c28] text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title="Random Order (Shuffle models)"
                            aria-label="Random Order"
                            data-testid="random-order-btn"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={fetchModels}
                          disabled={isFetchingModels}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/40"
                          title="Fetch available models from API endpoint"
                        >
                          {isFetchingModels ? <Loader2 className="w-3 h-3 animate-spin" /> : <List className="w-3 h-3" />}
                          <span>Fetch Models</span>
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={modelList}
                      onChange={(e) => setModelList(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[96px] font-mono leading-relaxed"
                      placeholder="free&#10;myGemma3&#10;myGroq"
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isParallel ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Parallel Mode</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Concurrent requests</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isParallel}
                          onChange={(e) => setIsParallel(e.target.checked)}
                          className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        {isParallel && (
                          <input 
                            type="number" 
                            value={parallelCount}
                            onChange={(e) => setParallelCount(parseInt(e.target.value) || 1)}
                            className="w-12 py-1 text-center bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            min="1"
                            max="10"
                          />
                        )}
                      </div>
                    </div>

                    {/* Stream Response (SSE) Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${streamResponse ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Stream Tokens (SSE)</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Prevents 50s idle gateway drops</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={streamResponse}
                        onClick={() => setStreamResponse(!streamResponse)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                          streamResponse ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                        title="Toggle Server-Sent Events (SSE) streaming"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            streamResponse ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Request Timeout Control */}
                    <div className="p-3 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Request Timeout</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">Sent to LiteLLM / proxy</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            inputMode="numeric"
                            aria-label="Request Timeout in seconds"
                            value={timeoutSeconds}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setTimeoutSeconds(val ? Math.max(1, parseInt(val, 10)) : 60);
                            }}
                            className="w-16 py-1 px-2 text-right bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          />
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">s</span>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {[60, 180, 300, 600].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTimeoutSeconds(t)}
                            className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                              timeoutSeconds === t
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-white dark:bg-[#161c28] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {t >= 60 ? `${t / 60}m` : `${t}s`}
                          </button>
                        ))}
                        <span className="text-[10px] text-gray-400 ml-auto font-mono">
                          {timeoutSeconds >= 300 ? "✓ 50s+ Safe" : "⚠️ Short"}
                        </span>
                      </div>
                    </div>

                    {/* Supabase Database Sync Card */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0b0f17] rounded-xl border border-gray-100 dark:border-gray-800 mt-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSupabaseConfigured() ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                            Supabase Sync
                            {isSupabaseConfigured() && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                Active
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {isSupabaseConfigured() ? "Inserts results to Supabase on run" : "Store runs in PostgreSQL"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSupabaseModalOpen(true)}
                        className="text-xs font-bold px-2.5 py-1.5 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-lg text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                      >
                        {isSupabaseConfigured() ? 'Manage' : 'Setup'}
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-2">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Ready to test prompt?</span>
                      <button
                        type="button"
                        onClick={() => goToSection('prompt')}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Go to Prompt</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Prompt View */}
        <div id="section-prompt" ref={promptSectionRef} className="scroll-mt-24 transition-all duration-300">
          <section className="bg-white dark:bg-[#111622] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button 
              onClick={() => toggleSection('prompt')}
              className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2>Prompt</h2>
              </div>
              {collapsed.prompt ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {!collapsed.prompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800/60 pt-3 sm:px-5 sm:pb-4"
                >
                  {/* Common LLM Testing Prompts selectbox */}
                  <div className="flex items-center justify-end gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Presets:</span>
                    <select 
                      value={selectedPresetId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPresetId(val);
                        const preset = COMMON_TEST_PROMPTS.find(p => p.id === val);
                        if (preset) {
                          setPrompt(preset.prompt);
                        }
                      }}
                      data-testid="common-prompts-select"
                      title="Select a common LLM testing prompt"
                      className="text-[11px] font-medium h-6 py-0 px-2 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[180px] sm:max-w-[210px] truncate transition-colors"
                    >
                      <option value="">Select prompt preset...</option>
                      <optgroup label="👑 Prompts Nerdy Kings (18)">
                        {NERDY_KINGS_PROMPTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} - {p.subtitle}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="⚡ Classic Benchmarks (14)">
                        {CLASSIC_TEST_PROMPTS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} - {p.subtitle}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <textarea 
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (selectedPresetId) setSelectedPresetId("");
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[110px] leading-relaxed"
                    placeholder="Enter your prompt here..."
                  />
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={generateResults}
                      disabled={isGenerating || !prompt.trim() || !modelList.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-950/50 transition-all flex items-center justify-center gap-2 group cursor-pointer text-xs sm:text-sm"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      )}
                      <span>Generate</span>
                    </button>
                    <button 
                      onClick={clearResults}
                      className="p-2.5 bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-xl cursor-pointer"
                      title="Clear Results"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* History View */}
        <div id="section-history" ref={historySectionRef} className="scroll-mt-24 transition-all duration-300">
          <section className="bg-white dark:bg-[#111622] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <button 
              onClick={() => toggleSection('history')}
              className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2>History</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase rounded-md">
                  {history.length}
                </span>
                {collapsed.history ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            <AnimatePresence>
              {!collapsed.history && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800/60 pt-3 sm:px-5 sm:pb-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mb-2.5">
                    <button 
                      onClick={exportHistory}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gray-50 dark:bg-[#161c28] hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
                      title="Export history configuration and runs as JSON"
                      data-testid="export-json-btn"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Export JSON</span>
                    </button>
                    <button 
                      type="button"
                      onClick={exportHistoryToCSV}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                      title="Download benchmark data as CSV for spreadsheet software"
                      data-testid="export-csv-btn"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Export to CSV</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => historyFileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-gray-50 dark:bg-[#161c28] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                      title="Browse JSON history file to import"
                      data-testid="import-json-btn"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Import</span>
                    </button>
                    <input 
                      ref={historyFileInputRef} 
                      type="file" 
                      accept=".json,application/json" 
                      onChange={onFileInputChange} 
                      className="hidden" 
                      data-testid="history-file-input" 
                    />
                  </div>

                  {/* Drag and Drop Dropbox */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => historyFileInputRef.current?.click()}
                    className={`mb-2.5 border-2 border-dashed rounded-xl p-2.5 text-center cursor-pointer transition-all ${
                      isDraggingOver 
                        ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/60 scale-[1.01]' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 bg-gray-50/50 dark:bg-[#0b0f17]/50'
                    }`}
                    title="Click or drag and drop a JSON file to import"
                    data-testid="history-dropbox"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isDraggingOver ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {isDraggingOver ? "Drop JSON history file here" : "Drag & drop history JSON, or click to browse"}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Supports exported history sessions or run benchmarks</span>
                    </div>
                  </div>

                  {/* Import Notification Banner */}
                  {importStatus && (
                    <div className={`mb-3 p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
                      importStatus.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {importStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                        <span>{importStatus.message}</span>
                      </div>
                      <button type="button" onClick={() => setImportStatus(null)} className="p-0.5 hover:opacity-75 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                        <p className="text-xs">No history yet</p>
                      </div>
                    ) : (
                      history.map((entry) => (
                        <div 
                          key={entry.id}
                          onClick={() => loadHistoryEntry(entry)}
                          className="group p-3 bg-gray-50 dark:bg-[#161c28] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900 rounded-xl transition-all cursor-pointer relative"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              <Calendar className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (entry.results && entry.results.length >= 2) {
                                    setComparisonModelAId(`hist-${entry.id}-${entry.results[0].id || 0}-${entry.results[0].modelName}`);
                                    setComparisonModelBId(`hist-${entry.id}-${entry.results[1].id || 1}-${entry.results[1].modelName}`);
                                  } else if (entry.results && entry.results.length === 1) {
                                    setComparisonModelAId(`hist-${entry.id}-${entry.results[0].id || 0}-${entry.results[0].modelName}`);
                                  }
                                  setViewMode("compare");
                                  const resultsEl = document.getElementById("section-results");
                                  if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-500 transition-all cursor-pointer"
                                title="Compare models from this run"
                              >
                                <GitCompare className="w-3 h-3" />
                              </button>
                              <button 
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!isSupabaseConfigured()) {
                                    setIsSupabaseModalOpen(true);
                                    return;
                                  }
                                  const res = await insertBenchmarkRunToSupabase(entry);
                                  if (res.success) {
                                    setImportStatus({ 
                                      type: 'success', 
                                      message: `Inserted history session & ${res.insertedCount} results to Supabase!` 
                                    });
                                  } else {
                                    setImportStatus({ 
                                      type: 'error', 
                                      message: res.error || 'Failed to insert to Supabase' 
                                    });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-500 transition-all cursor-pointer"
                                title="Insert this run to Supabase"
                              >
                                <Database className="w-3 h-3" />
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const csv = convertHistoryToCSV([entry]);
                                  downloadCSV(csv, `llm-benchmark-${new Date(entry.timestamp).toISOString().split('T')[0]}-${entry.id.slice(0, 6)}.csv`);
                                  setImportStatus({
                                    type: 'success',
                                    message: `Exported benchmark run to CSV!`
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                                title="Export this benchmark run to CSV"
                              >
                                <FileSpreadsheet className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => deleteHistoryEntry(entry.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200 line-clamp-2 leading-relaxed">
                            {entry.prompt}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {entry.results.slice(0, 3).map((r, i) => (
                                <div 
                                  key={i}
                                  className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-[6px] font-black text-white ${
                                    r.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}
                                  title={r.modelName}
                                >
                                  {r.modelName[0].toUpperCase()}
                                </div>
                              ))}
                              {entry.results.length > 3 && (
                                <div className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[6px] font-black text-gray-500 dark:text-gray-300">
                                  +{entry.results.length - 3}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
      )}

        {/* Results Display */}
        <div id="section-results" className={showLeftColumn ? "lg:col-span-8" : "lg:col-span-12 transition-all"}>
          {results.length === 0 && viewMode !== "compare" ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-[#111622] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-gray-50 dark:bg-[#0b0f17] rounded-2xl flex items-center justify-center mb-4">
                <Cpu className="text-gray-300 dark:text-gray-600 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-2">Configure your endpoint and models, then click generate to see comparisons.</p>
              {history.length > 0 && (
                <button
                  type="button"
                  data-testid="empty-open-compare-btn"
                  onClick={() => setViewMode("compare")}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Open Model Comparison View ({history.length} runs in history)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Results Top Bar & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    {viewMode === "compare" ? "Comparison" : "Results"}
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase rounded-md">
                      {results.length} Models
                    </span>
                    {supabaseSyncStatus?.status === 'synced' && (
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-md"
                        title={supabaseSyncStatus.message || "Results saved to Supabase"}
                      >
                        <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline">Saved to Supabase</span>
                      </span>
                    )}
                    {supabaseSyncStatus?.status === 'syncing' && (
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-md"
                        title="Saving results to Supabase..."
                      >
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline">Saving to Supabase...</span>
                      </span>
                    )}
                  </h2>

                  {/* View Mode Switcher */}
                  <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <button
                      onClick={() => setViewMode("split")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "split" 
                          ? "bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold" 
                          : "hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                      title="Show both Waterfall Timeline and Response Cards"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Split</span>
                    </button>
                    <button
                      onClick={() => setViewMode("waterfall")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "waterfall" 
                          ? "bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold" 
                          : "hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                      title="DevTools Network Table & Waterfall Timeline"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>DevTools Network</span>
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "cards" 
                          ? "bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold" 
                          : "hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                      title="Cards View with Embedded DevTools Timing"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                    <button
                      onClick={() => setViewMode("compare")}
                      data-testid="view-mode-compare"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === "compare" 
                          ? "bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold" 
                          : "hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                      title="Model Comparison with Token-Level Diff Highlighter"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Comparison</span>
                    </button>
                  </div>

                  {/* Quick Sort Controls */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300">
                    <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 px-1.5">Sort:</span>
                    <button
                      type="button"
                      data-testid="quick-sort-time"
                      onClick={() => handleSortChange('time')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        sortField === 'time' ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold' : 'hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                      title="Sort by Time (fastest duration first)"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Time</span>
                      {sortField === 'time' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />)}
                    </button>
                    <button
                      type="button"
                      data-testid="quick-sort-speed"
                      onClick={() => handleSortChange('speed')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        sortField === 'speed' ? 'bg-white dark:bg-[#161c28] text-indigo-700 dark:text-indigo-400 shadow-xs font-bold' : 'hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                      title="Sort by Speed (highest tokens/sec first)"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Speed</span>
                      {sortField === 'speed' && (sortDirection === 'desc' ? <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> : <ArrowUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />)}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Anchor link to fastest model's result */}
                  {fastestResult && (
                    <a
                      href={`#${fastestResult.id}`}
                      data-testid="fastest-result-link"
                      onClick={(e) => {
                        e.preventDefault();
                        if (viewMode === "waterfall") {
                          setViewMode("split");
                        }
                        setSelectedResultId(fastestResult.id);
                        setTimeout(() => {
                          const el = document.getElementById(fastestResult.id);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                      title={`Jump to fastest result: ${fastestResult.modelName}`}
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20 group-hover:scale-110 transition-transform" />
                      <span>Fastest: <span className="font-mono underline decoration-emerald-400 underline-offset-2">{fastestResult.modelName}</span> ({((fastestResult.metrics?.durationMs || 0) / 1000).toFixed(2)}s)</span>
                      <ArrowDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-all" />
                    </a>
                  )}

                  <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700" /> Idle
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" /> Pending
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" /> Success
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Comparison View with Token-Level Diff (Visible in 'compare' mode) */}
              {viewMode === "compare" && (
                <ModelComparisonView 
                  currentResults={results}
                  history={history}
                  currentPrompt={prompt}
                  initialModelAId={comparisonModelAId}
                  initialModelBId={comparisonModelBId}
                />
              )}

              {/* DevTools Network Waterfall Panel (Visible in 'split' and 'waterfall' modes) */}
              {(viewMode === "split" || viewMode === "waterfall") && (
                <div className="space-y-2">
                  <NetworkWaterfallPanel 
                    results={results} 
                    selectedId={selectedResultId}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    onSelectResult={(id) => {
                      setSelectedResultId(id);
                      if (viewMode === "waterfall") {
                        setViewMode("split");
                      }
                      setTimeout(() => {
                        const el = document.getElementById(id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
                    }}
                  />
                </div>
              )}

              {/* Response Cards Grid (Visible in 'split' and 'cards' modes) */}
              {(viewMode === "split" || viewMode === "cards") && (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode="popLayout">
                    {sortedResults.map((result, index) => (
                      <motion.div
                        id={result.id}
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`bg-white dark:bg-[#111622] rounded-2xl border transition-all overflow-hidden scroll-mt-24 ${
                          selectedResultId === result.id ? 'ring-2 ring-indigo-500 border-indigo-200 dark:border-indigo-800 shadow-md' :
                          result.status === 'pending' ? 'border-amber-200 dark:border-amber-900/60 shadow-lg shadow-amber-50 dark:shadow-none ring-1 ring-amber-100 dark:ring-amber-900/40' : 
                          result.status === 'success' ? 'border-gray-100 dark:border-gray-800 shadow-sm' : 
                          result.status === 'error' ? 'border-red-100 dark:border-red-900/60 shadow-sm' : 
                          'border-gray-100 dark:border-gray-800 opacity-60'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#111622]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              result.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 
                              result.status === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 
                              result.status === 'error' ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' : 
                              'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm font-mono text-gray-900 dark:text-white">{result.modelName}</h3>
                                {result.id === fastestResult?.id && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-mono shadow-2xs">
                                    <Zap className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" /> Fastest ({((result.metrics?.durationMs || 0) / 1000).toFixed(2)}s)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {result.status === 'pending' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Processing
                                  </span>
                                )}
                                {result.status === 'success' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                                  </span>
                                )}
                                {result.status === 'error' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                                    <AlertCircle className="w-2.5 h-2.5" /> Failed
                                  </span>
                                )}
                                {result.status === 'idle' && (
                                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Waiting</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {result.status === 'success' && (
                            <div className="flex items-center gap-1">
                              <button 
                                type="button"
                                onClick={() => {
                                  setComparisonModelAId(`current-${result.id}-${result.modelName}`);
                                  setViewMode("compare");
                                }}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                title={`Compare ${result.modelName} with another model`}
                              >
                                <GitCompare className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => copyToClipboard(result.output)}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                title="Copy Output"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-5">
                          {result.status === 'idle' && (
                            <div className="py-8 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
                              <Clock className="w-8 h-8 mb-2 opacity-20" />
                              <p className="text-xs font-medium">Queued for processing</p>
                            </div>
                          )}

                          {result.status === 'pending' && (
                            <div className="space-y-3">
                              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-3/4 animate-pulse" />
                              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-full animate-pulse" />
                              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-5/6 animate-pulse" />
                            </div>
                          )}

                          {result.status === 'success' && (
                            <div className="space-y-4">
                              <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                                {result.output}
                              </div>
                              
                              {/* DevTools Network Timing & Metrics Component */}
                              <DevToolsTimingDetail result={result} />
                            </div>
                          )}

                          {result.status === 'error' && (
                            <div className="space-y-4">
                              <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-red-700">Request Failed ({result.statusCode || 500})</p>
                                    {result.isTimeout && (
                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 font-mono">
                                        <Clock className="w-3 h-3" /> Timeout (50s+)
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-red-600 mt-1 leading-relaxed font-mono break-all">{result.error}</p>
                                </div>
                              </div>

                              {/* Dedicated Timeout Diagnostics & Troubleshooting Guide */}
                              {result.isTimeout && (
                                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-bold text-amber-900">
                                      <Clock className="w-4 h-4 text-amber-600" />
                                      <span>Why did this fail with 500 / Timeout?</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold bg-amber-200/70 text-amber-800 px-2 py-0.5 rounded">
                                      Duration: {((result.metrics?.durationMs || 0) / 1000).toFixed(1)}s
                                    </span>
                                  </div>

                                  <p className="text-amber-800 leading-relaxed">
                                    Your local model ran for <strong>{((result.metrics?.durationMs || 0) / 1000).toFixed(1)} seconds</strong>. By default, LiteLLM, Ollama proxies, and gateway routers terminate idle non-streaming connections around <strong>50s-60s</strong> and return HTTP 500.
                                  </p>

                                  <div className="bg-white p-3 rounded-lg border border-amber-200/80 space-y-2.5">
                                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                                      <Zap className="w-3.5 h-3.5 text-indigo-600" /> Recommended fixes:
                                    </p>
                                    <ul className="space-y-2 text-gray-700">
                                      <li className="flex items-start gap-2">
                                        <span className="font-bold text-indigo-600 shrink-0">1.</span>
                                        <div>
                                          <strong>Enable Stream Tokens (SSE):</strong> Tokens stream continuously as generated, keeping HTTP packets flowing so proxies never drop the connection.
                                          {!streamResponse && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setStreamResponse(true);
                                                processModel(result.id, result.modelName);
                                              }}
                                              className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-md shadow-xs transition-colors cursor-pointer"
                                            >
                                              <Activity className="w-3 h-3" /> Enable Streaming & Retry
                                            </button>
                                          )}
                                        </div>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="font-bold text-indigo-600 shrink-0">2.</span>
                                        <div>
                                          <strong>Increase Request Timeout:</strong> Currently set to {timeoutSeconds}s. Try 300s (5m) or 600s (10m).
                                          <div className="flex gap-2 mt-1">
                                            {[300, 600].map((t) => (
                                              <button
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                  setTimeoutSeconds(t);
                                                  processModel(result.id, result.modelName);
                                                }}
                                                className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded cursor-pointer"
                                              >
                                                Set to {t / 60}m & Retry
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <span className="font-bold text-indigo-600 shrink-0">3.</span>
                                        <div>
                                          <strong>LiteLLM Proxy Config:</strong> Add <code className="bg-amber-50 text-amber-900 px-1 py-0.5 rounded font-mono">request_timeout: 300</code> in your <code className="font-mono">config.yaml</code> under <code className="font-mono">litellm_settings</code>.
                                        </div>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* Still show DevTools network failure timing */}
                              {result.metrics && <DevToolsTimingDetail result={result} />}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-medium">Ollama & vLLM Compatible Benchmarking Tool</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Model Selector Modal */}
      <AnimatePresence>
        {showModelSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModelSelector(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <List className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Select Models</h3>
                </div>
                <button 
                  onClick={() => setShowModelSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder="Filter models..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {/* Bulk Select Actions & Counter */}
                <div className="flex items-center justify-between py-1 text-xs">
                  <div className="text-gray-500 font-medium">
                    {(() => {
                      const currentSelected = new Set(modelList.split("\n").map(m => m.trim()).filter(Boolean));
                      const filtered = availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));
                      const selectedCount = filtered.filter(m => currentSelected.has(m)).length;
                      return (
                        <span>
                          <strong className="text-gray-900 font-bold">{selectedCount}</strong> of {filtered.length} selected
                          {modelSearch && <span className="text-gray-400 ml-1">(filtered)</span>}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllModels}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                      title="Select all models matching current filter"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={unselectAllModels}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                      title="Unselect all models matching current filter"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Unselect All
                    </button>
                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5" title="Sort ordering">
                      <button
                        type="button"
                        onClick={() => sortModelList('asc')}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          modelSortOrder === 'asc' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                        title="Sort models A-Z (Ascending)"
                        aria-label="Sort models A to Z"
                      >
                        <ArrowDownAZ className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sortModelList('desc')}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          modelSortOrder === 'desc' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                        title="Sort models Z-A (Descending)"
                        aria-label="Sort models Z to A"
                      >
                        <ArrowUpAZ className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={shuffleModelList}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          modelSortOrder === 'random' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                        title="Random Order (Shuffle models)"
                        aria-label="Random Order"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const filtered = availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));
                    const currentSelected = new Set(modelList.split("\n").map(m => m.trim()).filter(Boolean));

                    if (availableModels.length === 0) {
                      return (
                        <div className="py-12 text-center text-gray-400">
                          <p className="text-sm">No models found</p>
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="py-8 text-center text-gray-400">
                          <p className="text-sm">No models match "{modelSearch}"</p>
                        </div>
                      );
                    }

                    return filtered.map((model) => {
                      const isSelected = currentSelected.has(model);
                      return (
                        <button
                          key={model}
                          type="button"
                          data-testid={`model-toggle-${model}`}
                          onClick={() => toggleModel(model)}
                          className={`w-full flex items-center justify-between p-3 mb-2 rounded-xl border transition-all text-left group cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-50/90 border-indigo-200 text-indigo-900 shadow-xs' 
                              : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'border-gray-300 bg-white group-hover:border-indigo-400'
                            }`}>
                              {isSelected ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Plus className="w-3 h-3 text-transparent group-hover:text-indigo-400" />
                              )}
                            </div>
                            <span className="text-sm font-mono truncate">{model}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${
                            isSelected 
                              ? 'bg-indigo-200/70 text-indigo-800' 
                              : 'text-gray-400 group-hover:text-indigo-600'
                          }`}>
                            {isSelected ? 'Selected' : 'Add'}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setShowModelSelector(false)}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supabase Database Setup & Configuration Modal */}
      <SupabaseConfigModal 
        isOpen={isSupabaseModalOpen} 
        onClose={() => setIsSupabaseModalOpen(false)} 
      />
    </div>
  );
}
