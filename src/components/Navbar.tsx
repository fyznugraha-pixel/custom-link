'use client';

import Link from 'next/link';
import { LinkIcon, UserCircle, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <LinkIcon className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-xl text-foreground tracking-tight">
                Link<span className="text-primary-600">Enterprise</span>
              </span>
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
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{session.user?.name}</span>
                {session.user?.image ? (
                  <img src={session.user.image} alt="User avatar" className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                )}
                <button 
                  onClick={() => signOut()}
                  className="p-2 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
