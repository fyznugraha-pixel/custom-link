'use client';

import { useState } from 'react';
import { ArrowLeft, QrCode, Download, Link as LinkIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Link from 'next/link';

export default function QrGenerator() {
  const [inputValue, setInputValue] = useState('');

  const handleDownloadQR = () => {
    const canvas = document.getElementById('standalone-qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-code.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900 font-sans">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">CustomLink</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shortener
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 border border-primary-100">
            <QrCode className="w-4 h-4 text-primary-600" />
            Instant QR Generator
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-6">
            Generate QR codes in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">seconds.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Type or paste any text, link, or information below to instantly generate a high-quality QR code. No sign up required.
          </p>
        </div>

        {/* Action Area */}
        <div className="max-w-3xl mx-auto relative z-10 animate-in zoom-in-95 duration-500 delay-150 w-full">
          <div className="bg-white rounded-2xl shadow-xl shadow-primary-900/5 border border-border overflow-hidden">
            <div className="p-6 sm:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Input Section */}
                <div className="flex-1 w-full space-y-4">
                  <label htmlFor="qrInput" className="block text-sm font-semibold text-foreground">
                    Content / URL
                  </label>
                  <textarea
                    id="qrInput"
                    placeholder="Enter a website URL, text, or contact information..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="block w-full px-4 py-4 text-base border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-muted/30 focus:bg-white min-h-[160px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    The QR code updates automatically as you type.
                  </p>
                </div>

                {/* Result Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border md:w-[260px] shrink-0">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-border mb-4 transition-all w-full flex justify-center">
                    {inputValue.trim() ? (
                      <QRCodeCanvas 
                        id="standalone-qr-canvas"
                        value={inputValue} 
                        size={180}
                        level="H"
                        includeMargin={true}
                        className="animate-in fade-in zoom-in duration-300"
                      />
                    ) : (
                      <div className="w-[180px] h-[180px] bg-muted/50 rounded flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                        <QrCode className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium text-center px-4">Enter content to generate</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    disabled={!inputValue.trim()}
                    className="inline-flex items-center justify-center px-4 py-3 border border-border rounded-lg text-sm font-medium text-foreground bg-white hover:bg-muted transition-colors shadow-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
