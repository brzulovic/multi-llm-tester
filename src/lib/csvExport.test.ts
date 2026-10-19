import { describe, it, expect, vi } from 'vitest';
import { escapeCSVCell, convertHistoryToCSV, downloadCSV } from './csvExport';
import type { HistoryEntry, ModelResult } from '../types';

describe('CSV Export Utility', () => {
  it('correctly escapes CSV cell values', () => {
    expect(escapeCSVCell('simple text')).toBe('simple text');
    expect(escapeCSVCell('text with, comma')).toBe('"text with, comma"');
    expect(escapeCSVCell('text with "quotes"')).toBe('"text with ""quotes"""');
    expect(escapeCSVCell('line 1\nline 2')).toBe('"line 1\nline 2"');
    expect(escapeCSVCell(null)).toBe('');
    expect(escapeCSVCell(undefined)).toBe('');
    expect(escapeCSVCell(42)).toBe('42');
  });

  it('converts history entries into CSV rows with headers and UTF-8 BOM', () => {
    const mockHistory: HistoryEntry[] = [
      {
        id: 'hist-1',
        timestamp: 1700000000000,
        prompt: 'Which is larger: 9.9 or 9.11?',
        endpoint: 'http://localhost:8000/v1/chat/completions',
        results: [
          {
            id: 'res-1',
            modelName: 'gpt-4o',
            status: 'success',
            output: '9.9 is larger than 9.11 because 9.90 > 9.11.',
            statusCode: 200,
            metrics: {
              promptTokens: 15,
              completionTokens: 20,
              totalTokens: 35,
              durationMs: 1250,
              tokensPerSecond: 16.0,
              ttfbMs: 320,
              downloadMs: 930,
              queueMs: 10,
              requestSentMs: 5
            }
          },
          {
            id: 'res-2',
            modelName: 'claude-3-5-sonnet',
            status: 'error',
            output: '',
            error: 'Connection timeout',
            isTimeout: true,
            statusCode: 504
          }
        ],
        isParallel: false,
        parallelCount: 1,
        streamResponse: false,
        timeoutSeconds: 30,
        enableSystemPrompt: false,
        systemPromptMode: 'specific'
      }
    ];

    const csv = convertHistoryToCSV(mockHistory);
    expect(csv.startsWith('\uFEFF')).toBe(true);

    const lines = csv.replace('\uFEFF', '').split('\r\n');
    expect(lines.length).toBe(3); // 1 header line + 2 results lines

    expect(lines[0]).toContain('Run ID');
    expect(lines[0]).toContain('Model Name');
    expect(lines[0]).toContain('Tokens/Sec');

    expect(lines[1]).toContain('gpt-4o');
    expect(lines[1]).toContain('16.0');
    expect(lines[1]).toContain('"Which is larger: 9.9 or 9.11?"');

    expect(lines[2]).toContain('claude-3-5-sonnet');
    expect(lines[2]).toContain('Connection timeout');
    expect(lines[2]).toContain('Yes'); // Is Timeout
  });

  it('falls back to current results if history is empty', () => {
    const currentResults: ModelResult[] = [
      {
        id: 'res-active',
        modelName: 'gemini-1.5-pro',
        status: 'success',
        output: '42 is the answer',
        metrics: {
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
          durationMs: 800,
          tokensPerSecond: 6.25
        }
      }
    ];

    const csv = convertHistoryToCSV([], {
      results: currentResults,
      prompt: 'What is the answer?',
      endpoint: 'https://api.example.com'
    });

    expect(csv.includes('gemini-1.5-pro')).toBe(true);
    expect(csv.includes('What is the answer?')).toBe(true);
  });

  it('triggers downloadCSV without errors', () => {
    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    // Mock createObjectURL & revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    downloadCSV('col1,col2\nval1,val2', 'test.csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
