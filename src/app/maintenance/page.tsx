import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Fitur Sedang Diperbaiki</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Mohon maaf, fitur Login/Registrasi via Google sedang dalam perbaikan sementara waktu untuk peningkatan keamanan. Silakan gunakan metode pendaftaran menggunakan Email dan Password.
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}
