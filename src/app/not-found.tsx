import Link from 'next/link';
import { Unlink } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Unlink className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-rose-600 tracking-wide uppercase mb-1">Error 404</h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Halaman Tidak Ditemukan</h1>
        </div>
        <p className="text-slate-500 leading-relaxed text-lg">
          Tautan yang Anda tuju mungkin salah ketik, sudah dihapus, atau tidak pernah ada.
        </p>
        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            Buat Short Link Anda Sendiri
          </Link>
        </div>
        <div className="pt-4 border-t border-slate-100 mt-6">
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Masuk ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
