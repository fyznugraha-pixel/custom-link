'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, Loader2, ArrowRight, ShieldAlert, Eye, EyeOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function UnlockClient({
  code,
  domain,
  unlockAtParam,
  hasPasswordParam,
  titleParam,
}: {
  code: string;
  domain: string;
  unlockAtParam: string | null;
  hasPasswordParam: boolean;
  titleParam: string | null;
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasAttemptedAutoUnlock, setHasAttemptedAutoUnlock] = useState(false);

  useEffect(() => {
    if (!unlockAtParam) return;
    
    const targetDate = new Date(unlockAtParam).getTime();
    if (isNaN(targetDate)) return;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(difference);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [unlockAtParam]);

  const verifyLock = async (pwd?: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode: code, domain, password: pwd }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = data.longUrl;
        }, 800);
      } else {
        setError(data.error || 'Link is locked');
        if (pwd) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !hasPasswordParam && !success && !hasAttemptedAutoUnlock) {
      setHasAttemptedAutoUnlock(true);
      verifyLock();
    }
  }, [timeLeft, hasPasswordParam, success, hasAttemptedAutoUnlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await verifyLock(password);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeLocked = timeLeft !== null && timeLeft > 0;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-primary-500 selection:text-white relative overflow-hidden">
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
                ) : isTimeLocked ? (
                  <motion.div
                    key="clock"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-amber-400"
                  >
                    <Clock className="w-10 h-10 animate-pulse" />
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
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {titleParam || (isTimeLocked ? 'Link is Scheduled' : (hasPasswordParam ? 'Protected Link' : 'Unlocking...'))}
            </h1>
            <p className="text-slate-400 text-sm">
              {titleParam 
                ? (isTimeLocked ? 'This event link will become available when the countdown finishes.' : 'This event link is secured. Please enter the password to continue.')
                : (isTimeLocked 
                  ? 'This link will become available when the countdown finishes.' 
                  : (hasPasswordParam ? 'This link is secured. Please enter the password to continue.' : 'Please wait while we redirect you...'))}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isTimeLocked ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-wider font-mono">
                  {formatTime(timeLeft)}
                </div>
              </motion.div>
            ) : hasPasswordParam ? (
              <motion.form 
                key="password-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    disabled={loading || success}
                    className="block w-full pl-5 pr-12 py-4 text-base bg-slate-900/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || success}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                  >
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || success}
                  className="w-full relative group overflow-hidden rounded-2xl bg-primary-600 px-8 py-4 transition-all hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <>
                        <span className="font-semibold text-white">Unlock Link</span>
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </motion.form>
            ) : null}
          </AnimatePresence>

          <div className="mt-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">Secured by</span>
              <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                <img src="/logo/fyurl-logo-tp.png" alt="Fyurl Logo" className="h-4 w-4 object-contain brightness-0 invert" />
                <span className="text-sm font-bold text-slate-300 tracking-wide">Fyurl</span>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
