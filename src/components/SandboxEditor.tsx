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
  darkMode: boolean;
  onBackToSearch: () => void;
  onSaveHistory: (pkg: string, code: string, success: boolean) => void;
}

export const SandboxEditor: React.FC<SandboxEditorProps> = ({
  packageName,
  darkMode,
  onBackToSearch,
  onSaveHistory,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('latest');
  const [pkgDetails, setPkgDetails] = useState<NpmPackageDetails | null>(null);
  const [readme, setReadme] = useState<string>('');
  const [exportsList, setExportsList] = useState<ExportedItem[]>([]);
  
  // Multi-file state
  const [files, setFiles] = useState<SandboxFile[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>('index.js');
  
  const [loadingPkg, setLoadingPkg] = useState<boolean>(true);
  const [loadingIntrospect, setLoadingIntrospect] = useState<boolean>(false);
  
  // New file modal state
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileDialog, setShowNewFileDialog] = useState<boolean>(false);
  
  // Theme & formatting state
  const [selectedTheme, setSelectedTheme] = useState<string>(darkMode ? 'dracula' : 'github-light');

  useEffect(() => {
    setSelectedTheme(darkMode ? 'dracula' : 'github-light');
  }, [darkMode]);

  const [formatting, setFormatting] = useState<boolean>(false);
  const currentTheme = EDITOR_THEMES.find(t => t.id === selectedTheme) || EDITOR_THEMES[0];

  const activeFile = files.find(f => f.name === activeFileName) || files[0] || { name: 'index.js', content: '', language: 'javascript' };

  const filesRef = useRef(files);
  filesRef.current = files;
  const activeFileNameRef = useRef(activeFileName);
  activeFileNameRef.current = activeFileName;

  const handleCodeChange = (newContent: string | undefined) => {
    if (newContent === undefined) return;
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: newContent } : f));
  };

  const handleFormatCode = async () => {
    setFormatting(true);
    const formatted = await formatJavaScriptCode(activeFile.content);
    handleCodeChange(formatted);
    setFormatting(false);
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Add Ctrl+Enter / Cmd+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const val = editor.getValue();
      const updatedFiles = filesRef.current.map(f => f.name === activeFileNameRef.current ? { ...f, content: val } : f);
      runCode(updatedFiles);
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
      const version = details?.latestVersion || 'latest';
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

      // Generate initial test code & files
      const defaultCode = generateDefaultCodeForPackage(packageName, version, exports);
      const packageJsonContent = JSON.stringify({
        name: packageName.replace(/[\/@]/g, '-'),
        version: '1.0.0',
        description: details?.description || 'Sandbox test package',
        main: 'index.js',
        dependencies: {
          [packageName]: version
        }
      }, null, 2);

      const utilsContent = `// Helper module for testing ${packageName}\nexport function logTestInfo(info) {\n  console.log('[Test Utils]:', info);\n}\n`;

      const initialFiles: SandboxFile[] = [
        { name: 'index.js', content: defaultCode, language: 'javascript' },
        { name: 'utils.js', content: utilsContent, language: 'javascript' },
        { name: 'package.json', content: packageJsonContent, language: 'json' },
      ];

      setFiles(initialFiles);
      setActiveFileName('index.js');

      // Auto run initial code once loaded
      setTimeout(() => {
        runCode(defaultCode);
      }, 200);
    }

    loadPackageData();
    return () => {
      isMounted = false;
    };
  }, [packageName]);

  const runCode = async (overrideFilesOrCode?: Array<{ name: string; content: string; language: string }> | string) => {
    setExecuting(true);
    setLogs([]);
    setHasError(false);

    let filesToRun = files;
    if (typeof overrideFilesOrCode === 'string') {
      filesToRun = files.map(f => f.name === 'index.js' ? { ...f, content: overrideFilesOrCode } : f);
    } else if (Array.isArray(overrideFilesOrCode)) {
      filesToRun = overrideFilesOrCode;
    }

    const currentCode = filesToRun.find(f => f.name === 'index.js')?.content || activeFile.content;

    const versionArg = selectedVersion === 'latest' ? undefined : selectedVersion;
    const result = await executeCodeInBrowser(filesToRun, previewStageRef.current, packageName, versionArg);

    setLogs(result.logs);
    setExecutionTime(result.executionTimeMs);
    setHasError(!result.success);
    setExecuting(false);

    onSaveHistory(packageName, currentCode, result.success);

    if (packageName.includes('confetti') && previewStageRef.current) {
      setRightTab('preview');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsertSnippet = (snippet: string) => {
    setActiveFileName('index.js');
    handleCodeChange(snippet);
    runCode(snippet);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const fileName = newFileName.trim().endsWith('.js') || newFileName.trim().endsWith('.json') || newFileName.trim().endsWith('.md') 
      ? newFileName.trim() 
      : `${newFileName.trim()}.js`;

    if (files.some(f => f.name === fileName)) {
      alert('File already exists.');
      return;
    }

    const lang = fileName.endsWith('.json') ? 'json' : fileName.endsWith('.md') ? 'markdown' : 'javascript';
    const newFile: SandboxFile = {
      name: fileName,
      content: lang === 'json' ? '{\n  \n}' : `// ${fileName}\n`,
      language: lang,
    };

    setFiles([...files, newFile]);
    setActiveFileName(fileName);
    setNewFileName('');
    setShowNewFileDialog(false);
  };

  const handleDeleteFile = (fileName: string) => {
    if (files.length <= 1) {
      alert('You must keep at least one file.');
      return;
    }
    const updated = files.filter(f => f.name !== fileName);
    setFiles(updated);
    if (activeFileName === fileName) {
      setActiveFileName(updated[0].name);
    }
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
                onChange={(e) => setSelectedVersion(e.target.value)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border outline-none ${
                  darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {pkgDetails?.versions?.slice(0, 15).map(v => (
                  <option key={v} value={v}>{v}</option>
                )) || <option value={selectedVersion}>{selectedVersion}</option>}
              </select>
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
          
          {/* File Tabs Bar */}
          <div className={`flex items-center justify-between px-3 py-1.5 border-b overflow-x-auto ${darkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
            <div className="flex items-center space-x-1.5">
              {files.map(file => (
                <div
                  key={file.name}
                  onClick={() => setActiveFileName(file.name)}
                  className={`group flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono cursor-pointer transition ${
                    activeFileName === file.name
                      ? darkMode ? 'bg-indigo-600 text-white shadow' : 'bg-white text-indigo-600 shadow-sm font-semibold'
                      : darkMode ? 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {file.name.endsWith('.json') ? <FileJson className="w-3.5 h-3.5 text-amber-400" /> : <FileCode className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{file.name}</span>
                  {files.length > 1 && file.name !== 'index.js' && file.name !== 'package.json' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 ml-1 text-xs"
                      title="Close file"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNewFileDialog(true)}
              className={`p-1 rounded border text-xs flex items-center space-x-1 transition ${
                darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
              }`}
              title="New File"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">New File</span>
            </button>
          </div>

          {/* New File Modal Dialog */}
          {showNewFileDialog && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleCreateFile} className={`w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <h3 className="font-bold text-base">Create New File</h3>
                <p className={`text-xs ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Enter file name (e.g., <code className="font-mono text-indigo-400">helpers.js</code>, <code className="font-mono text-indigo-400">config.json</code>):
                </p>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. helpers.js"
                  autoFocus
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono outline-none ${
                    darkMode ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                  }`}
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFileDialog(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border ${darkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Monaco Editor Instance */}
          <div className="flex-1 min-h-[420px]">
            <Editor
              height="100%"
              language={activeFile.language}
              theme={selectedTheme}
              value={activeFile.content}
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
