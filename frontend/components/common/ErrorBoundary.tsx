"use client";

import { Button } from "@/components/ui/button";
import { CircleX, RotateCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg mx-4 md:mx-0 text-center border">
            <div className="flex justify-center mb-4">
              <CircleX className="h-16 w-16 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-destructive">
              Qualcosa è andato storto!
            </h1>
            <p className="mb-6 text-muted-foreground">
              Ci dispiace, si è verificato un errore durante il caricamento
              della pagina.
            </p>
            <Button
              onClick={this.handleReload}
              className="px-6 py-2 bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-all"
            >
              <RotateCw className="h-4 w-4" />
              Ricarica la pagina
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
