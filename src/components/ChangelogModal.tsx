/**
 * Changelog Modal Component
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { X, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { APP_VERSION } from '../utils/constants';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Changelog & What's New</h2>
              <span className="text-xs text-zinc-400 font-mono">Current Version: {APP_VERSION}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-zinc-300">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs">
                {APP_VERSION}
              </span>
              <span className="text-xs text-zinc-500">September 2026</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Initial Release - NPM Package Playground</h3>
            
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Dynamic In-Browser ESM Engine:</strong> Test any npm package instantly via ESM CDNs (`esm.sh`, `jsdelivr`, `unpkg`) without build steps.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>NPM Registry Search:</strong> Live search across millions of npm packages with keyword filters and score badges.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Intelligent Auto-Suggest Code Functions:</strong> Introspects module exports and auto-generates executable test snippets.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Rich Interactive Console & DOM Preview Stage:</strong> Captures `console.log`, `console.table`, errors, and mounts UI/Canvas graphics.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Curated Library Presets:</strong> Pre-loaded test scripts for lodash-es, date-fns, zod, mathjs, nanoid, chroma-js, fuse.js, and canvas-confetti.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs text-zinc-500">
          <span>Developed by <a href="https://suhail.top" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Suhail Akhtar</a></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
