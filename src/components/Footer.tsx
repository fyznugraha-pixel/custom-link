'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Lightbulb } from 'lucide-react';
import { dictionaries, Language } from '@/lib/i18n';

import SuggestionModal from './SuggestionModal';

export default function Footer() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>('en');
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
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
    <>
      <footer className="mt-auto bg-white/80 backdrop-blur-xl border-t border-slate-200/80 py-4 sm:py-5 px-6 sm:px-10 lg:px-16 relative z-40">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <Link href="/" className="transform hover:scale-105 transition-transform shrink-0">
              <img src="/logo/fyurl-horizontal.png" alt="Fyurl Logo" className="h-6 md:h-7 object-contain" />
            </Link>
            <p className="text-slate-500 font-medium text-[11px] hidden lg:block max-w-[220px] leading-relaxed border-l border-slate-200 pl-4">
              {lang === 'id' ? 'Perpendek, sesuaikan, dan lacak Link Anda dengan estetika premium dan keamanan tingkat lanjut.' : 'Shorten, customize, and track your links with premium aesthetics and advanced security.'}
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-3 w-full sm:w-auto flex-wrap">
            <a 
              href="https://instagram.com/fyurl.id" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100/80 hover:bg-slate-200 text-slate-700 rounded-full transition-all hover:scale-105 text-xs font-bold" 
              title="Instagram @fyurl.id"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span>Instagram</span>
            </a>
            
            <button 
              onClick={() => setIsSuggestionModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-full transition-all hover:scale-105 text-xs font-bold border border-amber-100"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'id' ? 'Saran' : 'Idea'}</span>
            </button>

            <Link 
              href="/report" 
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-all hover:scale-105 text-xs font-bold border border-red-100"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.reportAbuse}</span>
              <span className="inline sm:hidden">{lang === 'id' ? 'Lapor' : 'Report'}</span>
            </Link>
          </div>
          
          <div className="text-[11px] text-slate-400 font-medium text-center sm:text-right shrink-0 w-full sm:w-auto" itemScope itemType="https://schema.org/Person">
            dev by <a itemProp="url" href="https://byfayiz.web.id/portofolio" target="_blank" rel="author noopener noreferrer" title="Fayiz Apriwansyah Nugraha" className="font-bold text-slate-800 hover:text-[#0047cc] transition-colors cursor-pointer ml-0.5"><span itemProp="name" className="sr-only">Fayiz Apriwansyah Nugraha</span><span aria-hidden="true">fyz</span></a>
            <meta itemProp="jobTitle" content="Web Developer" />
          </div>
        </div>
      </footer>
      <SuggestionModal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} lang={lang} />
    </>
  );
}
