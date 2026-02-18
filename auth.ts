import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateUser, authenticateWithMagicLink } from "@/lib/odoo/auth";
import { validateSignupToken } from "@/lib/odoo/portal";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      partnerId: number;
      commercialPartnerId: number;
      companyName: string;
      pricelistId: number | null;
      warehouseId: number | null;
    };
  }

  interface User {
    partnerId: number;
    commercialPartnerId: number;
    companyName: string;
    pricelistId: number | null;
    warehouseId: number | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    partnerId: number;
    commercialPartnerId: number;
    companyName: string;
    pricelistId: number | null;
    warehouseId: number | null;
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
        magicToken: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const magicToken = credentials?.magicToken as string | undefined;
        if (magicToken) {
          const partner = await validateSignupToken(magicToken);
          if (!partner) return null;
          return authenticateWithMagicLink(partner.id);
        }

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
      const isAuthPage = [
        "/login",
        "/register",
        "/forgot-password",
        "/magic-link",
      ].includes(nextUrl.pathname);
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
        token.commercialPartnerId = user.commercialPartnerId;
        token.companyName = user.companyName;
        token.pricelistId = user.pricelistId;
        token.warehouseId = user.warehouseId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.partnerId = token.partnerId;
      session.user.commercialPartnerId = token.commercialPartnerId;
      session.user.companyName = token.companyName;
      session.user.pricelistId = token.pricelistId;
      session.user.warehouseId = token.warehouseId;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
