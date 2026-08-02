import Link from 'next/link';
import { ArrowRight, Link as LinkIcon, BarChart3, Globe, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">
      {/* Navigation */}
      <nav className="border-b border-border bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">CustomLink</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:shadow-md hover:-translate-y-0.5">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 border border-primary-100">
            <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse"></span>
            Enterprise-grade link management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-8">
            Short links, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">big results.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Build your brand's authority with custom domains, track every click in real-time, and protect your links with enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 group">
              Go to Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-100 transition-all">
              <Globe className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Custom Domains</h3>
            <p className="text-muted-foreground leading-relaxed">
              Connect your own domain to brand your short links and increase click-through rates seamlessly.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Real-time Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track clicks, referrers, locations, and device types instantly with our beautiful Bento grid dashboard.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-green-100 transition-all">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Enterprise Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              Built-in rate limiting and anti-abuse blocklists keep your platform safe, reliable, and highly performant.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
