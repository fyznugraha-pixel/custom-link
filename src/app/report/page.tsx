'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, CheckCircle2, Loader2, Flag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REASON_OPTIONS = [
  { value: 'phishing', label: 'Phishing / Scam' },
  { value: 'malware', label: 'Malware / Virus' },
  { value: 'spam', label: 'Spam / Unsolicited' },
  { value: 'illegal', label: 'Illegal Content' },
  { value: 'other', label: 'Other' }
];

export default function ReportPage() {
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Fyurl
      </Link>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Report Abuse</h1>
              <p className="text-slate-500 mb-8 text-sm">
                Help us keep the web safe. If you found a malicious Fyurl link, report it below and our team will investigate it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Shortlink URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://fylink.fun/badlink"
                    value={shortUrl}
                    onChange={(e) => setShortUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Reason</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  >
                    <span className="text-slate-900 font-medium text-left">
                      {REASON_OPTIONS.find(opt => opt.value === reason)?.label || 'Select reason'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden"
                      >
                        {REASON_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setReason(opt.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                              reason === opt.value ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-700 font-medium'
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
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Flag className="w-5 h-5" />
                      Submit Report
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
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h2>
              <p className="text-slate-500 mb-8">
                Thank you for keeping Fyurl safe! Our automated systems and team will review this link immediately.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setShortUrl('');
                }}
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Submit another report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
