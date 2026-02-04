import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";

interface KeycloakToken {
  realm_access?: {
    roles: string[];
  };
}

// Configurazione Dinamica:
// Se siamo dentro Docker (esiste la var KEYCLOAK_DOCKER_ISSUER), usiamo quella per le chiamate server-side.
// Altrimenti (se sviluppi in locale senza docker) usa quella standard.
const keycloakInternalUrl = process.env.KEYCLOAK_DOCKER_ISSUER || process.env.KEYCLOAK_ISSUER;

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER, // Questo deve restare "localhost" per matchare il token
      
      // SOVRASCRIVIAMO GLI ENDPOINT PER USARE LA RETE DOCKER
      authorization: {
        params: {
          scope: "openid email profile roles",
        },
        // Il browser deve andare su localhost
        url: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
      },
      // Il server Next.js deve chiamare il container "keycloak"
      token: `${keycloakInternalUrl}/protocol/openid-connect/token`,
      userinfo: `${keycloakInternalUrl}/protocol/openid-connect/userinfo`,
      
      // Anche le chiavi pubbliche (JWKS) vanno prese internamente
      jwks_endpoint: `${keycloakInternalUrl}/protocol/openid-connect/certs`,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;

        if (account.access_token) {
            try {
                const decoded = jwtDecode<KeycloakToken>(account.access_token);
                token.roles = decoded.realm_access?.roles || [];
            } catch (error) {
                console.error("Errore decodifica token", error);
            }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.roles = token.roles;
      return session;
    },
  },
  pages: {
    signIn: "/login", 
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };