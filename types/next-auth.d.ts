import NextAuth, { DefaultSession } from "next-auth"
import OAuthUserConfig from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: User | AdapterUser,
    accessToken: JWT,
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



