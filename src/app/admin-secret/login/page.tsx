'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh the router to pass through middleware and redirect to dashboard
        window.location.href = '/admin-secret';
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">Admin<span className="text-primary-600">Only</span></span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Sign in to Dashboard
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter the admin password to manage links and domains.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow-xl shadow-primary-900/5 rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                Admin Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-border rounded-xl shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm bg-muted/20 focus:bg-white"
                  placeholder="Enter your secret password..."
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
