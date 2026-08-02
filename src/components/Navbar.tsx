import Link from 'next/link';
import { LinkIcon, UserCircle } from 'lucide-react';

export default function Navbar() {
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button className="p-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none transition-colors">
              <UserCircle className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
