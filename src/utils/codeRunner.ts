/**
 * Sandboxed Code Execution Runner (Single-file ESM execution with Babel & React mounting)
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { ConsoleMessage, ExecutionResult } from '../types';
import { parsePackagePath } from './npmRegistry';
import * as Babel from '@babel/standalone';

export function extractPackagesFromCode(code: string, primaryPackage?: string): string[] {
  const pkgs = new Set<string>();
  if (primaryPackage) pkgs.add(primaryPackage);
  
  const importRegex = /from\s+['"]([^'"\.\/][^'"]+)['"]|import\s*\(\s*['"]([^'"\.\/][^'"]+)['"]\s*\)/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const pkg = match[1] || match[2];
    if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/')) {
      const parts = pkg.split('/');
      if (pkg.startsWith('@') && parts.length > 1) {
        pkgs.add(`${parts[0]}/${parts[1]}`);
      } else {
        pkgs.add(parts[0]);
      }
    }
  }
  return Array.from(pkgs);
}

export function setupImportMap(packages: string | string[], version?: string) {
  const existing = document.getElementById('dynamic-sandbox-importmap');
  if (existing) {
    existing.remove();
  }
  const pkgList = Array.isArray(packages) ? packages : [packages];
  const importsMap: Record<string, string> = {
    'react': 'https://esm.sh/react@18.2.0',
    'react/jsx-runtime': 'https://esm.sh/react@18.2.0/jsx-runtime',
    'react-dom': 'https://esm.sh/react-dom@18.2.0',
    'react-dom/client': 'https://esm.sh/react-dom@18.2.0/client',
    'node:path': 'https://cdn.jsdelivr.net/npm/path-browserify@1.0.1/index.js',
    'path': 'https://cdn.jsdelivr.net/npm/path-browserify@1.0.1/index.js',
    'node:fs': 'https://cdn.jsdelivr.net/npm/browserify-fs@1.0.0/index.js',
    'fs': 'https://cdn.jsdelivr.net/npm/browserify-fs@1.0.0/index.js',
    'node:os': 'https://cdn.jsdelivr.net/npm/os-browserify@0.3.0/browser.js',
    'os': 'https://cdn.jsdelivr.net/npm/os-browserify@0.3.0/browser.js',
    'crypto': 'https://esm.sh/crypto-browserify@3.12.0',
    'node:crypto': 'https://esm.sh/crypto-browserify@3.12.0',
    'stream': 'https://esm.sh/stream-browserify@3.0.0',
    'node:stream': 'https://esm.sh/stream-browserify@3.0.0',
    'buffer': 'https://esm.sh/buffer@6.0.3',
    'node:buffer': 'https://esm.sh/buffer@6.0.3',
    'util': 'https://esm.sh/util@0.12.5',
    'node:util': 'https://esm.sh/util@0.12.5',
    'events': 'https://esm.sh/events@3.3.0',
    'node:events': 'https://esm.sh/events@3.3.0',
  };

  const nodeBuiltins = new Set([
    'node:path', 'path', 'node:fs', 'fs', 'node:os', 'os',
    'crypto', 'node:crypto', 'stream', 'node:stream',
    'buffer', 'node:buffer', 'util', 'node:util',
    'events', 'node:events', 'react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'
  ]);

  pkgList.forEach(pkg => {
    if (!pkg) return;
    const lower = pkg.toLowerCase();
    if (nodeBuiltins.has(lower)) return;
    const parsed = parsePackagePath(pkg);
    if (nodeBuiltins.has(parsed.basePackage.toLowerCase()) || nodeBuiltins.has(parsed.fullPath.toLowerCase())) return;

    const fullCdnUrl = `https://esm.sh/${parsed.fullPath}${version && version !== 'latest' ? `@${version}` : ''}?bundle`;
    const baseCdnUrl = `https://esm.sh/${parsed.basePackage}${version && version !== 'latest' ? `@${version}` : ''}?bundle`;
    importsMap[parsed.fullPath] = fullCdnUrl;
    importsMap[parsed.fullPath.toLowerCase()] = fullCdnUrl;
    importsMap[parsed.basePackage] = baseCdnUrl;
    importsMap[parsed.basePackage.toLowerCase()] = baseCdnUrl;
  });

  const script = document.createElement('script');
  script.type = 'importmap';
  script.id = 'dynamic-sandbox-importmap';
  script.textContent = JSON.stringify({ imports: importsMap });
  document.head.appendChild(script);
}

export async function executeCodeInBrowser(
  codeOrFiles: string | Array<{ name: string; content: string; language: string }>,
  previewContainer: HTMLElement | null,
  packageName?: string,
  version?: string
): Promise<ExecutionResult> {
  const logs: ConsoleMessage[] = [];
  const startTime = performance.now();

  const code = typeof codeOrFiles === 'string'
    ? codeOrFiles
    : codeOrFiles.find(f => f.name === 'index.js')?.content || codeOrFiles[0]?.content || '';

  const detectedPkgs = extractPackagesFromCode(code, packageName);
  setupImportMap(detectedPkgs, version);

  // Console capture shims
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

  console.log = (...args: any[]) => { originalLog(...args); pushLog('log', args); };
  console.info = (...args: any[]) => { originalInfo(...args); pushLog('info', args); };
  console.warn = (...args: any[]) => { originalWarn(...args); pushLog('warn', args); };
  console.error = (...args: any[]) => { originalError(...args); pushLog('error', args); };
  console.table = (...args: any[]) => { originalTable(...args); pushLog('table', args); };

  let returnValue: any = undefined;
  let success = true;
  let errorDetails: { message: string; stack?: string } | undefined = undefined;
  let blobUrl: string | null = null;

  try {
    if (previewContainer) {
      previewContainer.innerHTML = '';
    }

    // Transpile with Babel
    let transpiledCode = code;
    try {
      const transformed = Babel.transform(code, {
        presets: ['react', 'typescript'],
        filename: 'index.tsx',
        sourceType: 'module',
      });
      if (transformed && transformed.code) {
        transpiledCode = transformed.code;
      }
    } catch (babelErr: any) {
      console.warn('Babel transform warning:', babelErr.message);
    }

    // If code uses PKG_IMPORT placeholder, replace it with esm.sh CDN url
    if (packageName) {
      const parsed = parsePackagePath(packageName);
      const pkgUrl = `https://esm.sh/${parsed.fullPath}${version && version !== 'latest' ? `@${version}` : ''}`;
      transpiledCode = transpiledCode.replace(/['"]PKG_IMPORT['"]/g, `'${pkgUrl}'`);
      transpiledCode = transpiledCode.replace(/PKG_IMPORT/g, pkgUrl);
    }

    const blob = new Blob([transpiledCode], { type: 'text/javascript' });
    blobUrl = URL.createObjectURL(blob);

    const module = await import(/* @vite-ignore */ blobUrl);
    returnValue = module.default ?? module;

    if (previewContainer) {
      try {
        const React = await import('react');
        const ReactDOM = await import('react-dom/client');
        if (typeof returnValue === 'function') {
          const root = (previewContainer as any).__reactRoot || ReactDOM.createRoot(previewContainer);
          (previewContainer as any).__reactRoot = root;
          root.render(React.createElement(returnValue));
        } else if (React.isValidElement(returnValue)) {
          const root = (previewContainer as any).__reactRoot || ReactDOM.createRoot(previewContainer);
          (previewContainer as any).__reactRoot = root;
          root.render(returnValue);
        }
      } catch (mountErr) {
        console.warn('Could not auto-mount component:', mountErr);
      }
    }
  } catch (err: any) {
    success = false;
    let msg = err.message || 'Execution error';
    if (msg.includes("Unexpected token '<'") || msg.includes("SyntaxError")) {
      msg = `Failed to load module/package from CDN or syntax error. (${msg})`;
    }
    errorDetails = { message: msg, stack: err.stack };
    logs.push({
      id: Math.random().toString(36).substring(2, 9),
      type: 'error',
      data: [msg],
      timestamp: Date.now(),
      stack: err.stack,
    });
  } finally {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
    console.table = originalTable;
  }

  return {
    success,
    returnValue,
    executionTimeMs: Math.round(performance.now() - startTime),
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
