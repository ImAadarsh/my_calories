import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            try {
                await query(
                    "INSERT INTO users (id, name, email, image) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), image = VALUES(image)",
                    [user.id, user.name, user.email, user.image]
                );
                return true;
            } catch (error) {
                console.error("Error saving user to DB:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
