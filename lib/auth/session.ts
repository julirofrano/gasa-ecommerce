import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session or redirect to login.
 * Use in server components and server actions that require auth.
 */
export async function getRequiredSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}
