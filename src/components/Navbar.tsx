'use client';

import Link from 'next/link';
import { LinkIcon, UserCircle, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <nav className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <img src="/logo/fylink.png?v=1" alt="Fylink" className="h-8 w-auto object-contain" />
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-primary-600 text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Links
              </Link>
              <Link href="/dashboard/analytics" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Global Analytics
              </Link>
              <Link href="/dashboard/domains" className="border-transparent text-muted-foreground hover:border-border hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                Custom Domains
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <button className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none transition-colors">
              <UserCircle className="h-7 w-7" />
            </button>
            {isDashboard && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
