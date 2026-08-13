'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLink: any) => void;
  customDomains?: any[];
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess, customDomains = [] }: CreateLinkModalProps) {
  const primaryDomain = customDomains.find(d => d.isPrimary);
  
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [domainId, setDomainId] = useState(primaryDomain ? primaryDomain.id : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl, customAlias: customAlias || undefined, domainId: domainId || undefined }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create link');
      
      onSuccess(data.data);
      setLongUrl('');
      setCustomAlias('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const defaultDomain = typeof window !== 'undefined' ? window.location.host : 'fyurl.fun';
  const selectedDomainDisplay = domainId ? customDomains?.find(d => d.id === domainId)?.domain || defaultDomain : defaultDomain;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary-50 p-2 rounded-lg text-primary-600">
              <LinkIcon size={20} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Create New Link</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="longUrl" className="block text-sm font-medium text-foreground mb-1">
                Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                id="longUrl"
                type="url"
                required
                placeholder="https://example.com/very-long-url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
            
            <div>
              <label htmlFor="domainId" className="block text-sm font-medium text-foreground mb-1">
                Domain
              </label>
              <select
                id="domainId"
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white"
              >
                <option value="">{defaultDomain} (Default)</option>
                {customDomains.map(d => (
                  <option key={d.id} value={d.id}>{d.domain}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="customAlias" className="block text-sm font-medium text-foreground mb-1">
                Custom Alias (Optional)
              </label>
              <div className="flex shadow-sm rounded-lg overflow-hidden">
                <span className="inline-flex items-center px-3 border border-r-0 border-border bg-muted text-muted-foreground text-sm truncate max-w-[150px] sm:max-w-[200px]" title={selectedDomainDisplay}>
                  {selectedDomainDisplay}/
                </span>
                <input
                  id="customAlias"
                  type="text"
                  placeholder="my-campaign"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="flex-1 block w-full px-4 py-2 rounded-none rounded-r-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-70 flex items-center justify-center min-w-[100px]"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
