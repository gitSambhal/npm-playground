/**
 * Search & Explore Packages View Component
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import { Search, Package, Star, ArrowUpRight, Sparkles, Terminal, Shield, Download, ExternalLink, Code2 } from 'lucide-react';
import { NpmPackageSearchResult } from '../types';
import { searchNpmPackages } from '../utils/npmRegistry';
import { POPULAR_PACKAGES, PopularPackagePreset } from '../utils/constants';

interface SearchExploreProps {
  darkMode: boolean;
  onSelectPackage: (packageName: string, initialCode?: string) => void;
  onOpenPreset: (preset: PopularPackagePreset) => void;
}

export const SearchExplore: React.FC<SearchExploreProps> = ({
  darkMode,
  onSelectPackage,
  onOpenPreset,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NpmPackageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPackageInput, setCustomPackageInput] = useState('');

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchNpmPackages(query, 16);
      setResults(res);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPackageInput.trim()) {
      onSelectPackage(customPackageInput.trim());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Instant In-Browser ESM Sandbox & Auto-Suggest</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Test any <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-indigo-400 to-emerald-400">NPM Package</span> instantly
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto">
          Search the entire NPM registry, test modules in real-time using browser ES modules without build setups, and let AI-powered auto-suggest generate executable test snippets.
        </p>

        {/* Main Search Bar */}
        <div className="max-w-2xl mx-auto pt-4">
          <form onSubmit={handleDirectSubmit} className="relative flex items-center shadow-2xl shadow-indigo-500/10 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/90 focus-within:border-indigo-500 transition">
            <div className="pl-4 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages (e.g. lodash-es, axios, uuid, date-fns, zod)..."
              className="w-full bg-transparent px-4 py-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="pr-4 text-xs text-zinc-500 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition flex items-center space-x-1.5"
            >
              <span>Test</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Search Results Grid (if query active) */}
      {query.trim() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Search Results for "{query}"
            </h2>
            {loading && <span className="text-xs text-indigo-400 animate-pulse">Searching registry...</span>}
          </div>

          {results.length === 0 && !loading ? (
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
              <Package className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-400">No packages found matching "{query}".</p>
              <button
                onClick={() => onSelectPackage(query)}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium hover:bg-indigo-600 hover:text-white transition"
              >
                Test "{query}" directly anyway
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((pkg) => (
                <div
                  key={pkg.name}
                  onClick={() => onSelectPackage(pkg.name)}
                  className="group p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm group-hover:text-indigo-400 transition">
                            {pkg.name}
                          </h3>
                          <span className="text-[11px] font-mono text-zinc-500">
                            v{pkg.version}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {Math.round((pkg.score?.final || 0) * 100)}% score
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                    <div className="flex flex-wrap gap-1">
                      {(pkg.keywords || []).slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-indigo-400 font-medium">
                      <span className="flex items-center space-x-1">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Launch Sandbox</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Curated Popular Presets Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Curated Popular Presets</h2>
            <p className="text-xs text-zinc-400">One-click test environments for top-tier JavaScript libraries.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_PACKAGES.map((preset) => (
            <div
              key={preset.name}
              onClick={() => onOpenPreset(preset)}
              className="group p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {preset.category}
                  </span>
                  <Code2 className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                  {preset.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 group-hover:text-white transition">
                <span>{preset.snippets.length + 1} test snippet(s)</span>
                <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition flex items-center space-x-1">
                  <span>Run</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
