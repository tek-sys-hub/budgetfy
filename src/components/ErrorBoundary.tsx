import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Caught by Boundary:', error, errorInfo);
  }

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(r => r.unregister());
        });
      }
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8FC] dark:bg-[#0B0F19] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-[#DDD7E8] dark:border-[#1F293D] shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#4A3561] dark:text-purple-300 flex items-center justify-center mx-auto text-3xl">
              💜
            </div>

            <h2 className="text-xl font-serif font-bold text-[#241930] dark:text-slate-100">
              budgetfy encountered a bump
            </h2>

            <p className="text-xs text-[#7F7094] dark:text-slate-400 leading-relaxed">
              No shame! A momentary glitch happened while rendering. You can reload the page or perform a quick fresh start.
            </p>

            {this.state.error && (
              <pre className="p-3 rounded-xl bg-purple-50 dark:bg-[#162032] border border-purple-200 dark:border-indigo-900 text-[11px] font-mono text-purple-900 dark:text-indigo-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#241930] dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload App
              </button>
              <button
                onClick={this.handleResetStorage}
                className="py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

