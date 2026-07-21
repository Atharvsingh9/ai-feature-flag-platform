import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-bg p-8" role="alert">
          <div className="card flex max-w-md flex-col items-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
              <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink-900">Something went wrong</h2>
              <p className="mt-2 text-sm text-ink-500">
                {this.state.error?.message || "An unexpected error occurred. Please try again."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="primary" onClick={() => window.location.href = "/"}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
