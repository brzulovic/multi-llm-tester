import type { HistoryEntry, ModelResult } from '../types';

/**
 * Escapes a cell value for RFC 4180 compliant CSV format.
 * If forceQuote is true, it is always enclosed in double quotes (ideal for text fields like prompts and outputs).
 */
export function escapeCSVCell(value: unknown, forceQuote = false): string {
  if (value === null || value === undefined) {
    return forceQuote ? '""' : '';
  }
  const str = String(value);
  if (forceQuote || /[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts history entries (or current results) to a standard CSV string
 * suitable for importing into Excel, Google Sheets, or any spreadsheet software.
 */
export function convertHistoryToCSV(
  history: HistoryEntry[],
  fallbackCurrentResults?: {
    results: ModelResult[];
    prompt: string;
    endpoint: string;
  }
): string {
  const headers = [
    'Run ID',
    'Timestamp (ISO)',
    'Date & Time',
    'Endpoint',
    'Prompt',
    'Model Name',
    'Status',
    'HTTP Status',
    'Duration (ms)',
    'Tokens/Sec',
    'Prompt Tokens',
    'Completion Tokens',
    'Total Tokens',
    'TTFB (ms)',
    'Download (ms)',
    'Queue (ms)',
    'Request Sent (ms)',
    'Output',
    'Error',
    'Is Timeout'
  ];

  const rows: string[][] = [];

  // If history is provided, extract all runs and results
  if (history && history.length > 0) {
    for (const entry of history) {
      const isoDate = new Date(entry.timestamp).toISOString();
      const localDate = new Date(entry.timestamp).toLocaleString();

      if (entry.results && entry.results.length > 0) {
        for (const res of entry.results) {
          rows.push([
            escapeCSVCell(entry.id),
            escapeCSVCell(isoDate),
            escapeCSVCell(localDate),
            escapeCSVCell(entry.endpoint || ''),
            escapeCSVCell(entry.prompt || '', true),
            escapeCSVCell(res.modelName),
            escapeCSVCell(res.status),
            escapeCSVCell(res.statusCode !== undefined ? String(res.statusCode) : ''),
            escapeCSVCell(res.metrics?.durationMs !== undefined ? String(Math.round(res.metrics.durationMs)) : ''),
            escapeCSVCell(res.metrics?.tokensPerSecond !== undefined ? res.metrics.tokensPerSecond.toFixed(1) : ''),
            escapeCSVCell(res.metrics?.promptTokens !== undefined ? String(res.metrics.promptTokens) : ''),
            escapeCSVCell(res.metrics?.completionTokens !== undefined ? String(res.metrics.completionTokens) : ''),
            escapeCSVCell(res.metrics?.totalTokens !== undefined ? String(res.metrics.totalTokens) : ''),
            escapeCSVCell(res.metrics?.ttfbMs !== undefined ? String(Math.round(res.metrics.ttfbMs)) : ''),
            escapeCSVCell(res.metrics?.downloadMs !== undefined ? String(Math.round(res.metrics.downloadMs)) : ''),
            escapeCSVCell(res.metrics?.queueMs !== undefined ? String(Math.round(res.metrics.queueMs)) : ''),
            escapeCSVCell(res.metrics?.requestSentMs !== undefined ? String(Math.round(res.metrics.requestSentMs)) : ''),
            escapeCSVCell(res.output || '', true),
            escapeCSVCell(res.error || '', true),
            escapeCSVCell(res.isTimeout ? 'Yes' : 'No')
          ]);
        }
      } else {
        // Run with no results recorded
        rows.push([
          escapeCSVCell(entry.id),
          escapeCSVCell(isoDate),
          escapeCSVCell(localDate),
          escapeCSVCell(entry.endpoint || ''),
          escapeCSVCell(entry.prompt || '', true),
          escapeCSVCell(''),
          escapeCSVCell('empty'),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell(''),
          escapeCSVCell('', true),
          escapeCSVCell('', true),
          escapeCSVCell('No')
        ]);
      }
    }
  } else if (fallbackCurrentResults && fallbackCurrentResults.results.length > 0) {
    // Fallback to active session results if history is empty
    const now = new Date();
    const isoDate = now.toISOString();
    const localDate = now.toLocaleString();
    const fakeRunId = 'current-run-' + now.getTime();

    for (const res of fallbackCurrentResults.results) {
      rows.push([
        escapeCSVCell(fakeRunId),
        escapeCSVCell(isoDate),
        escapeCSVCell(localDate),
        escapeCSVCell(fallbackCurrentResults.endpoint || ''),
        escapeCSVCell(fallbackCurrentResults.prompt || '', true),
        escapeCSVCell(res.modelName),
        escapeCSVCell(res.status),
        escapeCSVCell(res.statusCode !== undefined ? String(res.statusCode) : ''),
        escapeCSVCell(res.metrics?.durationMs !== undefined ? String(Math.round(res.metrics.durationMs)) : ''),
        escapeCSVCell(res.metrics?.tokensPerSecond !== undefined ? res.metrics.tokensPerSecond.toFixed(1) : ''),
        escapeCSVCell(res.metrics?.promptTokens !== undefined ? String(res.metrics.promptTokens) : ''),
        escapeCSVCell(res.metrics?.completionTokens !== undefined ? String(res.metrics.completionTokens) : ''),
        escapeCSVCell(res.metrics?.totalTokens !== undefined ? String(res.metrics.totalTokens) : ''),
        escapeCSVCell(res.metrics?.ttfbMs !== undefined ? String(Math.round(res.metrics.ttfbMs)) : ''),
        escapeCSVCell(res.metrics?.downloadMs !== undefined ? String(Math.round(res.metrics.downloadMs)) : ''),
        escapeCSVCell(res.metrics?.queueMs !== undefined ? String(Math.round(res.metrics.queueMs)) : ''),
        escapeCSVCell(res.metrics?.requestSentMs !== undefined ? String(Math.round(res.metrics.requestSentMs)) : ''),
        escapeCSVCell(res.output || '', true),
        escapeCSVCell(res.error || '', true),
        escapeCSVCell(res.isTimeout ? 'Yes' : 'No')
      ]);
    }
  }

  if (rows.length === 0) {
    return '';
  }

  const csvLines = [
    headers.map(h => escapeCSVCell(h)).join(','),
    ...rows.map(row => row.join(','))
  ];

  // Include UTF-8 BOM for automatic Excel UTF-8 recognition
  return '\uFEFF' + csvLines.join('\r\n');
}

/**
 * Triggers a browser download of the CSV content.
 */
export function downloadCSV(csvContent: string, filename?: string): void {
  const defaultFilename = `llm-benchmark-data-${new Date().toISOString().split('T')[0]}.csv`;
  const name = filename || defaultFilename;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', name);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
