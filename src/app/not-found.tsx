'use client';

import Link from 'next/link';
import { Unlink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dictionaries, Language } from '@/lib/i18n';

export default function NotFound() {
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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Unlink className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-rose-600 tracking-wide uppercase mb-1">Error 404</h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t.notFoundTitle}</h1>
        </div>
        <p className="text-slate-500 leading-relaxed text-lg">
          {t.notFoundDesc}
        </p>
        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            {t.createYourOwn}
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-6">
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            {t.goToDashboard}
          </Link>
        </div>
      </div>
    </div>
  );
}
