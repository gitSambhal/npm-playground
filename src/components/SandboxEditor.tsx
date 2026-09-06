/**
 * Sandbox Editor View Component with Live Console, Code Editor & Multi-file Support
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Copy, Check, Terminal, BookOpen, Layers, Sparkles, 
  Settings, ExternalLink, Download, FileCode, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, Cpu, Database, Eye, Code, ArrowLeft, Plus, FileJson, FileText 
} from 'lucide-react';
import { CDNProvider, ExportedItem, ConsoleMessage, NpmPackageDetails } from '../types';
import { CDN_CONFIG } from '../utils/constants';
import { fetchPackageDetails, fetchPackageReadme, introspectModuleExports } from '../utils/npmRegistry';
import { generateDefaultCodeForPackage, generateFunctionSnippet } from '../utils/codeGenerators';
import { executeCodeInBrowser } from '../utils/codeRunner';
import { formatJavaScriptCode } from '../utils/formatter';
import { EDITOR_THEMES } from '../utils/themes';
import Editor from '@monaco-editor/react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';

interface SandboxFile {
  name: string;
  content: string;
  language: string;
}

interface SandboxEditorProps {
  packageName: string;
  initialVersion?: string;
  darkMode: boolean;
  onBackToSearch: () => void;
  onSaveHistory: (pkg: string, code: string, success: boolean) => void;
  onVersionChange?: (version: string) => void;
}

export const SandboxEditor: React.FC<SandboxEditorProps> = ({
  packageName,
  initialVersion,
  darkMode,
  onBackToSearch,
  onSaveHistory,
  onVersionChange,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(initialVersion || 'latest');
  const [pkgDetails, setPkgDetails] = useState<NpmPackageDetails | null>(null);
  const [readme, setReadme] = useState<string>('');
  const [exportsList, setExportsList] = useState<ExportedItem[]>([]);
  
  // Single file code state for quick testing
  const [code, setCode] = useState<string>('');
  
  const [loadingPkg, setLoadingPkg] = useState<boolean>(true);
  const [loadingIntrospect, setLoadingIntrospect] = useState<boolean>(false);
  
  // Theme & formatting state
  const [selectedTheme, setSelectedTheme] = useState<string>(darkMode ? 'dracula' : 'github-light');

  useEffect(() => {
    setSelectedTheme(darkMode ? 'dracula' : 'github-light');
  }, [darkMode]);

  const [formatting, setFormatting] = useState<boolean>(false);
  const currentTheme = EDITOR_THEMES.find(t => t.id === selectedTheme) || EDITOR_THEMES[0];

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined) return;
    setCode(newContent);
  };

  const handleFormatCode = async () => {
    setFormatting(true);
    const formatted = await formatJavaScriptCode(code);
    setCode(formatted);
    setFormatting(false);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Add Ctrl+Enter / Cmd+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const val = editor.getValue();
      runCode(val);
    });
  };

  const handleEditorBeforeMount = (monaco: any) => {
    EDITOR_THEMES.forEach((theme) => {
      const isLight = theme.id === 'github-light';
      monaco.editor.defineTheme(theme.id, {
        base: isLight ? 'vs' : 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': theme.bg,
          'editor.foreground': theme.text,
          'editorLineNumber.foreground': theme.gutterText,
          'editorLineNumber.activeForeground': theme.accent,
          'editor.selectionBackground': theme.selection,
          'editorCursor.foreground': theme.accent,
          'editor.lineHighlightBackground': theme.gutterBg,
        },
      });
    });
  };
  
  // Execution state
  const [executing, setExecuting] = useState<boolean>(false);
  const [logs, setLogs] = useState<ConsoleMessage[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  // UI Tabs & Views
  const [rightTab, setRightTab] = useState<'console' | 'preview' | 'exports' | 'readme' | 'info'>('console');
  const [copied, setCopied] = useState<boolean>(false);

  const previewStageRef = useRef<HTMLDivElement>(null);

  // Load package metadata and exports
  useEffect(() => {
    let isMounted = true;
    async function loadPackageData() {
      if (!packageName) return;
      setLoadingPkg(true);
      setLoadingIntrospect(true);

      const details = await fetchPackageDetails(packageName);
      if (!isMounted) return;
      
      setPkgDetails(details);
      const version = initialVersion || details?.latestVersion || 'latest';
      setSelectedVersion(version);

      // Fetch README
      const readmeMd = await fetchPackageReadme(packageName, version);
      if (isMounted) setReadme(readmeMd);

      // Introspect exports
      const introspectRes = await introspectModuleExports(packageName, version);
      if (!isMounted) return;

      const exports = introspectRes.exports;
      setExportsList(exports);
      setLoadingIntrospect(false);
      setLoadingPkg(false);

      // Generate initial test code
      const defaultCode = generateDefaultCodeForPackage(packageName, version, exports);
      setCode(defaultCode);

      // Auto run initial code once loaded
      setTimeout(() => {
        runCode(defaultCode);
      }, 200);
    }

    loadPackageData();
    return () => {
      isMounted = false;
    };
  }, [packageName, initialVersion]);

  const handleVersionChange = async (newVersion: string) => {
    setSelectedVersion(newVersion);
    if (onVersionChange) {
      onVersionChange(newVersion);
    }
    setLoadingIntrospect(true);
    const readmeMd = await fetchPackageReadme(packageName, newVersion);
    setReadme(readmeMd);

    const introspectRes = await introspectModuleExports(packageName, newVersion);
    setExportsList(introspectRes.exports);
    setLoadingIntrospect(false);
  };

  const runCode = async (overrideCode?: string) => {
    setExecuting(true);
    setLogs([]);
    setHasError(false);

    const codeToRun = overrideCode !== undefined ? overrideCode : code;
    const versionArg = selectedVersion === 'latest' ? undefined : selectedVersion;
    const result = await executeCodeInBrowser(codeToRun, previewStageRef.current, packageName, versionArg);

    setLogs(result.logs);
    setExecutionTime(result.executionTimeMs);
    setHasError(!result.success);
    setExecuting(false);

    onSaveHistory(packageName, codeToRun, result.success);

    if ((packageName.includes('confetti') || packageName.includes('react')) && previewStageRef.current) {
      setRightTab('preview');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSnippet = (snippet: string) => {
    setCode(snippet);
    runCode(snippet);
  };

  return (
    <div className={`min-h-[calc(100vh-50px)] flex flex-col ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Minimal Toolbar */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToSearch}
            className={`p-1.5 rounded-lg border transition flex items-center space-x-1 text-xs font-medium ${
              darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-sm tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {packageName}
              </h2>
              <select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border outline-none ${
                  darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {pkgDetails?.versions?.map(v => (
                  <option key={v} value={v}>{v}</option>
                )) || <option value={selectedVersion}>{selectedVersion}</option>}
              </select>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                v{selectedVersion} Loaded
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFormatCode}
            disabled={formatting}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition flex items-center space-x-1 ${
              darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            title="Format Code"
          >
            <Code className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">{formatting ? 'Formatting...' : 'Format'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition flex items-center space-x-1 ${
              darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => runCode()}
            disabled={executing}
            className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center space-x-1 shadow-md shadow-indigo-600/20"
          >
            {executing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        
        {/* Left Code Editor Panel with Multi-file Tabs */}
        <div className={`lg:col-span-7 flex flex-col border-r ${darkMode ? 'border-zinc-800 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
          
          {/* Single File Header Bar */}
          <div className={`flex items-center justify-between px-3 py-1.5 border-b ${darkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>index.js (Single File Quick Test)</span>
            </div>
            <div className="text-[11px] opacity-70">Press Ctrl+Enter to Run</div>
          </div>

          {/* Monaco Editor Instance */}
          <div className="flex-1 min-h-[420px]">
            <Editor
              height="100%"
              language="javascript"
              theme={selectedTheme}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              beforeMount={handleEditorBeforeMount}
              options={{
                minimap: { enabled: true, scale: 0.75, showSlider: 'always' },
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                lineNumbers: 'on',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                folding: true,
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </div>

        {/* Right Output Console & Details Panel */}
        <div className={`lg:col-span-5 flex flex-col ${darkMode ? 'bg-zinc-950' : 'bg-white'}`}>
          
          {/* Output Tabs Header */}
          <div className={`flex items-center justify-between px-4 py-2 border-b text-xs font-medium overflow-x-auto ${darkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRightTab('console')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  rightTab === 'console' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : darkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console</span>
                {logs.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${hasError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {logs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRightTab('preview')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  rightTab === 'preview' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : darkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => setRightTab('exports')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  rightTab === 'exports' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : darkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Exports</span>
              </button>

              <button
                onClick={() => setRightTab('readme')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-medium transition ${
                  rightTab === 'readme' 
                    ? 'bg-indigo-600 text-white shadow' 
                    : darkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>README</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panels */}
          <div className={`flex-1 min-h-[420px] max-h-[500px] overflow-y-auto p-4 font-mono text-xs ${darkMode ? 'bg-zinc-950 text-zinc-200' : 'bg-slate-50 text-slate-800'}`}>
            
            {/* Console Output Tab */}
            {rightTab === 'console' && (
              <div className="space-y-3">
                <div className={`flex items-center justify-between pb-2 border-b text-[11px] ${darkMode ? 'border-zinc-900 text-zinc-500' : 'border-slate-200 text-slate-500'}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <span>Execution time: {executionTime}ms</span>
                  </div>
                  <button
                    onClick={() => setLogs([])}
                    className={`flex items-center space-x-1 ${darkMode ? 'hover:text-zinc-300 text-zinc-500' : 'hover:text-slate-900 text-slate-500'}`}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                {logs.length === 0 ? (
                  <div className={`text-center py-16 space-y-2 ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                    <Terminal className="w-8 h-8 mx-auto opacity-40" />
                    <p>Run code to view output logs here.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-xl border ${
                        log.type === 'error'
                          ? darkMode ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
                          : log.type === 'warn'
                          ? darkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                          : darkMode ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] uppercase font-semibold tracking-wider ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                          {log.type}
                        </span>
                        <span className={`text-[10px] ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1.5 overflow-x-auto whitespace-pre-wrap">
                        {log.data.map((item, idx) => (
                          <div key={idx}>
                            {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* DOM Preview Stage Tab */}
            {rightTab === 'preview' && (
              <div className="space-y-4">
                <p className={`text-[11px] ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                  Interactive stage container for UI components, canvas animations, and rendered elements.
                </p>
                <div
                  ref={previewStageRef}
                  id="preview-stage"
                  className={`w-full min-h-[340px] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden text-center border ${
                    darkMode ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                  }`}
                >
                  <div className={`space-y-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    <Eye className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs">Preview stage is ready.</p>
                    <p className={`text-[10px] ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>Trigger canvas animations or mount UI to see results here.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Module Exports Introspection Tab */}
            {rightTab === 'exports' && (
              <div className="space-y-3">
                <div className={`flex items-center justify-between pb-2 border-b text-[11px] ${darkMode ? 'border-zinc-900 text-zinc-500' : 'border-slate-200 text-slate-500'}`}>
                  <span>Detected Module Exports ({exportsList.length})</span>
                  {loadingIntrospect && <span className="animate-pulse text-indigo-500 dark:text-indigo-400">Introspecting...</span>}
                </div>

                {exportsList.length === 0 ? (
                  <div className={`text-center py-12 ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                    <p>No exports found or introspection failed.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {exportsList.map((exp) => (
                      <div
                        key={exp.name}
                        onClick={() => {
                          const snippet = generateFunctionSnippet(packageName, exp, selectedVersion === 'latest' ? undefined : selectedVersion);
                          handleInsertSnippet(snippet);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                          darkMode 
                            ? 'bg-zinc-950 border-zinc-800 hover:border-indigo-500/50 text-zinc-100' 
                            : 'bg-white border-slate-200 hover:border-indigo-500/50 text-slate-900 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold transition ${darkMode ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                              {exp.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${darkMode ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {exp.type}
                            </span>
                          </div>
                          <p className={`text-[11px] font-sans line-clamp-1 ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                            {exp.sampleCall || 'Click to insert test snippet'}
                          </p>
                        </div>
                        <span className="text-xs text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                          Test +
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* README Tab */}
            {rightTab === 'readme' && (
              <div className={`space-y-4 font-sans text-xs leading-relaxed ${darkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                {readme ? (
                  <div className={`prose max-w-none ${darkMode ? 'prose-invert text-zinc-300' : 'text-slate-800'}`}>
                    <Markdown>{readme}</Markdown>
                  </div>
                ) : (
                  <div className={`text-center py-16 font-mono ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                    <p>No README available or failed to load from CDN.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
