import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser } from "@/lib/odoo/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      partnerId: number;
      companyName: string;
      pricelistId: number | null;
    };
  }

  interface User {
    partnerId: number;
    companyName: string;
    pricelistId: number | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    partnerId: number;
    companyName: string;
    pricelistId: number | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        return authenticateUser(email, password);
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAuthPage = ["/login", "/register", "/forgot-password"].includes(
        nextUrl.pathname,
      );
      const isProtected = ["/profile", "/orders", "/containers"].some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/profile", nextUrl));
      }

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.partnerId = user.partnerId;
        token.companyName = user.companyName;
        token.pricelistId = user.pricelistId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.partnerId = token.partnerId;
      session.user.companyName = token.companyName;
      session.user.pricelistId = token.pricelistId;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
