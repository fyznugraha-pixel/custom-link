'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'id' | 'en';
}

export default function SuggestionModal({ isOpen, onClose, lang }: SuggestionModalProps) {
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error(lang === 'id' ? 'Saran tidak boleh kosong' : 'Suggestion cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, email }),
      });

      if (!res.ok) throw new Error('Failed to submit suggestion');

      toast.success(
        lang === 'id' 
          ? 'Terima kasih atas sarannya! Masukanmu sangat berharga buat kami.' 
          : 'Thank you for your feedback! Your suggestion is highly appreciated.'
      );
      
      setContent('');
      setEmail('');
      onClose();
    } catch (error) {
      toast.error(
        lang === 'id' 
          ? 'Gagal mengirim saran. Silakan coba lagi nanti.' 
          : 'Failed to send suggestion. Please try again later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-xl shrink-0">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {lang === 'id' ? 'Kirim Saran Pengembangan' : 'Send a Suggestion'}
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {lang === 'id' 
                    ? 'Punya ide fitur baru atau nemu yang kurang pas? Kasih tau kami!' 
                    : 'Have an idea for a new feature or found something off? Let us know!'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="suggestion" className="block text-sm font-semibold text-slate-700 mb-2">
                    {lang === 'id' ? 'Saran atau Ide Kamu' : 'Your Suggestion or Idea'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="suggestion"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={lang === 'id' ? 'Bakal keren banget kalau ditambahin fitur...' : 'It would be awesome if you added...'}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    {lang === 'id' ? 'Email (Opsional)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'id' ? 'Biar kami bisa kasih tau kalau idemu dirilis!' : 'So we can let you know if we build it!'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {lang === 'id' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="flex-1 px-4 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {lang === 'id' ? 'Kirim Saran' : 'Submit'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
