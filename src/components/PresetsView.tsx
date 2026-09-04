/**
 * Presets View Component
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { Sparkles, Terminal, ArrowUpRight, Code2 } from 'lucide-react';
import { POPULAR_PACKAGES, PopularPackagePreset } from '../utils/constants';

interface PresetsViewProps {
  darkMode: boolean;
  onSelectPreset: (preset: PopularPackagePreset) => void;
}

export const PresetsView: React.FC<PresetsViewProps> = ({ darkMode, onSelectPreset }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated JavaScript Library Presets</span>
        </div>
        <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Explore Popular NPM Packages
        </h1>
        <p className={`text-sm max-w-2xl ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
          Instantly test and inspect battle-tested utility, validation, date, math, and animation packages with pre-built executable code templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POPULAR_PACKAGES.map((preset) => (
          <div
            key={preset.name}
            onClick={() => onSelectPreset(preset)}
            className={`group p-6 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-5 shadow-xl ${
              darkMode 
                ? 'bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-100' 
                : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-slate-900 shadow-sm'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {preset.category}
                </span>
                <Code2 className={`w-4 h-4 transition ${darkMode ? 'text-zinc-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              </div>
              <h3 className={`text-lg font-bold transition ${darkMode ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                {preset.name}
              </h3>
              <p className={`text-xs leading-relaxed ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {preset.description}
              </p>
            </div>

            <div className={`space-y-3 pt-4 border-t ${darkMode ? 'border-zinc-800/80' : 'border-slate-100'}`}>
              <div className={`text-[11px] ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                Includes {preset.snippets.length + 1} test script(s)
              </div>
              <button
                className="w-full py-2.5 rounded-xl bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-600 dark:text-indigo-300 group-hover:text-white font-medium text-xs transition flex items-center justify-center space-x-1.5 border border-indigo-500/30 group-hover:border-transparent"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Launch in Sandbox</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
