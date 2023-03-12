import NextAuth, { NextAuthOptions } from 'next-auth'
import { AppProviders } from 'next-auth/providers'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prisma'
import { AuthToken } from '../../../types/next-auth'

const GOOGLE_AUTHORIZATION_URL =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
        prompt: 'consent',
        access_type: 'offline',
        response_type: 'code',
    })

const refreshAccessToken = async (
    payload: AuthToken,
    clientId: string,
    clientSecret: string,
): Promise<AuthToken> => {
    try {
        const url = new URL('https://accounts.google.com/o/oauth2/token')
        url.searchParams.set('client_id', clientId)
        url.searchParams.set('client_secret', clientSecret)
        url.searchParams.set('grant_type', 'refresh_token')
        url.searchParams.set('refresh_token', payload.refreshToken)

        const response = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
        })

        const refreshToken = await response.json()

        if (!response.ok) {
            throw refreshToken
        }

        // Give a 10 sec buffer
        const now = new Date()
        const accessTokenExpires = now.setSeconds(now.getSeconds() + parseInt(refreshToken.expires_at) - 10)
        return {
            ...payload,
            accessToken: refreshToken.access_token,
            accessTokenExpires,
            refreshToken: payload.refreshToken,
        }
    } catch (error) {
        console.error('ERR', error)

        return {
            ...payload,
            error: 'RefreshAccessTokenError',
        }
    }
}

let ErrorGoogleEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production'
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log('⚠️ Google auth credentials were not added ⚠️')
    ErrorGoogleEnv = true
}

const providers: AppProviders = []
if (ErrorGoogleEnv) {
    providers.push(
        CredentialsProvider({
            id: 'google',
            name: 'Mocked Google',
            async authorize(credentials: any) {
                const user = {
                    id: credentials?.name,
                    name: credentials?.name,
                    email: credentials?.name,
                }
                return user
            },
            credentials: {
                name: { type: 'test' },
            },
        })
    )
} else {
    providers.push(
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
            accessTokenUrl: GOOGLE_AUTHORIZATION_URL,
            authorization: {
                params: {
                    access_type: 'offline',
                    scope: "https://www.googleapis.com/auth/calendar.readonly openid profile email",
                },
            },
            profile(profile: any) {
                // console.log('🚀 - file: [...nextauth].ts - line 92 - profile - profile', profile)
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                } as any
            },
        })
    )
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: '/auth/signin',
    },
    providers,
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        // @ts-ignore
        async jwt({ token, user, account }: JwtInterface): Promise<AuthToken> {
            let res: AuthToken
            const now = Date.now()
            // Signing in
            if (account && user) {
                const accessToken = account.access_token
                const refreshToken = account.refresh_token

                res = {
                    accessToken,
                    accessTokenExpires: account.expires_at,
                    refreshToken,
                    user,
                }
            } else if (token.expires_at === null || now < token.expires_at) {
                // Subsequent use of JWT, the user has been logged in before
                // access token has not expired yet
                res = token
            } else {
                // access token has expired, try to update it
                res = await refreshAccessToken(
                    token,
                    String(process.env.GOOGLE_ID),
                    String(process.env.GOOGLE_SECRET),
                )
            }

            return res
        },
        // @ts-ignore
        async session({ session, token, user, account }: any) {
            session.token = token
            session.jwt = user.jwt
            session.id = user.id
            console.log("🚀 - file: [...nextauth].ts - line 113 - session - token", token)
            console.log("🚀 - file: [...nextauth].ts - line 113 - session - user", user)
            console.log("🚀 - file: [...nextauth].ts - line 113 - session - session", session)
            console.log("🚀 - file: [...nextauth].ts - line 113 - session - account", account)

            return session
        },
    },
    debug: false,
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions)



