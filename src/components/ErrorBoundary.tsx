import React from 'react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected interface error occurred.'
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B16] text-[#F4F7FB] flex items-center justify-center p-6">
          <div className="max-w-lg w-full glass-panel rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-semibold">MAMO MED AI — Diagnostic Recovery</h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              A component encountered an unexpected state. Your session data remains protected.
            </p>
            <div className="rounded-lg bg-[#050B16]/80 border border-white/10 p-3 text-xs font-mono-tabular text-[#22D3EE] break-words">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-3d-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
