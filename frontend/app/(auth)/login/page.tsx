"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const handleLogin = async () => {
    // Aggiungiamo un log per vedere se parte
    console.log("Tentativo di login...");
    
    try {
      // 1. Specifica 'keycloak' (deve coincidere con l'id nel route.ts)
      // 2. redirect: false ci permette di vedere l'errore in console se fallisce
      const result = await signIn("keycloak", { 
        callbackUrl: "/bookings", // o "/" se hai messo il redirect nella home
        redirect: false 
      });

      console.log("Risultato SignIn:", result);

      if (result?.error) {
        console.error("Errore Login NextAuth:", result.error);
        alert("Errore Login: " + result.error);
      } else if (result?.url) {
        // Se va tutto bene, forziamo il redirect manuale
        window.location.href = result.url;
      }
    } catch (e) {
      console.error("Eccezione durante il login:", e);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Swam Management</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-sm text-gray-500">
            Area riservata al personale.
          </p>
          <Button onClick={handleLogin} className="w-full">
            Accedi con Keycloak
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}