'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, UserPlus, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function LoginAnnouncementModal() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState('en');
  const { status } = useSession(); // To check if user is already logged in

  useEffect(() => {
    // Only show if not logged in
    if (status === 'authenticated') {
      window.dispatchEvent(new Event('loginAnnouncementClosed'));
      return;
    }

    const savedLang = localStorage.getItem('fyurl_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    } else if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().includes('id')) {
      setLang('id');
    }

    const hasSeenAnnouncement = localStorage.getItem('fyurl_login_announcement_v1');
    if (!hasSeenAnnouncement) {
      // Delay so it pops up after a short while, not instantly
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    } else {
      window.dispatchEvent(new Event('loginAnnouncementClosed'));
    }
  }, [status]);

  const handleClose = () => {
    localStorage.setItem('fyurl_login_announcement_v1', 'true');
    setShow(false);
    window.dispatchEvent(new Event('loginAnnouncementClosed'));
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div 
          key="login-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            key="login-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100"
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />

            {/* Header */}
            <div className="relative pt-8 pb-4 px-8 text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30 transform -rotate-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                {lang === 'id' ? 'Sekarang Fyurl Punya Fitur Akun!' : 'Fyurl Now Has User Accounts!'}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {lang === 'id' 
                  ? 'Bikin akun gratis sekarang buat nikmatin fitur-fitur super premium ini:' 
                  : 'Create a free account now to enjoy these premium features:'}
              </p>
            </div>

            {/* Features */}
            <div className="px-8 pb-6 space-y-4 relative">
              <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'id' ? 'Statistik Super Lengkap' : 'Advanced Analytics'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'id' ? 'Lacak klik, lokasi, dan device pengunjung' : 'Track clicks, locations, and visitor devices'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'id' ? 'Pakai Domain Sendiri' : 'Use Custom Domains'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'id' ? 'Hubungkan nama brand kamu sendiri' : 'Connect your own custom brand domain'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {lang === 'id' ? 'Kelola Semua Link' : 'Manage All Links'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'id' ? 'Simpan, edit, dan atur link tanpa batas' : 'Save, edit, and organize unlimited links'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 relative">
              <Link 
                href="/dashboard/login"
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {lang === 'id' ? 'Daftar / Login Sekarang' : 'Sign Up / Login Now'}
              </Link>
              <button
                onClick={handleClose}
                className="w-full py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {lang === 'id' ? 'Nanti saja, lanjut tanpa akun' : 'Maybe later, continue as guest'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
