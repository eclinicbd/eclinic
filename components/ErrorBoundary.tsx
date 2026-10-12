import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component {
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props as any);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-lg shadow-xl">
            <h1 className="text-2xl font-bold text-rose-400 mb-2">কিছু একটি সমস্যা হয়েছে</h1>
            <p className="text-slate-300 text-sm mb-4">
              {this.state.error?.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.reload();
                }}
                className="px-4 py-2 bg-primary hover:bg-sky-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                ক্যাশ ক্লিয়ার করে রিলোড দিন
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
