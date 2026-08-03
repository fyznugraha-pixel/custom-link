'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Lock, Unlock, Loader2, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || '';
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode: params.code, domain, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        // Wait a tiny bit for the unlock animation before redirecting
        setTimeout(() => {
          window.location.href = data.longUrl;
        }, 800);
      } else {
        setError(data.error || 'Incorrect password');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 relative border border-slate-600/50">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="unlock"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-green-400"
                  >
                    <Unlock className="w-10 h-10" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="lock"
                    animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="text-primary-400"
                  >
                    <Lock className="w-10 h-10" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Protected Link</h1>
            <p className="text-slate-400 text-sm">
              This link is secured by the owner. Please enter the password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                className="w-full pl-5 pr-12 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-center tracking-widest font-mono text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                disabled={loading || success}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password || success}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center group ${
                success 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-primary-600 hover:bg-primary-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                'Unlocked!'
              ) : (
                <>
                  Unlock Link
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">Secured by</span>
              <img src="/logo/fyurl-horizontal.png" alt="Fyurl" className="h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
