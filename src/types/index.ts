/**
 * NPM Package Playground Types
 * Developer: Suhail Akhtar (https://suhail.top)
 */

export type CDNProvider = 'esm.sh' | 'jsdelivr' | 'unpkg' | 'skypack';

export interface NpmPackageSearchResult {
  name: string;
  version: string;
  description: string;
  keywords?: string[];
  date?: string;
  publisher?: {
    username: string;
    email: string;
  };
  links?: {
    npm?: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  score?: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
}

export interface NpmPackageDetails {
  name: string;
  version: string;
  description: string;
  latestVersion: string;
  versions: string[];
  homepage?: string;
  repositoryUrl?: string;
  license?: string;
  author?: string | { name: string; email?: string; url?: string };
  readme?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  types?: string;
  unpackedSize?: number;
  gzipSize?: number;
}

export interface ExportedItem {
  name: string;
  type: 'function' | 'class' | 'object' | 'primitive' | 'unknown';
  paramCount?: number;
  sampleCall?: string;
  docSnippet?: string;
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'table' | 'return';
  data: any[];
  timestamp: number;
  stack?: string;
}

export interface ExecutionResult {
  success: boolean;
  returnValue?: any;
  executionTimeMs: number;
  logs: ConsoleMessage[];
  error?: {
    message: string;
    stack?: string;
  };
}

export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  code: string;
  tags?: string[];
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
