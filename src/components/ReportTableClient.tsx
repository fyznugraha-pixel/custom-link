'use client';

import { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, Search, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ReportTableClient({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) || r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast.success('Report status updated');
      } else {
        toast.error('Failed to update report status');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report record?')) return;
    
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        toast.success('Report deleted successfully');
      } else {
        toast.error('Failed to delete report');
      }
    } catch (err) {
      toast.error('Request failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-colors"
          />
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto">
          {['all', 'pending', 'resolved', 'dismissed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Report Details</th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-3 sm:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center text-foreground font-medium mb-1">
                          <ShieldAlert className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-[300px]">{report.shortUrl}</span>
                          <a href={report.shortUrl} target="_blank" rel="noopener noreferrer" className="ml-1 sm:ml-2 text-muted-foreground hover:text-primary-600 shrink-0">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[300px]">{report.reason}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        {report.status === 'resolved' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Resolved
                          </span>
                        )}
                        {report.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-4 h-4 mr-1" /> Pending
                          </span>
                        )}
                        {report.status === 'dismissed' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            <XCircle className="w-4 h-4 mr-1" /> Dismissed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
                        {report.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(report.id, 'resolved')}
                              disabled={updatingId === report.id}
                              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors font-medium whitespace-nowrap"
                            >
                              Resolve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                              disabled={updatingId === report.id}
                              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors font-medium whitespace-nowrap"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(report.id)}
                          disabled={updatingId === report.id}
                          title="Delete Report"
                          className="p-1 sm:p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
    </>
  );
}
