'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Link as LinkIcon, BarChart3, Globe, Flag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Do not render navbar on login page
  if (pathname === '/hq-panel-7x9q-secret/login') {
    return null;
  }

  return (
    <>
      <nav className="bg-white border-b border-border fixed top-0 w-full z-50">
        <div className="w-full px-4 sm:px-10 lg:px-16">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/hq-panel-7x9q-secret" className="flex-shrink-0 flex items-center">
                <img src="/logo/fyurl-horizontal.png" alt="Fyurl Admin" className="h-10 w-auto object-contain" />
              </Link>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8 overflow-x-auto">
                <Link 
                  href="/hq-panel-7x9q-secret" 
                  className={`${pathname === '/hq-panel-7x9q-secret' && !currentTab ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" /> Overview
                </Link>
                <Link 
                  href="/hq-panel-7x9q-secret?tab=users" 
                  className={`${currentTab === 'users' ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <Globe className="w-4 h-4 mr-2" /> Users
                </Link>
                <Link 
                  href="/hq-panel-7x9q-secret?tab=links" 
                  className={`${currentTab === 'links' ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Links Management
                </Link>
                <Link 
                  href="/hq-panel-7x9q-secret/domains" 
                  className={`${pathname?.startsWith('/hq-panel-7x9q-secret/domains') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <Globe className="w-4 h-4 mr-2" /> Custom Domains
                </Link>
                <Link 
                  href="/hq-panel-7x9q-secret/reports" 
                  className={`${pathname?.startsWith('/hq-panel-7x9q-secret/reports') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <Flag className="w-4 h-4 mr-2" /> Reports
                </Link>
              </div>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-white hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-red-500" /> 
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border z-50 sm:hidden pb-safe overflow-x-auto">
        <div className="flex justify-around items-center h-16 min-w-max px-4 space-x-6">
          <Link 
            href="/hq-panel-7x9q-secret" 
            className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/hq-panel-7x9q-secret' && !currentTab ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Overview</span>
          </Link>
          <Link 
            href="/hq-panel-7x9q-secret?tab=users" 
            className={`flex flex-col items-center justify-center w-full h-full ${currentTab === 'users' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
          >
            <Globe className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Users</span>
          </Link>
          <Link 
            href="/hq-panel-7x9q-secret?tab=links" 
            className={`flex flex-col items-center justify-center w-full h-full ${currentTab === 'links' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
          >
            <LinkIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Links</span>
          </Link>
          <Link 
            href="/hq-panel-7x9q-secret/domains" 
            className={`flex flex-col items-center justify-center w-full h-full ${pathname?.startsWith('/hq-panel-7x9q-secret/domains') ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
          >
            <Globe className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Domains</span>
          </Link>
        </div>
      </div>
    </>
  );
}
