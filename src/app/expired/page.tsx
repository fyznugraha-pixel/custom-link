import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function ExpiredPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Link Expired</h1>
        <p className="text-slate-500 leading-relaxed text-lg">
          The link you are trying to access has passed its expiration date and is no longer available.
        </p>
        <div className="pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            Create Your Own Short Link
          </Link>
        </div>
      </div>
    </div>
  );
}
