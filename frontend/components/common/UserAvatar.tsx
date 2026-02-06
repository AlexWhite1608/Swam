"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function UserAvatar() {
  const { data: session } = useSession();
  const user = session?.user;

  // name initials
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  const handleLogout = async () => {
    // local logout from NextAuth
    await signOut({ redirect: false });

    // url config for Keycloak logout
    const issuerUrl =
      process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER ||
      "http://localhost:8180/realms/swam-realm";
    const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout`;

    const params = new URLSearchParams();
    params.set("post_logout_redirect_uri", window.location.origin + "/login");
    
    if (session?.idToken) {
      params.set("id_token_hint", session.idToken);
    } else {
      params.set("client_id", "swam-frontend");
      params.set("ui_locales", "it");
    }

    // redirect to Keycloak logout
    window.location.href = `${logoutUrl}?${params.toString()}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarFallback className="text-primary">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Utente"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <User className="h-4 w-4 hover:text-foreground" />
          <span>Profilo</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 hover:text-foreground" />
          <span>Esci</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
