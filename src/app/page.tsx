'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Link as LinkIcon, Globe, Shield, Zap, Copy, Download, Loader2, CheckCircle2, QrCode, ChevronDown, Trash2, ShieldAlert } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const TAGLINE_WORDS = ["count.", "short.", "easy.", "yours.", "trackable.", "powerful."];
const EXPIRATION_OPTIONS = [
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days (Default)' },
  { value: '30d', label: '30 Days' },
  { value: 'custom', label: 'Custom...' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'shortener' | 'qr'>('shortener');
  const [longUrl, setLongUrl] = useState('');
  const [qrText, setQrText] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresIn, setExpiresIn] = useState('7d');
  const [customDays, setCustomDays] = useState('60');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [qrLogo, setQrLogo] = useState('/logo/fyurl-logo.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ shortCode: string; domain: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  const [defaultDomain, setDefaultDomain] = useState('link.byfayiz.web.id');

  useEffect(() => {
    setDefaultDomain(window.location.host);
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % TAGLINE_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const finalExpiresIn = expiresIn === 'custom' ? `${customDays}d` : expiresIn;
      
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl, customAlias: customAlias || undefined, expiresIn: finalExpiresIn || undefined }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create short link');
      }
      
      setResult({
        shortCode: data.data.shortCode,
        domain: defaultDomain
      });
      
      // Clear form except for result
      setLongUrl('');
      setCustomAlias('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`http://${result.domain}/${result.shortCode}`);
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
  };

  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900 font-sans">
      {/* Navigation */}
      <nav className="border-b border-border bg-white fixed top-0 w-full z-50 transition-all">
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setResult(null)}>
            <img src="/logo/fyurl-horizontal.png" alt="Fyurl" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
          </div>
          
          <div className="flex items-center gap-6">
            <a href="https://saweria.co/payes" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-md hover:-translate-y-0.5">
              Donation
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 sm:px-10 lg:px-16 w-full flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 border border-primary-100">
            <Zap className="w-4 h-4 text-primary-600" />
            Free to use
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight mb-6 flex flex-col md:flex-row items-center justify-center gap-y-2 md:gap-x-4 md:whitespace-nowrap overflow-visible leading-tight">
            <span>Make every link</span>
            <div className="flex justify-center items-center overflow-visible min-h-[1.5em] relative">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={wordIndex}
                  initial={{ y: -40, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 40, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500 p-2 -m-2 inline-block whitespace-nowrap"
                >
                  {TAGLINE_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Redefine how you share. Shrink endless URLs into clean, memorable links and instantly generate stunning QR codes. Fast, secure, and ready to use. No account needed.
          </p>
        </div>

        {/* Action Area (Form or Result) */}
        <div className="w-full max-w-[1400px] mx-auto relative z-10 animate-in zoom-in-95 duration-500 delay-150">
          
          {/* Tabs */}
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-t-2xl border border-border border-b-0 w-fit mx-auto sm:mx-0">
            <button
              onClick={() => setActiveTab('shortener')}
              className={`px-6 py-3 text-sm font-semibold rounded-t-xl transition-colors ${activeTab === 'shortener' ? 'bg-white text-primary-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border border-border border-b-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Shorten Link
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-6 py-3 text-sm font-semibold rounded-t-xl transition-colors flex items-center ${activeTab === 'qr' ? 'bg-white text-primary-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border border-border border-b-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </button>
          </div>

          <div className="bg-white rounded-2xl rounded-tl-none shadow-xl shadow-primary-900/5 border border-border relative">
            
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
                      Destination URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        id="longUrl"
                        type="url"
                        required
                        placeholder="https://your-very-long-url.com/some/path"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="customAlias" className="block text-sm font-semibold text-foreground mb-2">
                      Custom Alias <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
                      <span className="inline-flex items-center px-4 border border-r-0 border-border bg-muted/50 text-muted-foreground text-sm sm:text-base whitespace-nowrap">
                        {defaultDomain}/
                      </span>
                      <input
                        id="customAlias"
                        type="text"
                        placeholder="my-custom-name"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        pattern="[a-zA-Z0-9-_]+"
                        title="Only letters, numbers, dashes, and underscores are allowed"
                        className="flex-1 block w-full px-4 py-4 text-base border border-border rounded-none rounded-r-xl focus:outline-none bg-muted/30 focus:bg-white"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Leave blank to auto-generate a random short code.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Link Expiration <span className="text-red-500">*</span>
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
                          {EXPIRATION_OPTIONS.find(opt => opt.value === expiresIn)?.label || '7 Days (Default)'}
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
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max="3650"
                              value={customDays}
                              onChange={(e) => setCustomDays(e.target.value)}
                              className="block w-24 px-4 py-3 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white text-center font-medium shadow-inner shadow-primary-900/5"
                            />
                            <span className="text-muted-foreground font-medium text-sm">Days</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                      Shortening...
                    </>
                  ) : (
                    <>
                      Shorten URL
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-8">Your link is ready!</h2>
                
                <div className="bg-primary-50/50 rounded-2xl border border-primary-100 p-6 flex flex-col md:flex-row gap-6 items-stretch text-left">
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Short Link</p>
                    <div className="flex shadow-sm rounded-xl overflow-hidden border border-primary-200 bg-white mb-6">
                      <div className="flex-1 px-4 py-3 truncate text-primary-700 font-medium text-base sm:text-lg flex items-center min-w-0">
                        <span className="truncate">{result.domain.replace(/^www\./, '')}/{result.shortCode}</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="px-4 sm:px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors flex items-center shrink-0"
                      >
                        {copied ? (
                          <><CheckCircle2 className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Copied</span></>
                        ) : (
                          <><Copy className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Copy</span></>
                        )}
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setResult(null)}
                      className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors group w-fit"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                      Create another link
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-border shrink-0 md:w-[180px]">
                    <div className="mb-4 bg-muted/10 rounded-xl p-1">
                      <QRCodeCanvas 
                        id="qr-canvas"
                        value={`http://${result.domain}/${result.shortCode}`} 
                        size={1024}
                        style={{ width: '130px', height: '130px' }}
                        level="H"
                        includeMargin={true}
                        className="rounded-lg"
                        imageSettings={{
                          src: '/logo/fyurl-logo.png',
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
                      Download QR
                    </button>
                  </div>
                </div>
              </div>
              )
            )}
            
            {activeTab === 'qr' && (
              <div className="p-6 sm:p-10 animate-in fade-in duration-300">
                <div className="mb-8">
                  <label htmlFor="qrText" className="block text-sm font-semibold text-foreground mb-2">
                    Text or URL <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="qrText"
                    placeholder="Enter any text or URL to generate a QR code instantly..."
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="block w-full px-4 py-4 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white resize-none min-h-[120px]"
                  />
                </div>

                <div className="mb-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-sm font-semibold text-foreground mb-2">Upload Custom Logo (Max 2MB)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("File is too large. Please upload an image smaller than 2MB.");
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
                      {qrLogo !== '/logo/fyurl-logo.png' && (
                        <button
                          type="button"
                          onClick={() => {
                            setQrLogo('/logo/fyurl-logo.png');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100 shrink-0"
                          title="Remove custom logo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-foreground mb-2">QR Color</label>
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
                    <label className="block text-sm font-semibold text-foreground mb-2">Background</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={qrBgColor} 
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-muted/20 rounded-2xl border border-border border-dashed min-h-[480px] w-full">
                  {qrText.trim() ? (
                    <>
                      <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-border mb-6 w-full max-w-[340px] flex justify-center aspect-square">
                        <QRCodeCanvas 
                          id="qr-canvas-standalone"
                          value={qrText} 
                          size={1024}
                          style={{ width: '100%', height: '100%', maxWidth: '300px', maxHeight: '300px' }}
                          level="H"
                          includeMargin={true}
                          fgColor={qrFgColor}
                          bgColor={qrBgColor}
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
                          downloadLink.click();
                        }}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center py-8">
                      <QrCode className="w-12 h-12 mb-4 opacity-20" />
                      <p>Type something above to see your QR code</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="mt-20 pb-8 pt-4 border-t border-slate-200/60 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Fyurl. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/report" className="hover:text-red-500 transition-colors flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-4 h-4" />
            Report Abuse
          </Link>
        </div>
      </footer>
    </div>
  );
}
