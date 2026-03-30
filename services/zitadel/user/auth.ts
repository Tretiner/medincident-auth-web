import NextAuth from "next-auth";
import ZitadelProvider from "next-auth/providers/zitadel";
import { env } from "@/shared/config/env"; // Ваш конфиг переменных окружения

// Функция для обмена старого refresh_token на новый access_token
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${env.ZITADEL_API_URL}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.APP_CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Ошибка при обновлении токена (RefreshAccessTokenError):", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    basePath: "/api/auth",
  providers: [
    ZitadelProvider({
      clientId: env.APP_CLIENT_ID,
      issuer: env.ZITADEL_API_URL,

      checks: ["pkce"],

      client: {
        token_endpoint_auth_method: "none",
      },

      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
    }),
  ],
  callbacks: {
    // Вызывается при создании и проверке JWT
    async jwt({ token, account }) {
      // 1. Первичный логин
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 12 * 60 * 60 * 1000,
          refreshToken: account.refresh_token,
        };
      }

      // 2. Если токен еще жив (добавляем запас в 1 минуту)
      if (Date.now() < (token.expiresAt as number) - 60 * 1000) {
        return token;
      }

      // 3. Токен истек — обновляем
      return await refreshAccessToken(token);
    },

    // Вызывается при каждом вызове auth() или useSession()
    async session({ session, token }) {
      if (token) {
        // @ts-ignore - прокидываем токены и ошибки в клиентскую сессию
        session.accessToken = token.accessToken;
        // @ts-ignore
        session.error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
});
