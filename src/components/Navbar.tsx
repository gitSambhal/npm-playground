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
  activeTab: 'search' | 'editor' | 'templates' | 'history';
  setActiveTab: (tab: 'search' | 'editor' | 'templates' | 'history') => void;
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
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 lg:px-6 py-2.5 transition-colors ${darkMode ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('search')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
            <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
              <Package className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`font-bold tracking-tight text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              npmPlay
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {APP_VERSION}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`hidden md:flex items-center space-x-1 p-1 rounded-xl border ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Editor</span>
            {activePackageName && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : darkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'}`}>
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenChangelog}
            className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
            }`}
            title="View Changelog"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>What's New</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border transition ${
              darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
            title="Toggle theme appearance"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

      </div>

      {/* Mobile Submenu Navigation */}
      <div className={`flex md:hidden items-center justify-around mt-2 pt-2 border-t text-xs ${darkMode ? 'border-zinc-800/80' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center space-x-1 ${activeTab === 'search' ? 'text-indigo-400 font-semibold' : darkMode ? 'text-zinc-400' : 'text-slate-600'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center space-x-1 ${activeTab === 'editor' ? 'text-indigo-400 font-semibold' : darkMode ? 'text-zinc-400' : 'text-slate-600'}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center space-x-1 ${activeTab === 'templates' ? 'text-indigo-400 font-semibold' : darkMode ? 'text-zinc-400' : 'text-slate-600'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-1 ${activeTab === 'history' ? 'text-indigo-400 font-semibold' : darkMode ? 'text-zinc-400' : 'text-slate-600'}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>
    </header>
  );
};
