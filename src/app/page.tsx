'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Link as LinkIcon, Globe, Shield, Zap, Copy, Download, Loader2, CheckCircle2, QrCode, ChevronDown, Trash2, ShieldAlert, Lock, Eye, EyeOff, Clock, Calendar, HandCoins, LogIn, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Link from 'next/link';
import UserNavbar from '@/components/UserNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { dictionaries, Language } from '@/lib/i18n';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import DonationModal from '@/components/DonationModal';

export default function Home() {
  const { data: session } = useSession();
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

  // Handle URL errors (e.g. from middleware redirect on 404)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const status = urlParams.get('status');

      if (error === 'lookup_failed') {
        setShowNotFoundModal(true);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [lang]);

  const [showNotFoundModal, setShowNotFoundModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  useEffect(() => {
    if (!session) {
      const hasSeenModal = localStorage.getItem('fyurl_modal_seen');
      if (!hasSeenModal) {
        setShowFeatureModal(true);
        localStorage.setItem('fyurl_modal_seen', 'true');
      }
    }
  }, [session]);

  const EXPIRATION_OPTIONS = [
    { value: '1d', label: t.exp1d },
    { value: '3d', label: t.exp3d },
    { value: '7d', label: t.exp7d },
    { value: '30d', label: t.exp30d },
    { value: 'custom', label: t.expCustom },
  ];

  const [activeTab, setActiveTab] = useState<'shortener' | 'qr'>('shortener');
  const [longUrl, setLongUrl] = useState('');
  const [qrText, setQrText] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [expiresIn, setExpiresIn] = useState('3d');
  const [customDays, setCustomDays] = useState('60');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [transparentBg, setTransparentBg] = useState(false);
  const [qrLogo, setQrLogo] = useState<string>('/logo/fyurl-logo-tp.png');
  const [qrShortLink, setQrShortLink] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ shortCode: string; domain: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requireSchedule, setRequireSchedule] = useState(false);
  const [unlockAt, setUnlockAt] = useState('');
  
  // Custom OG state
  const [requireOg, setRequireOg] = useState(false);
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  const [defaultDomain, setDefaultDomain] = useState('link.byfayiz.web.id');
  const [customDomains, setCustomDomains] = useState<any[]>([]);
  const [domainId, setDomainId] = useState('');

  useEffect(() => {
    const currentHost = window.location.host.replace(/^www\./, '');
    setDefaultDomain(currentHost);
    
    // Fetch custom domains (public system domains + user's own domains if logged in)
    fetch('/api/domains')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
           const verifiedDomains = data.data.filter((d: any) => 
             (d.status === 'verified' || d.status === 'active' || d.status === 'Active') && 
             d.domain !== currentHost
           );
           setCustomDomains(verifiedDomains);
           const primary = verifiedDomains.find((d: any) => d.isPrimary);
           if (primary) {
             setDomainId(primary.id);
           }
        }
      })
      .catch(console.error);

    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % t.taglines.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [t.taglines.length]);

  const handleGenerateTrackableQr = async () => {
    let finalUrl = qrText.trim();
    if (!finalUrl) return;

    if (!/^https?:\/\//i.test(finalUrl)) {
      if (!finalUrl.includes('.') || finalUrl.includes(' ')) {
         setQrShortLink(finalUrl);
         return;
      }
      finalUrl = `https://${finalUrl}`;
    }

    setIsGeneratingQr(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl: finalUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrShortLink(`https://${defaultDomain}/${data.data.shortCode}`);
      } else {
        setQrShortLink(finalUrl);
      }
    } catch (err) {
      setQrShortLink(finalUrl);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      let finalUrl = longUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      const finalExpiresIn = expiresIn === 'custom' ? `${customDays}d` : expiresIn;
      
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          longUrl: finalUrl, 
          title: title || undefined,
          customAlias: customAlias || undefined, 
          expiresIn: finalExpiresIn || undefined,
          password: requirePassword && password ? password : undefined,
          unlockAt: requireSchedule && unlockAt ? new Date(unlockAt).toISOString() : undefined,
          ogTitle: requireOg && ogTitle ? ogTitle : undefined,
          ogDescription: requireOg && ogDescription ? ogDescription : undefined,
          ogImage: requireOg && ogImage ? ogImage : undefined,
          domainId: domainId || undefined,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create short link');
      }
      
      setResult({
        shortCode: data.data.shortCode,
        domain: domainId ? customDomains.find(d => d.id === domainId)?.domain || defaultDomain : defaultDomain
      });
      
      // Clear form except for result
      setLongUrl('');
      setCustomAlias('');
      setTitle('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.domain}/${result.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-${result?.shortCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Track QR Download
    fetch('/api/track-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortUrl: result?.shortCode })
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-100 selection:text-primary-900 font-sans overflow-x-hidden relative w-full">
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[150px]" />
      </div>
      {/* Navigation */}
      {session ? (
        <UserNavbar user={session.user} />
      ) : (
      <nav className="border-b border-border bg-white fixed top-0 w-full z-50 transition-all">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setResult(null)}>
            <img src="/logo/fyurl-horizontal.png" alt="Fyurl" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => {
                const newLang = lang === 'en' ? 'id' : 'en';
                setLang(newLang);
                localStorage.setItem('fyurl_lang', newLang);
              }}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">{lang === 'en' ? 'EN / ID' : 'ID / EN'}</span>
              <span className="sm:hidden font-semibold">{lang.toUpperCase()}</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDonationModal(true)}
                className="inline-flex items-center justify-center p-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-md hover:-translate-y-0.5" 
                title={t.donation}
              >
                <HandCoins className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline-block">{t.donation}</span>
              </button>
              <button onClick={() => signIn()} className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 hover:shadow-md hover:-translate-y-0.5">
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Hero Section */}
      <main className="pt-36 pb-20 px-6 sm:px-10 lg:px-16 w-full flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/60 text-primary-700 text-sm font-semibold mb-8 hover:scale-105 transition-transform cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
            {t.freeToUse}
          </div>
          <h1 className="w-full text-[2.75rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[6.5rem] font-extrabold text-slate-900 tracking-tight mb-6 flex flex-col md:flex-row items-center justify-center gap-y-1 md:gap-x-4 md:whitespace-nowrap overflow-visible max-w-full">
            <span>{t.makeEveryLink}</span>
            <div className="flex justify-center items-center overflow-visible min-h-[1.5em] relative w-full md:w-auto px-4 md:px-0">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ y: -40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 40, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-transparent bg-clip-text bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-600 p-2 -m-2 inline-block whitespace-nowrap drop-shadow-sm text-center text-[0.9em] sm:text-[0.95em] md:text-[0.85em]"
                >
                  {t.taglines[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-14 leading-relaxed max-w-2xl mx-auto font-medium">
            {t.heroDesc}
          </p>
        </div>

        {/* Action Area (Form or Result) */}
        <div className="w-full max-w-[1400px] mx-auto relative z-10 animate-in zoom-in-95 duration-500 delay-150">
          
          {/* Tabs */}
          <div className="flex bg-white/70 backdrop-blur-lg p-1.5 rounded-t-2xl border border-slate-200/60 border-b-0 w-fit mx-auto sm:mx-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <button
              onClick={() => setActiveTab('shortener')}
              className={`px-7 py-3 text-sm font-bold rounded-xl transition-all duration-300 border whitespace-nowrap ${activeTab === 'shortener' ? 'bg-white text-primary-700 shadow-sm border-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 border-transparent scale-95'}`}
            >
              {t.shortenLink}
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-7 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center border whitespace-nowrap ${activeTab === 'qr' ? 'bg-white text-primary-700 shadow-sm border-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 border-transparent scale-95'}`}
            >
              <QrCode className="w-4 h-4 mr-2" />
              {t.qrGenerator}
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl rounded-tl-none shadow-2xl shadow-slate-200/50 border border-slate-200/60 relative overflow-hidden">
            {/* Soft inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
            
            {activeTab === 'shortener' && (
              !result ? (
              <form onSubmit={handleSubmit} className="p-6 sm:p-10">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="longUrl" className="block text-sm font-semibold text-foreground mb-2">
                      {t.destinationUrl} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="longUrl"
                        type="text"
                        required
                        placeholder="https://your-very-long-url.com/some/path"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 text-base font-medium text-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="customAlias" className="block text-sm font-semibold text-foreground mb-2">
                      {t.customAlias} <span className="text-muted-foreground font-normal">{t.optional}</span>
                    </label>
                    <div className="flex shadow-sm rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
                      {customDomains.length > 0 ? (
                          <div 
                            className="relative flex items-stretch border-r-0 border-slate-300"
                            tabIndex={0}
                            onBlur={(e) => {
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setIsDomainDropdownOpen(false);
                              }
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setIsDomainDropdownOpen(!isDomainDropdownOpen)}
                              className="inline-flex items-center justify-between pl-4 pr-3 py-4 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 text-black font-medium text-sm sm:text-base focus:outline-none w-auto max-w-[240px] hover:bg-slate-100 transition-colors"
                            >
                              <span className="truncate mr-2">
                                {domainId ? customDomains.find(d => d.id === domainId)?.domain : defaultDomain}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isDomainDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {isDomainDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute z-30 left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-y-auto max-h-60"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDomainId("");
                                      setIsDomainDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                                      domainId === "" ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                                    }`}
                                  >
                                    <span className="truncate">{defaultDomain}</span>
                                    {domainId === "" && <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 ml-2" />}
                                  </button>
                                  {customDomains.map(d => (
                                    <button
                                      key={d.id}
                                      type="button"
                                      onClick={() => {
                                        setDomainId(d.id);
                                        setIsDomainDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between border-t border-slate-100 ${
                                        domainId === d.id ? 'bg-primary-50 text-primary-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'
                                      }`}
                                    >
                                      <span className="truncate">{d.domain}</span>
                                      {domainId === d.id && <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 ml-2" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                      ) : (
                        <span className="inline-flex items-center px-4 py-4 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 text-black font-medium text-sm sm:text-base whitespace-nowrap">
                          {defaultDomain}
                        </span>
                      )}
                      <input
                        id="customAlias"
                        type="text"
                        placeholder="my-custom-name"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        pattern="[a-zA-Z0-9-_]+"
                        title="Only letters, numbers, dashes, and underscores are allowed"
                        className="flex-1 block w-full px-4 py-4 text-base font-medium text-black border border-slate-300 rounded-none rounded-r-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white placeholder-slate-400"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t.leaveBlankAuto}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
                      {t.linkTitle} <span className="text-muted-foreground font-normal">{t.optional}</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder={t.titlePlaceholder}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full px-4 py-4 text-base font-medium text-black border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white placeholder-slate-400"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t.titleDesc}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      {t.linkExpiration} <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="relative" 
                      tabIndex={0} 
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center justify-between w-full px-4 py-4 text-base text-left border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${isDropdownOpen ? 'border-primary-500 bg-white ring-2 ring-primary-500 ring-opacity-20' : 'border-border bg-muted/30 hover:bg-white'}`}
                      >
                        <span className="text-foreground font-medium">
                          {EXPIRATION_OPTIONS.find(opt => opt.value === expiresIn)?.label || t.exp7d}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-20 w-full mt-2 py-1 bg-white border border-border rounded-xl shadow-2xl overflow-y-auto max-h-60"
                          >
                            {EXPIRATION_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setExpiresIn(option.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-base hover:bg-primary-50 transition-colors flex items-center justify-between ${
                                  expiresIn === option.value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-foreground'
                                }`}
                              >
                                {option.label}
                                {expiresIn === option.value && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {expiresIn === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          style={{ willChange: "height, opacity" }}
                        >
                          <div className="pt-3 flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max="3650"
                              value={customDays}
                              onChange={(e) => setCustomDays(e.target.value)}
                              className="block w-24 px-4 py-3 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white text-center font-medium shadow-inner shadow-primary-900/5"
                            />
                            <span className="text-muted-foreground font-medium text-sm">{t.days}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Password Protection */}
                  <div className="pt-4 mt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setRequirePassword(!requirePassword)}>
                      <div className="flex items-center gap-2">
                        <Lock className={`w-4 h-4 ${requirePassword ? 'text-primary-600' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold transition-colors ${requirePassword ? 'text-primary-700' : 'text-foreground'}`}>
                          {t.setPassword}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={requirePassword}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${requirePassword ? 'bg-primary-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${requirePassword ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {requirePassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          style={{ willChange: "height, opacity" }}
                        >
                          <div className="pt-3 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none pt-3">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              required={requirePassword}
                              placeholder={t.passwordPlaceholder}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-11 pr-12 py-3 text-sm border border-border rounded-xl focus:outline-none focus:border-primary-500 transition-all bg-muted/30 focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors pt-3"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                            <ShieldAlert className="w-3 h-3 mt-0.5 shrink-0" />
                            {t.passwordDesc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time-Lock / Scheduled Access */}
                  <div className="pt-4 mt-2 border-t border-border">
                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setRequireSchedule(!requireSchedule)}>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${requireSchedule ? 'text-primary-600' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold transition-colors ${requireSchedule ? 'text-primary-700' : 'text-foreground'}`}>
                          {t.setSchedule}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={requireSchedule}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${requireSchedule ? 'bg-primary-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${requireSchedule ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {requireSchedule && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          style={{ willChange: "height, opacity" }}
                        >
                          <div className="pt-3">
                            <div className="relative border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all bg-muted/30 focus-within:bg-white">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              </div>
                            <input
                              type="datetime-local"
                              required={requireSchedule}
                              value={unlockAt}
                              onChange={(e) => setUnlockAt(e.target.value)}
                              min={new Date().toISOString().slice(0, 16)}
                              className="block w-full pl-10 pr-4 py-3 text-[15px] sm:text-base text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 outline-none appearance-none min-h-[50px]"
                              style={{ colorScheme: 'light' }}
                            />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {t.scheduleDesc}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Custom Link Preview (OG) Toggle */}
                  <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-500/10 p-2.5 rounded-lg border border-primary-500/20">
                          <Globe className="h-5 w-5 text-primary-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px]">Custom Link Preview (SEO)</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Customize title, description, and image for social media</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={requireOg}
                        onClick={() => setRequireOg(!requireOg)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          requireOg ? 'bg-primary-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            requireOg ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {requireOg && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          style={{ willChange: "height, opacity" }}
                        >
                          <div className="pt-4 space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Preview Title
                              </label>
                              <input
                                type="text"
                                value={ogTitle}
                                onChange={(e) => setOgTitle(e.target.value)}
                                placeholder="E.g. Download My New App!"
                                className="block w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Preview Description
                              </label>
                              <textarea
                                value={ogDescription}
                                onChange={(e) => setOgDescription(e.target.value)}
                                placeholder="E.g. Check out the latest features in our new app release..."
                                rows={2}
                                className="block w-full px-4 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Preview Image (Max 2MB)
                              </label>
                              <div className="mt-1 flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden">
                                  {ogImage ? (
                                    <div className="absolute inset-0 w-full h-full">
                                      <img src={ogImage} alt="Preview" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Click to change</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                                      <svg className="w-6 h-6 mb-2 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                      </svg>
                                      <p className="mb-1 text-xs text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      <p className="text-[10px] text-slate-500">PNG or JPG (MAX. 2MB)</p>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 2 * 1024 * 1024) {
                                          toast.error("File is too large. Max size is 2MB.");
                                          return;
                                        }
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          setOgImage(event.target?.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              {ogImage && (
                                <button
                                  type="button"
                                  onClick={() => setOgImage(null)}
                                  className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center justify-end w-full"
                                >
                                  Remove Image
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* QR Code Logo */}
                  <div className="pt-4 mt-2 border-t border-border">
                    <label className="block text-sm font-semibold text-foreground mb-2">{t.qrCodeLogo} <span className="text-muted-foreground font-normal">{t.optional}</span></label>
                    <div className="flex items-center gap-2">
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("File is too large. Please upload an image smaller than 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setQrLogo(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-border rounded-xl p-1 bg-white cursor-pointer"
                      />
                      {qrLogo !== '/logo/fyurl-logo-tp.png' && (
                        <button
                          type="button"
                          onClick={() => {
                            setQrLogo('/logo/fyurl-logo-tp.png');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors shrink-0"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !longUrl}
                  className="mt-8 w-full inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-primary-200 disabled:opacity-70 disabled:cursor-not-allowed group shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t.shortening}
                    </>
                  ) : (
                    <>
                      {t.shortenUrl}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-8">{t.linkReady}</h2>
                  
                  <div className="bg-primary-50/50 rounded-2xl border border-primary-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-stretch text-left">
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">{t.shortLinkText}</p>
                    <div className="flex shadow-sm rounded-xl overflow-hidden border border-primary-200 bg-white mb-6">
                      <div className="flex-1 px-4 py-3 truncate text-primary-700 font-medium text-base sm:text-lg flex items-center min-w-0">
                        <span className="truncate">{result.domain.replace(/^www\./, '')}/{result.shortCode}</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="px-4 sm:px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors flex items-center shrink-0"
                      >
                        {copied ? (
                          <><CheckCircle2 className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">{t.copied}</span></>
                        ) : (
                          <><Copy className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">{t.copy}</span></>
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setResult(null)}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors group w-fit"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      {t.createAnother}
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-border shrink-0 md:w-[280px] w-full max-w-[280px]">
                    <div className="mb-6 bg-muted/10 rounded-xl p-2 w-full flex justify-center aspect-square">
                      <QRCodeCanvas 
                        id="qr-canvas"
                        value={`https://${result.domain}/${result.shortCode}`} 
                        size={1024}
                        style={{ width: '100%', height: '100%', maxWidth: '220px', maxHeight: '220px' }}
                        level="H"
                        includeMargin={true}
                        className="rounded-lg"
                        imageSettings={{
                          src: qrLogo,
                          height: 200,
                          width: 200,
                          excavate: true,
                        }}
                      />
                    </div>
                    <button
                      onClick={handleDownloadQR}
                      className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-colors w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t.downloadQR}
                    </button>
                  </div>
                </div>
                </div>
              </div>
              )
            )}
            
            {activeTab === 'qr' && (
              <div className="p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8">
                  <label htmlFor="qrText" className="block text-sm font-semibold text-foreground mb-2">
                    {t.textOrUrl} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="qrText"
                    placeholder={t.textOrUrlPlaceholder}
                    value={qrText}
                    onChange={(e) => {
                      setQrText(e.target.value);
                      setQrShortLink(null);
                    }}
                    className="block w-full px-4 py-4 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white resize-none min-h-[120px]"
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleGenerateTrackableQr}
                      disabled={isGeneratingQr || !qrText.trim()}
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isGeneratingQr ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {lang === 'id' ? 'Memproses...' : 'Processing...'}</>
                      ) : (
                        lang === 'id' ? 'Buat QR Code' : 'Generate QR Code'
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">{t.uploadLogo}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("File is too large. Please upload an image smaller than 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setQrLogo(event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-border rounded-xl p-1 bg-white cursor-pointer"
                      />
                      {qrLogo !== '/logo/fyurl-logo-tp.png' && (
                        <button
                          type="button"
                          onClick={() => {
                            setQrLogo('/logo/fyurl-logo-tp.png');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-foreground mb-2">{t.qrColor}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={qrFgColor} 
                        onChange={(e) => setQrFgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-foreground mb-2">{t.background}</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={qrBgColor} 
                          onChange={(e) => setQrBgColor(e.target.value)}
                          disabled={transparentBg}
                          className={`w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm ${transparentBg ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={transparentBg} 
                          onChange={(e) => setTransparentBg(e.target.checked)} 
                          className="w-4 h-4 rounded border-gray-300 accent-primary-600 cursor-pointer" 
                        />
                        {t.transparent}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-muted/20 rounded-2xl border border-border border-dashed min-h-[480px] w-full">
                  {qrShortLink ? (
                    <>
                      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-border mb-6 w-full max-w-[340px] flex justify-center aspect-square">
                        <QRCodeCanvas 
                          id="qr-canvas-standalone"
                          value={qrShortLink} 
                          size={1024}
                          style={{ width: '100%', height: '100%', maxWidth: '300px', maxHeight: '300px' }}
                          level="H"
                          includeMargin={true}
                          fgColor={qrFgColor}
                          bgColor={transparentBg ? 'rgba(255,255,255,0)' : qrBgColor}
                          imageSettings={qrLogo ? {
                            src: qrLogo,
                            height: 200,
                            width: 200,
                            excavate: true,
                          } : undefined}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const canvas = document.getElementById('qr-canvas-standalone') as HTMLCanvasElement;
                          if (!canvas) return;
                          const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                          const downloadLink = document.createElement('a');
                          downloadLink.href = pngUrl;
                          downloadLink.download = `qr-code.png`;
                          document.body.appendChild(downloadLink);
                          downloadLink.click();
                          document.body.removeChild(downloadLink);
                        }}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t.downloadQRCode}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground opacity-60">
                      <QrCode className="w-16 h-16 mb-4 stroke-1" />
                      <p className="font-medium text-center">{lang === 'id' ? 'Klik tombol Generate untuk membuat QR Code.' : 'Click Generate to create a QR Code.'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>



      {/* Login Features Modal */}
      <AnimatePresence>
        {showFeatureModal && !session && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 sm:p-8 relative">
              <button 
                onClick={() => {
                  setShowFeatureModal(false);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 text-primary-600 rounded-2xl rotate-3 flex items-center justify-center shadow-inner">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 -rotate-3" />
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2 sm:mb-3">
                {lang === 'id' ? 'Cobain Fitur Premium Gratis!' : 'Upgrade Your Experience!'}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 text-center mb-5 sm:mb-8 font-medium">
                {lang === 'id' ? 'Yuk login sekarang buat nikmatin semua fitur keren Fyurl, 100% gratis!' : 'Login now to unlock all exclusive Fyurl features for free.'}
              </p>
              
              <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-10 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm border border-slate-100 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{lang === 'id' ? 'Manajemen Link & QR Code' : 'Link & QR Code Management'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{lang === 'id' ? 'Gampang banget buat ngedit, hapus, atau mantau semua link & QR code bikinanmu.' : 'Edit, delete, and monitor all links and QR codes you have created.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm border border-slate-100 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{lang === 'id' ? 'Statistik Pengunjung Detail' : 'Detailed Visitor Statistics'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{lang === 'id' ? 'Bisa kepoin jumlah klik, asal negara, sampai perangkat yang dipakai pengunjungmu.' : 'Know how many clicks, devices & countries your visitors come from.'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm border border-slate-100 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{lang === 'id' ? 'Pakai Domain Sendiri' : 'Your Own Custom Domain'}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">{lang === 'id' ? 'Bikin link makin kece dan tepercaya pakai domain kamu sendiri (misal: link.namakamu.com).' : 'Use your own domain (e.g. link.yourname.com) for branding.'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => {
                    setShowFeatureModal(false);
                  }}
                  className="flex-1 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors order-2 sm:order-1"
                >
                  {lang === 'id' ? 'Nanti Aja' : 'Try Later'}
                </button>
                <button 
                  onClick={() => signIn()}
                  className="flex-1 py-3 sm:py-3.5 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 order-1 sm:order-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  {lang === 'id' ? 'Login Sekarang' : 'Login Now'}
                </button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not Found Modal */}
      <AnimatePresence>
        {showNotFoundModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <button 
                onClick={() => setShowNotFoundModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {lang === 'id' ? 'Tautan Tidak Ditemukan' : 'Link Not Found'}
                </h3>
                
                <p className="text-slate-500 mb-8 font-medium">
                  {lang === 'id' 
                    ? 'Waduh! Tautan yang Anda cari mungkin sudah dihapus, kedaluwarsa, atau memang tidak pernah ada. Tapi jangan khawatir!' 
                    : 'Oops! The link you are looking for might have been deleted, expired, or never existed. But don\'t worry!'}
                </p>
                
                <button 
                  onClick={() => {
                    setShowNotFoundModal(false);
                    const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                    if (input) {
                      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setTimeout(() => input.focus(), 500);
                    }
                  }}
                  className="w-full py-4 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-5 h-5" />
                  {lang === 'id' ? 'Buat Tautan Anda Sendiri' : 'Create Your Own Link'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
        lang={lang} 
      />
    </div>
  );
}
