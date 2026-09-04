/**
 * Sandboxed Code Execution Runner (Browser-side ESM execution)
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { ConsoleMessage, ExecutionResult } from '../types';

export function setupImportMap(packageName: string, version?: string) {
  const existing = document.getElementById('dynamic-sandbox-importmap');
  if (existing) {
    existing.remove();
  }
  const cdnUrl = `https://esm.sh/${packageName}${version ? `@${version}` : ''}`;
  const script = document.createElement('script');
  script.type = 'importmap';
  script.id = 'dynamic-sandbox-importmap';
  script.textContent = JSON.stringify({
    imports: {
      [packageName]: cdnUrl,
      [packageName.toLowerCase()]: cdnUrl,
    }
  });
  document.head.appendChild(script);
}

export async function executeCodeInBrowser(
  code: string,
  previewContainer: HTMLElement | null,
  packageName?: string,
  version?: string
): Promise<ExecutionResult> {
  const logs: ConsoleMessage[] = [];
  const startTime = performance.now();

  // Setup import map if package name provided
  if (packageName) {
    setupImportMap(packageName, version);
  }

  // Override console methods to capture all outputs
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalTable = console.table;

  const pushLog = (type: ConsoleMessage['type'], data: any[]) => {
    logs.push({
      id: Math.random().toString(36).substring(2, 9),
      type,
      data: data.map(item => sanitizeLogItem(item)),
      timestamp: Date.now(),
    });
  };

  console.log = (...args: any[]) => {
    originalLog(...args);
    pushLog('log', args);
  };
  console.info = (...args: any[]) => {
    originalInfo(...args);
    pushLog('info', args);
  };
  console.warn = (...args: any[]) => {
    originalWarn(...args);
    pushLog('warn', args);
  };
  console.error = (...args: any[]) => {
    originalError(...args);
    pushLog('error', args);
  };
  console.table = (...args: any[]) => {
    originalTable(...args);
    pushLog('table', args);
  };

  let returnValue: any = undefined;
  let success = true;
  let errorDetails: { message: string; stack?: string } | undefined = undefined;

  try {
    // If preview container is provided, clear it before execution
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }

    // Transform code to Blob URL for dynamic ES module import
    const blob = new Blob([code], { type: 'text/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const module = await import(/* @vite-ignore */ blobUrl);
      returnValue = module.default ?? module;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (err: any) {
    success = false;
    errorDetails = {
      message: err.message || 'Unknown runtime execution error',
      stack: err.stack,
    };
    logs.push({
      id: Math.random().toString(36).substring(2, 9),
      type: 'error',
      data: [err.message || String(err)],
      timestamp: Date.now(),
      stack: err.stack,
    });
  } finally {
    // Restore original console
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
    console.table = originalTable;
  }

  const endTime = performance.now();
  const executionTimeMs = Math.round(endTime - startTime);

  return {
    success,
    returnValue,
    executionTimeMs,
    logs,
    error: errorDetails,
  };
}

function sanitizeLogItem(item: any): any {
  if (item === null) return 'null';
  if (item === undefined) return 'undefined';
  if (typeof item === 'function') return `[Function: ${item.name || 'anonymous'}]`;
  if (item instanceof HTMLElement) return `[HTMLElement: <${item.tagName.toLowerCase()}>]`;
  if (typeof item === 'object') {
    try {
      // Check for circular reference or deep objects
      return JSON.parse(JSON.stringify(item, (key, value) => {
        if (typeof value === 'function') return `[Function]`;
        if (value instanceof HTMLElement) return `[HTMLElement]`;
        return value;
      }));
    } catch {
      return Object.prototype.toString.call(item);
    }
  }
  return item;
}
