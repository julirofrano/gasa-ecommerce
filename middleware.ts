export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/profile/:path*",
    "/orders/:path*",
    "/containers/:path*",
    "/invoices/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
