import NextAuth, { NextAuthOptions } from 'next-auth'
import { AppProviders } from 'next-auth/providers'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../lib/prisma'
import { AuthToken } from '../../../types/next-auth'
import { TokenSet } from 'next-auth'




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
            accessTokenUrl: 'https://accounts.google.com/o/oauth2/v2/auth?' +
                new URLSearchParams({
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code',
                }),
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
        async session({ session, user }) {
            const [google] = await prisma.account.findMany({
                where: { userId: user.id, provider: "google" },
            })
            session.googleAccessToken = google.access_token;
            session.googleRefreshToken = google.access_token;
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
                            refresh_token: google.refresh_token,
                        }),
                        method: "POST",
                    })

                    const tokens: TokenSet = await response.json()
                    // console.log('🚀 - file: [...nextauth].ts - line 92 - profile - profile', profile)

                    if (!response.ok) throw tokens

                    await prisma.account.update({
                        data: {
                            access_token: tokens.access_token,
                            expires_at: Math.floor(Date.now() / 1000 + Number(tokens.expires_in)),
                            refresh_token: tokens.refresh_token ?? google.refresh_token,
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

            return session
        }
    }
}

export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions)



