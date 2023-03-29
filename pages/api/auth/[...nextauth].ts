import NextAuth, { NextAuthOptions } from 'next-auth'
import { AppProviders } from 'next-auth/providers'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prisma'
import { AuthToken } from '../../../types/next-auth'
import { type TokenSet } from "@auth/core/types"
import { signIn } from 'next-auth/react'


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
                    id: credentials?.id,
                    name: credentials?.name,
                    email: credentials?.email,
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
            accessTokenUrl: 'https://accounts.google.com/o/oauth2/v2/auth?' +
                new URLSearchParams({
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                }),
            authorization: {
                params: {
                    access_type: 'offline',
                    prompt: 'consent',
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
        //@ts-ignore
        async signIn({ user, account, profile, email, credentials }) {
            const now = Date.now();
            const [google] = await prisma.account.findMany({
                where: { userId: user.id, provider: "google" },
            });

            if (google && account?.refresh_token) {
                await prisma.account.update({
                    data: {
                        access_token: account.access_token,
                        expires_at: account.expires_at,
                        refresh_token: account.refresh_token
                    },
                    where: {
                        provider_providerAccountId: {
                            provider: "google",
                            providerAccountId: account.providerAccountId,
                        },
                    },
                })
            }
            return true
        },
        async session({ session, user }) {
            let tokens: TokenSet
            const [google] = await prisma.account.findMany({
                where: { userId: user.id, provider: "google" },
            })
            if (google.expires_at * 1000 < Date.now()) {
                // If the access token has expired, try to refresh it
                try {
                    // https://accounts.google.com/.well-known/openid-configuration
                    // We need the `token_endpoint`.
                    const response = await fetch("https://oauth2.googleapis.com/token", {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.GOOGLE_CLIENT_ID,
                            client_secret: process.env.GOOGLE_CLIENT_SECRET,
                            grant_type: "refresh_token",
                            refresh_token: google?.refresh_token,
                        }),
                        method: "POST",
                    })

                    tokens = await response.json()
                    console.log('🚀 - file: [...nextauth].ts - line 92 - profile - token', tokens)

                    if (!response.ok) throw tokens

                    await prisma.account.update({
                        data: {
                            access_token: tokens.access_token,
                            expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
                            refresh_token: tokens?.refresh_token ?? google?.refresh_token,
                        },
                        where: {
                            provider_providerAccountId: {
                                provider: "google",
                                providerAccountId: google.providerAccountId,
                            },
                        },
                    })

                } catch (error) {
                    console.error("Error refreshing access token", error)
                    // The error property will be used client-side to handle the refresh token error
                    session.error = "RefreshAccessTokenError"
                }
            }
            session.googleAccessToken = google.access_token;
            session.googleRefreshToken = tokens?.refresh_token ?? google?.refresh_token;
            session.expires_at = google.expires_at;
            session.user.userId = user.id;
            return session
        },

    }
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions)



