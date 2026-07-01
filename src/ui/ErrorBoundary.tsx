import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./components";

type ErrorBoundaryState = {
  error?: Error;
};

class ErrorBoundaryInner extends React.Component<React.PropsWithChildren<{ onDashboard: () => void }>, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  retry = () => {
    this.setState({ error: undefined });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f7f9fc] p-5">
          <section className="grid w-full max-w-[560px] gap-4 rounded-[7px] border border-brand-line bg-white p-8 shadow-[0_18px_50px_rgba(47,58,76,0.08)]" role="alert" aria-live="assertive">
            <p className="m-0 text-sm text-[#666]">Something went wrong</p>
            <h1 className="m-0 text-xl font-bold text-brand-ink">We could not render this screen.</h1>
            <p className="text-sm text-brand-muted">Please retry. If the issue continues, return to the dashboard and try again.</p>
            <code className="rounded-[7px] bg-[#fff0f2] px-3 py-2 text-left text-sm text-[#bb2735] break-all">
              {this.state.error.message || "Unexpected application error"}
            </code>
            <div className="mt-2 flex items-center justify-end gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <Button variant="secondary" type="button" onClick={this.retry}>
                Retry
              </Button>
              <Button type="button" onClick={this.props.onDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate();
  return <ErrorBoundaryInner onDashboard={() => navigate("/dashboard")}>{children}</ErrorBoundaryInner>;
};
