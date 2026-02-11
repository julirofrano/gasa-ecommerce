import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <MobileNav />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
          <AccountSidebar
            userName={session.user.name}
            companyName={session.user.companyName}
            email={session.user.email}
          />
          <main className="min-h-[60vh] flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
