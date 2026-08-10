'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LinkIcon, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="w-full px-6 sm:px-10 lg:px-16">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <img src="/logo/fyurl-horizontal.png" alt="Fyurl" className="h-10 w-auto object-contain" />
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link 
                href="/dashboard" 
                className={`${pathname === '/dashboard' ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Links
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className={`${pathname?.startsWith('/dashboard/analytics') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
                Global Analytics
              </Link>
              <Link 
                href="/dashboard/domains" 
                className={`${pathname?.startsWith('/dashboard/domains') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
              >
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
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-white shadow-lg absolute w-full left-0 z-50">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <Link 
              href="/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname === '/dashboard' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors`}
            >
              Links
            </Link>
            <Link 
              href="/dashboard/analytics" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname?.startsWith('/dashboard/analytics') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors`}
            >
              Global Analytics
            </Link>
            <Link 
              href="/dashboard/domains" 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${pathname?.startsWith('/dashboard/domains') ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'} block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors`}
            >
              Custom Domains
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-border px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-foreground">Admin User</div>
                </div>
              </div>
              {isDashboard && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="p-2 rounded-md text-red-600 hover:bg-red-50 flex items-center transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
