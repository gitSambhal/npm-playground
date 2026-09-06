/**
 * Sandboxed Code Execution Runner (Browser-side ESM execution with multi-file support)
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { ConsoleMessage, ExecutionResult } from '../types';
import { parsePackagePath } from './npmRegistry';

export function setupImportMap(packageName: string, version?: string) {
  const existing = document.getElementById('dynamic-sandbox-importmap');
  if (existing) {
    existing.remove();
  }
  const parsed = parsePackagePath(packageName);
  const fullCdnUrl = `https://esm.sh/${parsed.fullPath}${version ? `@${version}` : ''}`;
  const baseCdnUrl = `https://esm.sh/${parsed.basePackage}${version ? `@${version}` : ''}`;

  const script = document.createElement('script');
  script.type = 'importmap';
  script.id = 'dynamic-sandbox-importmap';
  script.textContent = JSON.stringify({
    imports: {
      [parsed.fullPath]: fullCdnUrl,
      [parsed.fullPath.toLowerCase()]: fullCdnUrl,
      [parsed.basePackage]: baseCdnUrl,
      [parsed.basePackage.toLowerCase()]: baseCdnUrl,
    }
  });
  document.head.appendChild(script);
}

export async function executeCodeInBrowser(
  filesOrCode: Array<{ name: string; content: string; language: string }> | string,
  previewContainer: HTMLElement | null,
  packageName?: string,
  version?: string
): Promise<ExecutionResult> {
  const logs: ConsoleMessage[] = [];
  const startTime = performance.now();

  const files = typeof filesOrCode === 'string' 
    ? [{ name: 'index.js', content: filesOrCode, language: 'javascript' }]
    : filesOrCode;

  // Setup import map if package name provided
  if (packageName) {
    setupImportMap(packageName, version);
  }

  // Setup Node.js runtime environment shims
  (window as any).process = (window as any).process || {
    env: { NODE_ENV: 'development' },
    version: 'v18.16.0',
    platform: 'browser',
    nextTick: (cb: Function) => setTimeout(cb, 0),
    cwd: () => '/',
    pid: 1,
  };
  (window as any).__dirname = '/';
  (window as any).__filename = '/index.js';
  (window as any).global = window;

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

  const blobUrls: string[] = [];

  try {
    // If preview container is provided, clear it before execution
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }

    const jsFiles = files.length > 0 ? files : [{ name: 'index.js', content: '', language: 'javascript' }];
    const urlMap: Record<string, string> = {};

    // 1. First pass: generate blob URLs for all files
    jsFiles.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      urlMap[file.name] = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      urlMap[baseName] = url;
    });

    // 2. Second pass: rewrite relative imports and update blobs
    jsFiles.forEach(file => {
      let content = file.content;
      Object.keys(urlMap).forEach(fileName => {
        const targetUrl = urlMap[fileName];
        content = content.replace(new RegExp(`from\\s+['"]\\.\\/${fileName}['"]`, 'g'), `from '${targetUrl}'`);
        content = content.replace(new RegExp(`from\\s+['"]\\.\\/${fileName.replace(/\.[^/.]+$/, '')}['"]`, 'g'), `from '${targetUrl}'`);
        content = content.replace(new RegExp(`import\\s*\\(\\s*['"]\\.\\/${fileName}['"]\\s*\\)`, 'g'), `import('${targetUrl}')`);
        content = content.replace(new RegExp(`import\\s*\\(\\s*['"]\\.\\/${fileName.replace(/\.[^/.]+$/, '')}['"]\\s*\\)`, 'g'), `import('${targetUrl}')`);
      });

      const blob = new Blob([content], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      urlMap[file.name] = url;
    });

    const entryFile = jsFiles.find(f => f.name === 'index.js') || jsFiles.find(f => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx') || f.name.endsWith('.jsx')) || jsFiles[0];
    if (!entryFile) {
      throw new Error('No execution file found in project.');
    }

    const entryUrl = urlMap[entryFile.name];

    try {
      const module = await import(/* @vite-ignore */ entryUrl);
      returnValue = module.default ?? module;
    } finally {
      // Clean up in outer finally
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
    blobUrls.forEach(url => URL.revokeObjectURL(url));

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
