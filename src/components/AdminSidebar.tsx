'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Link as LinkIcon, BarChart3, Globe, Flag, Menu, X, Users, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { label: 'Overview', icon: BarChart3, href: '/hq-panel-7x9q-secret', active: pathname === '/hq-panel-7x9q-secret' && !currentTab },
    { label: 'Users', icon: Users, href: '/hq-panel-7x9q-secret?tab=users', active: currentTab === 'users' },
    { label: 'Links Management', icon: LinkIcon, href: '/hq-panel-7x9q-secret?tab=links', active: currentTab === 'links' },
    { label: 'Global Analytics', icon: BarChart3, href: '/hq-panel-7x9q-secret/analytics', active: pathname?.startsWith('/hq-panel-7x9q-secret/analytics') },
    { label: 'Custom Domains', icon: Globe, href: '/hq-panel-7x9q-secret/domains', active: pathname?.startsWith('/hq-panel-7x9q-secret/domains') },
    { label: 'Reports', icon: Flag, href: '/hq-panel-7x9q-secret/reports', active: pathname?.startsWith('/hq-panel-7x9q-secret/reports') },
    { label: 'Suggestions', icon: Lightbulb, href: '/hq-panel-7x9q-secret/suggestions', active: pathname?.startsWith('/hq-panel-7x9q-secret/suggestions') },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 fixed top-0 w-full z-50">
        <img src="/logo/fyurl-horizontal.png" alt="Fyurl Admin" className="h-8 w-auto" />
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-900 focus:outline-none">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        <div className={`hidden md:flex items-center border-b border-slate-100 h-20 shrink-0 relative ${isCollapsed ? 'justify-center w-full px-0' : 'p-6 justify-between'}`}>
          {!isCollapsed && <img src="/logo/fyurl-horizontal.png" alt="Fyurl Admin" className="h-8 w-auto object-contain" />}
          {isCollapsed && <img src="/icon.png" alt="Fyurl" className="w-8 h-8 object-contain shrink-0" />}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 text-slate-500 hover:text-slate-900 shadow-sm z-50 hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 mt-16 md:mt-0 overflow-x-hidden">
          <div className={`text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 max-h-0 mb-0' : 'opacity-100 max-h-10 mb-4'}`}>
            Main Menu
          </div>
          {menuItems.map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center py-3 text-sm font-medium rounded-lg transition-colors relative group ${
                item.active 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'px-3 justify-center' : 'px-4'}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${item.active ? 'text-primary-600' : 'text-slate-400'}`} />
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-3'}`}>
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap hidden md:block">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 shrink-0">
          <button 
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={`flex items-center w-full py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ${
              isCollapsed ? 'px-3 justify-center' : 'px-4'
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 max-w-0 ml-0' : 'opacity-100 max-w-[200px] ml-3'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
