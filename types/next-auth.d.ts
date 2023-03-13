import NextAuth, { DefaultSession } from "next-auth"
import OAuthUserConfig from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User | AdapterUser,
    googleAccessToken: JWT,
    googleRefreshToken: JWT,
    expires_at: number,
    error: String | buffer,
  }
} interface AuthToken {
  user: User
  accessToken: string
  accessTokenExpires?: number
  expires_at?: number
  refreshToken: string
  error?: string
}

interface JwtInterface {
  token: AuthToken
  user: User
  account: GenericObject
}


declare module "@auth/core/types" {
  interface Session {
    error?: "RefreshAccessTokenError"
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    access_token: string
    expires_at: number
    refresh_token: string
    error?: "RefreshAccessTokenError"
  }
}


