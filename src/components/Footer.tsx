'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { dictionaries, Language } from '@/lib/i18n';

export default function Footer() {
  const pathname = usePathname();
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

  // Hide footer on admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-secret') || pathname.startsWith('/hq-panel-7x9q-secret')) {
    return null;
  }

  return (
    <footer className="mt-auto bg-[#1978e5] text-white pt-12 pb-24 sm:pb-6 px-6 sm:px-10 lg:px-16 shadow-2xl relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-white/5 blur-3xl rounded-full transform rotate-12"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[100%] bg-white/5 blur-3xl rounded-full transform -rotate-12"></div>
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex flex-col relative z-10">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-4 md:gap-6 w-full">
            <div className="bg-white p-2 px-4 md:px-6 rounded-2xl shadow-lg transform hover:scale-105 transition-transform shrink-0">
              <img src="/logo/fyurl-horizontal.png" alt="Fyurl Logo" className="h-8 md:h-10 object-contain" />
            </div>
            <p className="text-primary-100 font-medium text-xs md:text-sm text-left max-w-xs">
              {t.footerDesc}
            </p>
          </div>
        </div>
        
        <div className="w-full h-px bg-primary-400/30 my-8"></div>
        
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <a 
              href="https://instagram.com/fyurl.id" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 p-2 px-4 bg-primary-500/30 hover:bg-white hover:text-primary-600 rounded-full transition-all hover:scale-105 border border-primary-400/30" 
              title="Instagram @faizngraha"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span className="text-sm font-semibold">Instagram</span>
            </a>
            
            <Link 
              href="/report" 
              className="flex items-center gap-2 p-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all hover:scale-105 shadow-lg shadow-red-500/30 font-semibold text-sm border border-red-400"
            >
              <ShieldAlert className="w-4 h-4" />
              {t.reportAbuse}
            </Link>
          </div>
          
          <div className="text-sm text-primary-100 font-medium text-center md:text-right" itemScope itemType="https://schema.org/Person">
            dev by <a itemProp="url" href="https://byfayiz.web.id/portofolio" target="_blank" rel="author noopener noreferrer" title="Fayiz Apriwansyah Nugraha" className="font-bold text-white text-base block sm:inline mt-1 sm:mt-0 hover:text-blue-100 transition-colors cursor-pointer"><span itemProp="name" className="sr-only">Fayiz Apriwansyah Nugraha</span><span aria-hidden="true">fyz</span></a>
            <meta itemProp="jobTitle" content="Web Developer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
