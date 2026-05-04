'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center border rounded-2xl bg-surface/50 border-border">
          <AlertCircle className="w-10 h-10 mb-4 text-red-500 opacity-80" />
          <h3 className="mb-2 text-lg font-bold text-on-surface">Something went wrong</h3>
          <p className="mb-4 text-sm text-on-surface-variant max-w-md">
            {this.state.error?.message || 'We encountered an error loading this component.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium transition-colors border rounded-full text-on-surface bg-surface border-border hover:bg-surface-variant"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
