'use client';

import { useState } from 'react';
import { Plus, Globe, CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, X, Loader2, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DomainTableClient({ initialDomains }: { initialDomains: any[] }) {
  const [domains, setDomains] = useState(initialDomains);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);

  const handleSetPrimary = async (id: string) => {
    setSettingPrimaryId(id);
    try {
      const res = await fetch('/api/domains/primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId: id }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setDomains(domains.map(d => ({
          ...d,
          isPrimary: d.id === id
        })));
        toast.success('Primary domain set successfully');
      } else {
        toast.error(data.error || 'Failed to set primary domain');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setDomains([{...data.data, createdAt: new Date().toISOString()}, ...domains]);
      setNewDomain('');
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/domains/${id}/verify`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setDomains(domains.map(d => d.id === id ? data.data : d));
        toast.success('Domain verified successfully');
      } else {
        setDomains(domains.map(d => d.id === id ? data.data : d)); // updates status to failed
        toast.error(data.error);
      }
    } catch (err: any) {
      toast.error('Verification request failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom domain? All links using this domain will stop working properly until they are reassigned.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/domains/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDomains(domains.filter(d => d.id !== id));
        toast.success('Domain deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete domain');
      }
    } catch (err: any) {
      toast.error('Delete request failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Domain
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Added On</th>
                <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No custom domains added yet.
                  </td>
                </tr>
              ) : (
                domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 sm:px-6 py-4 sm:py-5">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground mr-2 sm:mr-3 shrink-0" />
                          <span className="font-medium text-foreground text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{domain.domain}</span>
                        </div>
                        {domain.isPrimary && (
                          <span className="mt-1 sm:mt-0 sm:ml-3 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200 w-fit">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-amber-500 text-amber-500" />
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center">
                        {domain.status === 'verified' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Active
                          </span>
                        )}
                        {domain.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle className="w-4 h-4 mr-1" /> Pending Verification
                          </span>
                        )}
                        {domain.status === 'failed' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-4 h-4 mr-1" /> Verification Failed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-5 text-sm text-muted-foreground">
                      {new Date(domain.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 sm:py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {domain.status !== 'verified' ? (
                          <button 
                            onClick={() => handleVerify(domain.id)}
                            disabled={verifyingId === domain.id || deletingId === domain.id}
                            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-border text-[10px] sm:text-xs font-medium rounded-lg text-foreground bg-white hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {verifyingId === domain.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                            Verify
                          </button>
                        ) : (
                          <>
                            {!domain.isPrimary && (
                              <button 
                                onClick={() => handleSetPrimary(domain.id)}
                                disabled={settingPrimaryId === domain.id}
                                className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-amber-200 text-[10px] sm:text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                              >
                                {settingPrimaryId === domain.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" /> : <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                                <span className="hidden sm:inline">Set Primary</span>
                                <span className="sm:hidden">Primary</span>
                              </button>
                            )}
                            <span className="text-[10px] sm:text-xs text-muted-foreground italic px-1 sm:px-2 hidden lg:inline">Ready to use</span>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(domain.id)}
                          disabled={deletingId === domain.id}
                          title="Delete Domain"
                          className="p-1 sm:p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === domain.id ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Domain Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Add Custom Domain</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDomain} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-foreground mb-1">
                    Domain Name
                  </label>
                  <input
                    id="domain"
                    type="text"
                    required
                    placeholder="link.mycompany.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    You will need to configure DNS records after adding the domain.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-70 flex items-center justify-center min-w-[100px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Add Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Instructions for unverified domains */}
      {domains.filter(d => d.status !== 'verified').length > 0 && (
        <div className="mt-8 bg-primary-50 rounded-xl p-6 border border-primary-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            DNS Configuration Required
          </h3>
          <p className="text-sm text-primary-800 mb-4">
            To verify ownership of your domains, please add the following TXT record to your DNS provider (Cloudflare, GoDaddy, etc):
          </p>
          <div className="space-y-4">
            {domains.filter(d => d.status !== 'verified').map(d => (
              <div key={d.id} className="bg-white rounded-lg p-4 border border-primary-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.domain}</p>
                  <p className="text-xs text-muted-foreground mt-1">Type: TXT &nbsp;&nbsp;|&nbsp;&nbsp; Name: @ (or root)</p>
                </div>
                <div className="flex-1 max-w-lg bg-muted rounded p-2 flex items-center justify-between group">
                  <code className="text-xs text-foreground font-mono break-all pr-4">link-verification={d.id}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`link-verification=${d.id}`);
                      toast.success('Copied to clipboard');
                    }}
                    className="text-muted-foreground hover:text-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                    title="Copy value"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-primary-800 mt-6 pt-4 border-t border-primary-200">
            Once you have added the TXT record, it may take up to 24 hours to propagate globally. You can click "Verify" to check the status.
          </p>
        </div>
      )}
    </>
  );
}
