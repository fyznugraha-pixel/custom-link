'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, Loader2, Flag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dictionaries, Language } from '@/lib/i18n';

export default function ReportPage() {
  const [lang, setLang] = useState<Language>('en');
  const t = dictionaries[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem('fyurl_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const REASON_OPTIONS = [
    { value: 'phishing', label: t.phishing },
    { value: 'malware', label: t.malware },
    { value: 'spam', label: t.spam },
    { value: 'illegal', label: t.illegal },
    { value: 'other', label: t.other }
  ];

  const [shortUrl, setShortUrl] = useState('');
  const [reason, setReason] = useState('phishing');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortUrl, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-50 via-white to-white" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-red-100/40 to-transparent z-0 pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium z-10 bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md">
        <ArrowLeft className="w-4 h-4" />
        {t.backToHome}
      </Link>

      <div className="max-w-[480px] w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-red-900/5 p-8 sm:p-10 border border-white/50 relative z-10">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 shadow-sm border border-red-100/50">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">{t.reportTitle}</h1>
              <p className="text-slate-500 mb-8 text-[15px] leading-relaxed font-medium">
                {t.reportDesc}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t.shortlinkUrl}</label>
                  <input
                    type="url"
                    required
                    placeholder="https://fyurl.id/badlink"
                    value={shortUrl}
                    onChange={(e) => setShortUrl(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm text-[15px]"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t.reason}</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
                  >
                    <span className="text-slate-700 font-semibold text-left text-[15px]">
                      {REASON_OPTIONS.find(opt => opt.value === reason)?.label || t.selectReason}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden"
                      >
                        {REASON_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setReason(opt.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3.5 text-[15px] transition-colors hover:bg-slate-50 ${
                              reason === opt.value ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600 font-medium'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100/50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-5 h-5" />
                      {t.submitReport}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-sm border border-green-100">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{t.reportSubmitted}</h2>
              <p className="text-slate-500 mb-10 text-[15px] leading-relaxed font-medium">
                {t.reportSuccessDesc}
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setShortUrl('');
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors"
              >
                {t.submitAnother}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
