'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, UserCircle, Link as LinkIcon, BarChart3, Globe, Home, HandCoins, Languages, Shield } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { dictionaries, Language } from '@/lib/i18n';
import DonationModal from '@/components/DonationModal';

export default function UserNavbar({ user }: { user: any }) {
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  
  const [lang, setLang] = useState<Language>('en');
  const t = dictionaries[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('fyurl_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.country_code === 'ID') {
            setLang('id');
            localStorage.setItem('fyurl_lang', 'id');
          } else {
            setLang('en');
            localStorage.setItem('fyurl_lang', 'en');
          }
        })
        .catch(() => {
          if (navigator.language.toLowerCase().includes('id')) {
            setLang('id');
            localStorage.setItem('fyurl_lang', 'id');
          }
        });
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'id' : 'en';
    setLang(newLang);
    localStorage.setItem('fyurl_lang', newLang);
  };

  return (
    <>
      {/* Top Navbar (Desktop & Mobile) */}
      <nav className="bg-white border-b border-border fixed top-0 w-full z-50">
        <div className="w-full px-4 sm:px-10 lg:px-16">
          <div className="flex justify-between h-16 gap-2">
            <div className="flex shrink-0">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <img src="/logo/fyurl-horizontal.png" alt="Fyurl" className="h-7 sm:h-10 w-auto object-contain" />
              </Link>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                <Link 
                  href="/" 
                  className={`${pathname === '/' ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                >
                  <Home className="w-4 h-4 mr-2" /> {t.navHome}
                </Link>
                
                {user?.email === 'fyznugraha@gmail.com' ? (
                  <Link 
                    href="/hq-panel-7x9q-secret" 
                    className="border-transparent text-red-600 hover:border-red-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-2" /> Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={`${pathname === '/dashboard' ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" /> {t.navLinks}
                    </Link>
                    <Link 
                      href="/dashboard/analytics" 
                      className={`${pathname?.startsWith('/dashboard/analytics') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> {t.navAnalytics}
                    </Link>
                    <Link 
                      href="/dashboard/domains" 
                      className={`${pathname?.startsWith('/dashboard/domains') ? 'border-primary-600 text-foreground' : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                    >
                      <Globe className="w-4 h-4 mr-2" /> {t.navDomains}
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-0 sm:mr-4"
                title={t.language}
              >
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline font-semibold">{lang === 'en' ? 'EN / ID' : 'ID / EN'}</span>
                <span className="sm:hidden font-semibold">{lang.toUpperCase()}</span>
              </button>
              
              <button 
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center p-1.5 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-md hover:-translate-y-0.5"
                title={t.donation}
              >
                <HandCoins className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline-block">{t.navDonation}</span>
              </button>

              <div className="flex items-center text-sm font-medium text-slate-700">
                <img 
                  src={user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=e2e8f0&color=475569`} 
                  alt={user?.name || "User"} 
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full sm:mr-2 object-cover bg-slate-100" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=e2e8f0&color=475569`;
                  }}
                />
                <span className="hidden sm:inline-block">{user?.name || user?.email}</span>
              </div>

              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center justify-center p-1.5 sm:p-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-white hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" /> 
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border z-50 sm:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{t.navHome}</span>
          </Link>
          
          {user?.email === 'fyznugraha@gmail.com' ? (
            <Link 
              href="/hq-panel-7x9q-secret" 
              className="flex flex-col items-center justify-center w-full h-full text-red-500 hover:text-red-700 transition-colors"
            >
              <Shield className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Admin Panel</span>
            </Link>
          ) : (
            <>
              <Link 
                href="/dashboard" 
                className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/dashboard' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
              >
                <LinkIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{t.navLinks}</span>
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className={`flex flex-col items-center justify-center w-full h-full ${pathname?.startsWith('/dashboard/analytics') ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
              >
                <BarChart3 className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{t.navAnalytics}</span>
              </Link>
              <Link 
                href="/dashboard/domains" 
                className={`flex flex-col items-center justify-center w-full h-full ${pathname?.startsWith('/dashboard/domains') ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'} transition-colors`}
              >
                <Globe className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{t.navDomains}</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
        lang={lang} 
      />
    </>
  );
}
