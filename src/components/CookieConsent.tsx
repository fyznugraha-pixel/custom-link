'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Info } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('fyurl_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    } else if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().includes('id')) {
      setLang('id');
    }

    const consent = localStorage.getItem('fyurl_cookie_consent');
    if (!consent) {
      // Small delay so it doesn't pop up instantly on initial paint
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('fyurl_cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-sm"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-5 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

            <button
              onClick={() => setShow(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm mb-1">{lang === 'id' ? 'Izin Privasi & Cookies 🍪' : 'Privacy & Cookies Consent 🍪'}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'id' ? (
                    <>Biar pengalaman kamu makin asik, kami pakai <span className="font-semibold text-slate-700">localStorage</span> dan sedikit cookies buat nyimpen settingan kamu (kayak riwayat link & bahasa). Tenang aja, privasi kamu aman kok!</>
                  ) : (
                    <>To give you the best experience, we use <span className="font-semibold text-slate-700">localStorage</span> and a few cookies to save your settings (like link history & language). Don't worry, your privacy is perfectly safe!</>
                  )}
                </p>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-[10px] sm:text-[11px] text-slate-600 border border-slate-100 leading-relaxed">
                        {lang === 'id' ? 'Buat kamu yang nggak login, riwayat link yang baru dibuat itu aman disimpen langsung di browser perangkatmu sendiri. Jadi data kamu ngga mondar-mandir ke server kami, pastinya lebih private dibanding cookies pelacak biasa!' : 'For guest users, your newly created link history is safely stored locally in your own browser. This means your data doesn\'t travel back and forth to our servers, making it much more private than standard tracking cookies!'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {lang === 'id' ? 'Oke, Paham!' : 'Got it!'}
                  </button>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex-none bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Detail' : 'Details'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
