/**
 * NPM Registry & Package Introspection Service
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import { NpmPackageSearchResult, NpmPackageDetails, ExportedItem, CDNProvider } from '../types';
import { CDN_CONFIG } from './constants';

export async function searchNpmPackages(query: string, size = 12): Promise<NpmPackageSearchResult[]> {
  if (!query.trim()) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encoded}&size=${size}`);
    if (!res.ok) throw new Error(`NPM search error: ${res.statusText}`);
    const data = await res.json();
    return (data.objects || []).map((item: any) => ({
      name: item.package.name,
      version: item.package.version,
      description: item.package.description || 'No description provided.',
      keywords: item.package.keywords || [],
      date: item.package.date,
      publisher: item.package.publisher,
      links: item.package.links,
      score: item.score,
    }));
  } catch (err) {
    console.error('Failed to search npm packages:', err);
    return [];
  }
}

export interface ParsedPackagePath {
  fullPath: string;
  basePackage: string;
  subpath?: string;
}

export function parsePackagePath(input: string): ParsedPackagePath {
  const trimmed = input.trim();
  if (!trimmed) return { fullPath: '', basePackage: '' };

  if (trimmed.startsWith('@')) {
    const parts = trimmed.split('/');
    if (parts.length >= 2) {
      const basePackage = `${parts[0]}/${parts[1]}`;
      const subpath = parts.slice(2).join('/');
      return {
        fullPath: trimmed,
        basePackage,
        subpath: subpath || undefined,
      };
    }
  } else {
    const parts = trimmed.split('/');
    if (parts.length >= 1) {
      const basePackage = parts[0];
      const subpath = parts.slice(1).join('/');
      return {
        fullPath: trimmed,
        basePackage,
        subpath: subpath || undefined,
      };
    }
  }
  return { fullPath: trimmed, basePackage: trimmed };
}

export async function fetchPackageDetails(packageName: string): Promise<NpmPackageDetails | null> {
  if (!packageName.trim()) return null;
  const parsed = parsePackagePath(packageName);
  const basePkg = parsed.basePackage;
  if (!basePkg) return null;
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(basePkg)}`);
    if (!res.ok) {
      // Fallback: try unpkg package.json
      const unpkgRes = await fetch(`https://unpkg.com/${basePkg}/package.json`);
      if (unpkgRes.ok) {
        const unpkgData = await unpkgRes.json();
        return {
          name: parsed.fullPath,
          version: unpkgData.version,
          description: unpkgData.description || '',
          latestVersion: unpkgData.version,
          versions: [unpkgData.version],
          homepage: unpkgData.homepage,
          repositoryUrl: typeof unpkgData.repository === 'string' ? unpkgData.repository : unpkgData.repository?.url,
          license: unpkgData.license,
          author: unpkgData.author,
          keywords: unpkgData.keywords || [],
          dependencies: unpkgData.dependencies,
        };
      }
      return null;
    }
    const data = await res.json();
    const latestVersion = data['dist-tags']?.latest || Object.keys(data.versions || {}).pop() || 'latest';
    const latestMeta = data.versions?.[latestVersion] || {};
    const allVersions = Object.keys(data.versions || {}).reverse();

    return {
      name: parsed.fullPath,
      version: latestVersion,
      description: data.description || latestMeta.description || '',
      latestVersion,
      versions: allVersions.length > 0 ? allVersions : [latestVersion],
      homepage: data.homepage || latestMeta.homepage,
      repositoryUrl: typeof data.repository === 'string' ? data.repository : data.repository?.url,
      license: data.license || latestMeta.license || 'MIT',
      author: data.author || latestMeta.author,
      readme: data.readme,
      keywords: data.keywords || latestMeta.keywords || [],
      dependencies: latestMeta.dependencies,
      types: latestMeta.types || latestMeta.typings,
    };
  } catch (err) {
    console.error(`Failed to fetch details for ${packageName}:`, err);
    return null;
  }
}

export async function fetchPackageReadme(packageName: string, version?: string): Promise<string> {
  const parsed = parsePackagePath(packageName);
  const basePkg = parsed.basePackage;
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/npm/${basePkg}${version ? `@${version}` : ''}/README.md`);
    if (res.ok) {
      return await res.text();
    }
    // Fallback to unpkg
    const unpkgRes = await fetch(`https://unpkg.com/${basePkg}${version ? `@${version}` : ''}/README.md`);
    if (unpkgRes.ok) {
      return await unpkgRes.text();
    }
  } catch (e) {
    console.warn('Could not fetch README from CDN', e);
  }
  return '';
}

export async function introspectModuleExports(packageName: string, version?: string, provider: CDNProvider = 'esm.sh'): Promise<{
  exports: ExportedItem[];
  rawModule: any;
  error?: string;
}> {
  const url = CDN_CONFIG[provider](packageName, version);
  try {
    // Dynamic import directly inside browser
    const mod = await import(/* @vite-ignore */ url);
    const exports: ExportedItem[] = [];

    // Analyze default export
    if (mod.default !== undefined) {
      const defType = typeof mod.default;
      if (defType === 'function') {
        const isClass = /^class\s/.test(Function.prototype.toString.call(mod.default));
        exports.push({
          name: 'default',
          type: isClass ? 'class' : 'function',
          paramCount: mod.default.length,
          sampleCall: `import ${toValidIdentifier(packageName)} from '${url}';\n\nconsole.log(${toValidIdentifier(packageName)});`,
        });

        // Also check static methods on default
        try {
          const staticKeys = Object.getOwnPropertyNames(mod.default).filter(
            k => !['length', 'name', 'prototype'].includes(k) && typeof mod.default[k] === 'function'
          );
          for (const key of staticKeys.slice(0, 15)) {
            exports.push({
              name: `default.${key}`,
              type: 'function',
              paramCount: mod.default[key].length,
              sampleCall: `import ${toValidIdentifier(packageName)} from '${url}';\n\nconsole.log(${toValidIdentifier(packageName)}.${key}());`,
            });
          }
        } catch (_) {}
      } else if (defType === 'object' && mod.default !== null) {
        exports.push({
          name: 'default',
          type: 'object',
          sampleCall: `import ${toValidIdentifier(packageName)} from '${url}';\n\nconsole.log(Object.keys(${toValidIdentifier(packageName)}));`,
        });
      }
    }

    // Analyze named exports
    for (const key of Object.keys(mod)) {
      if (key === 'default' || key === '__esModule') continue;
      const val = mod[key];
      const valType = typeof val;

      if (valType === 'function') {
        const isClass = /^class\s/.test(Function.prototype.toString.call(val));
        exports.push({
          name: key,
          type: isClass ? 'class' : 'function',
          paramCount: val.length,
          sampleCall: `import { ${key} } from '${url}';\n\nconsole.log(${key}());`,
        });
      } else if (valType === 'object' && val !== null) {
        exports.push({
          name: key,
          type: 'object',
          sampleCall: `import { ${key} } from '${url}';\n\nconsole.log(${key});`,
        });
      } else {
        exports.push({
          name: key,
          type: 'primitive',
          sampleCall: `import { ${key} } from '${url}';\n\nconsole.log('${key} value:', ${key});`,
        });
      }
    }

    return { exports, rawModule: mod };
  } catch (err: any) {
    return {
      exports: [],
      rawModule: null,
      error: err.message || 'Failed to dynamically import module.',
    };
  }
}

export function toValidIdentifier(name: string): string {
  const cleaned = name.replace(/^@/, '').replace(/[\/-]/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  return cleaned || 'pkg';
}
