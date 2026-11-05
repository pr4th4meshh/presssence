import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import {prisma} from "./prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        jwt: async ({ token, user }) => {
            // `user` is only present on sign-in. With the Prisma adapter it is
            // the DB user (Google) or what authorize() returned (credentials),
            // so its id is the Mongo id and no lookup is needed.
            if (user) {
                token.id = user.id
                return token
            }

            // Tokens issued before the id was stored on them: look it up once,
            // after which it is carried in the token.
            if (!token.id && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                    select: { id: true },
                })
                if (dbUser) token.id = dbUser.id
            }

            return token;
        },

        session: async ({ session, token }) => {
            if(token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET!,
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    throw new Error("Email is required");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user) {
                    throw new Error("User not found");
                }

                if (user.password) {
                    if (!credentials.password) {
                        throw new Error("Password is required");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        throw new Error("Invalid credentials");
                    }
                } else if (credentials.password) {
                    throw new Error("This account doesn't use a password");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user'
    }
};

export const getAuthSession = () => {
    return getServerSession(authOptions)
}