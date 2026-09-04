/**
 * Navbar Component
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { Package, Search, Sun, Moon, Sparkles, Terminal, BookOpen, Clock, FileText } from 'lucide-react';
import { APP_VERSION } from '../utils/constants';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: 'search' | 'editor' | 'templates' | 'history' | 'changelog';
  setActiveTab: (tab: 'search' | 'editor' | 'templates' | 'history' | 'changelog') => void;
  activePackageName?: string;
  historyCount: number;
  onOpenChangelog: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  activePackageName,
  historyCount,
  onOpenChangelog,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('search')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-indigo-600 p-0.5 shadow-lg shadow-red-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Package className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold tracking-tight text-white text-base md:text-lg">
                npmPlay
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              In-Browser NPM Package Sandbox & Code Suggester
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Sandbox Editor</span>
            {activePackageName && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenChangelog}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            title="View Changelog"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Changelog</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Toggle theme appearance"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

      </div>

      {/* Mobile Submenu Navigation */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-3 border-t border-zinc-800/80 text-xs">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-1 ${activeTab === 'search' ? 'text-indigo-400 font-semibold' : 'text-zinc-400'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center space-x-1 ${activeTab === 'editor' ? 'text-indigo-400 font-semibold' : 'text-zinc-400'}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center space-x-1 ${activeTab === 'templates' ? 'text-indigo-400 font-semibold' : 'text-zinc-400'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1 ${activeTab === 'history' ? 'text-indigo-400 font-semibold' : 'text-zinc-400'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>
    </header>
  );
};
