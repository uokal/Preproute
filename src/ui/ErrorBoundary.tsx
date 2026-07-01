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

  retry = () => {
    this.setState({ error: undefined });
  };

  render() {
    if (this.state.error) {
      return (
        <main className="mx-auto grid min-h-[calc(100vh-180px)] max-w-[760px] place-items-center text-center">
          <section className="grid gap-4 rounded-[7px] border border-brand-line bg-white p-8 shadow-[0_18px_50px_rgba(47,58,76,0.08)]" role="alert" aria-live="assertive">
            <p className="m-0 text-base text-[#666]">Something went wrong</p>
            <h1 className="m-0 text-2xl font-bold">We could not render this screen.</h1>
            <p className="text-brand-muted">Please retry. If the issue continues, return to the dashboard and try again.</p>
            <code className="rounded-[7px] bg-[#fff0f2] px-3 py-2 text-left text-sm text-[#bb2735]">{this.state.error.message || "Unexpected application error"}</code>
            <div className="mt-2.5 flex items-center justify-end gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
              <Button variant="secondary" type="button" onClick={this.retry}>
                Retry
              </Button>
              <Button type="button" onClick={this.props.onDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate();
  return <ErrorBoundaryInner onDashboard={() => navigate("/dashboard")}>{children}</ErrorBoundaryInner>;
};
