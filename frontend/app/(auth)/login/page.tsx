"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Tent, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/common/Logo";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  // login handler
  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await signIn("keycloak", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        console.error("Errore Login:", result.error);
        alert("Errore durante l'accesso SSO. Riprova.");
        setIsLoading(false);
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      console.error("Eccezione login:", e);
      setIsLoading(false);
    }
  };

  return (
    // main container
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      {/* container card */}
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-6 shadow-sm sm:p-8">
        {/* header + logo */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center mb-2 space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo />
            </div>
            <h1 className="text-primary text-2xl font-semibold tracking-tight">
              Camplendar
            </h1>
          </div>
        </div>

        {/* Form Area */}
        <div className="grid gap-4">
          <Button
            onClick={handleLogin}
            className="w-full h-11 font-medium"
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Connessione..." : "Accedi al sistema"}
          </Button>

          <p className="text-center text-xs text-muted-foreground px-2 pt-2">
            Verrai reindirizzato al sistema di autenticazione per completare
            l'accesso.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          &copy; {new Date().getFullYear()} Camplendar
        </div>
      </div>
    </div>
  );
}
