'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Package, Cylinder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/utils/constants';
import { LogoutButton } from './logout-button';

interface AccountSidebarProps {
  userName: string;
  companyName: string;
  email: string;
}

const navLinks = [
  { href: ROUTES.ACCOUNT_PROFILE, label: 'Perfil', icon: User },
  { href: ROUTES.ACCOUNT_ORDERS, label: 'Mis Pedidos', icon: Package },
  { href: ROUTES.ACCOUNT_CONTAINERS, label: 'Mis Envases', icon: Cylinder },
  { href: ROUTES.ACCOUNT_INVOICES, label: 'Mis Facturas', icon: FileText },
];

export function AccountSidebar({
  userName,
  companyName,
  email,
}: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 md:w-64">
      {/* User Info Card */}
      <div className="mb-6 border-2 border-foreground p-4 md:border-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
          Mi Cuenta
        </p>
        <p className="text-sm font-bold">{userName}</p>
        <p className="text-sm font-bold">{companyName}</p>
        <p className="mt-1 text-xs text-muted-foreground">{email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-row gap-0 overflow-x-auto md:flex-col">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== ROUTES.ACCOUNT_PROFILE &&
              pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-bold uppercase tracking-wide transition-colors duration-200 md:border-b-0 md:border-l-4',
                isActive
                  ? 'border-[#0094BB] text-[#0094BB] md:border-[#0094BB]'
                  : 'border-transparent text-foreground hover:border-foreground hover:text-[#0094BB]'
              )}
            >
              <link.icon className="hidden h-4 w-4 md:block" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-4 hidden border-t-2 border-foreground/10 pt-4 md:block">
        <LogoutButton />
      </div>
    </aside>
  );
}
