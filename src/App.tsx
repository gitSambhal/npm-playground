/**
 * Main Application Component (`App.tsx`)
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchExplore } from './components/SearchExplore';
import { SandboxEditor } from './components/SandboxEditor';
import { PresetsView } from './components/PresetsView';
import { HistoryView, HistoryItem } from './components/HistoryView';
import { ChangelogModal } from './components/ChangelogModal';
import { PopularPackagePreset } from './utils/constants';
import { DEVELOPER_NAME, DEVELOPER_WEBSITE, APP_VERSION } from './utils/constants';
import { Sparkles, Package, ExternalLink } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'search' | 'editor' | 'templates' | 'history'>('search');
  const [activePackageName, setActivePackageName] = useState<string>('lodash-es');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [changelogOpen, setChangelogOpen] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('npmPlay_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
  }, []);

  // Parse URL on mount to support direct npm package testing via URL path / hash / query
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      const searchParams = new URLSearchParams(window.location.search);
      const queryPkg = searchParams.get('pkg') || searchParams.get('package') || searchParams.get('p');
      const pathname = window.location.pathname.replace(/^\/+/, '').trim();

      let targetPkg = '';
      if (queryPkg) {
        targetPkg = queryPkg;
      } else if (hash && !hash.startsWith('tabs/')) {
        targetPkg = hash;
      } else if (pathname && pathname !== '' && !pathname.includes('index.html')) {
        targetPkg = pathname;
      }

      if (targetPkg) {
        targetPkg = targetPkg.replace(/^(pkg|package)\//, '');
        setActivePackageName(targetPkg);
        setActiveTab('editor');
      }
    };

    parseUrl();
    window.addEventListener('hashchange', parseUrl);
    return () => window.removeEventListener('hashchange', parseUrl);
  }, []);

  // Update hash when active package or tab changes to keep URL in sync for Netlify hosting
  useEffect(() => {
    if (activeTab === 'editor' && activePackageName) {
      window.location.hash = `#/${activePackageName}`;
    }
  }, [activePackageName, activeTab]);

  const handleSaveHistory = (packageName: string, code: string, success: boolean) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      packageName,
      code,
      timestamp: Date.now(),
      success,
    };
    const updated = [newItem, ...history.filter(h => h.code !== code)].slice(0, 50);
    setHistory(updated);
    try {
      localStorage.setItem('npmPlay_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history', e);
    }
  };

  const handleSelectPackage = (packageName: string) => {
    setActivePackageName(packageName);
    setActiveTab('editor');
  };

  const handleOpenPreset = (preset: PopularPackagePreset) => {
    setActivePackageName(preset.name);
    setActiveTab('editor');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('npmPlay_history');
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors`}>
      
      {/* Navigation Header */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePackageName={activePackageName}
        historyCount={history.length}
        onOpenChangelog={() => setChangelogOpen(true)}
      />

      {/* Main Body View Switching */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <SearchExplore
            darkMode={darkMode}
            onSelectPackage={handleSelectPackage}
            onOpenPreset={handleOpenPreset}
          />
        )}

        {activeTab === 'editor' && (
          <SandboxEditor
            packageName={activePackageName}
            darkMode={darkMode}
            onBackToSearch={() => setActiveTab('search')}
            onSaveHistory={handleSaveHistory}
          />
        )}

        {activeTab === 'templates' && (
          <PresetsView
            darkMode={darkMode}
            onSelectPreset={handleOpenPreset}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            darkMode={darkMode}
            history={history}
            onSelectHistory={(item) => {
              setActivePackageName(item.packageName);
              setActiveTab('editor');
            }}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-zinc-800/80 bg-zinc-950/80 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white">NPM Package Playground</span>
            <span className="text-zinc-600">•</span>
            <span>In-browser local sandbox & auto-suggest</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setChangelogOpen(true)}
              className="hover:text-indigo-400 font-mono transition"
            >
              {APP_VERSION}
            </button>
            <span className="text-zinc-600">•</span>
            <div>
              Created by{' '}
              <a
                href={DEVELOPER_WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-400 hover:underline"
              >
                {DEVELOPER_NAME}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />

    </div>
  );
}
