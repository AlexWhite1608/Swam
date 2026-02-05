import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";

interface KeycloakToken {
  realm_access?: {
    roles: string[];
  };
}

const keycloakInternalUrl =
  process.env.KEYCLOAK_DOCKER_ISSUER || process.env.KEYCLOAK_ISSUER;

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      wellKnown: `${keycloakInternalUrl}/.well-known/openid-configuration`,

      authorization: {
        params: {
          scope: "openid email profile roles",
        },
        url: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
      },
      token: `${keycloakInternalUrl}/protocol/openid-connect/token`,
      userinfo: `${keycloakInternalUrl}/protocol/openid-connect/userinfo`,

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
        token.idToken = account.id_token;

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
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      session.idToken =
        typeof token.idToken === "string" ? token.idToken : undefined;
      session.user.roles = Array.isArray(token.roles) ? token.roles : [];
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
