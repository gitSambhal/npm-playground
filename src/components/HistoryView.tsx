/**
 * History View Component
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React from 'react';
import { Clock, Terminal, Trash2, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export interface HistoryItem {
  id: string;
  packageName: string;
  code: string;
  timestamp: number;
  success: boolean;
}

interface HistoryViewProps {
  darkMode: boolean;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  darkMode,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono">
            <Clock className="w-4 h-4" />
            <span>Local Execution History</span>
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recent Tests & Experiments</h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center space-y-3 ${darkMode ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <Clock className="w-10 h-10 text-zinc-500 mx-auto" />
          <h3 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>No test history yet</h3>
          <p className={`text-xs max-w-sm mx-auto ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
            Packages and scripts you test in the sandbox will be saved here automatically for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className={`p-4 rounded-2xl transition cursor-pointer flex items-center justify-between group shadow-lg ${
                darkMode 
                  ? 'bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-zinc-100' 
                  : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-500/50 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-xl mt-0.5 ${item.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {item.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-bold text-sm transition ${darkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                      {item.packageName}
                    </h3>
                    <span className={`text-[11px] ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <pre className={`text-xs font-mono line-clamp-1 max-w-md p-1.5 rounded border ${darkMode ? 'text-zinc-400 bg-zinc-950 border-zinc-800/80' : 'text-slate-700 bg-slate-100 border-slate-200'}`}>
                    {item.code}
                  </pre>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-medium">
                <span className="opacity-0 group-hover:opacity-100 transition">Rerun</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
