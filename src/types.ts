/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NetworkTimingMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  tokensPerSecond: number;
  ttfbMs?: number;        // Time To First Byte / Waiting for server response
  downloadMs?: number;    // Content Download / Streaming token response
  queueMs?: number;       // Queued before dispatch
  requestSentMs?: number; // Request sent / serialization
}

export interface ModelResult {
  id: string;
  modelName: string;
  status: "idle" | "pending" | "success" | "error";
  output: string;
  statusCode?: number;
  statusText?: string;
  startTimeOffsetMs?: number;
  metrics?: NetworkTimingMetrics;
  error?: string;
  isTimeout?: boolean;
  rawErrorDetails?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  prompt: string;
  endpoint: string;
  customHeaders?: string;
  headers?: string;
  results: ModelResult[];
}
