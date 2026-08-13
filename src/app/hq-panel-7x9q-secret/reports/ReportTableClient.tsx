'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ShieldAlert, Check, X, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Report = {
  id: string;
  shortUrl: string;
  reason: string;
  status: string;
  createdAt: Date;
};

export default function ReportTableClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating status');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report permanently?')) return;
    setIsUpdating(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete report');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting report');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Short URL</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                  <p>No reports found. All good!</p>
                </td>
              </tr>
            ) : reports.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <a href={`/${report.shortUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary-600 transition-colors">
                    {report.shortUrl} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-md truncate" title={report.reason}>
                  {report.reason}
                </td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'dismissed' ? 'bg-slate-100 text-slate-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {report.status === 'resolved' && <Check className="w-3 h-3 mr-1" />}
                    {report.status === 'dismissed' && <X className="w-3 h-3 mr-1" />}
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  {report.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(report.id, 'resolved')}
                        disabled={isUpdating === report.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                        disabled={isUpdating === report.id}
                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {report.status !== 'pending' && (
                    <button 
                      onClick={() => handleDelete(report.id)}
                      disabled={isUpdating === report.id}
                      title="Delete Report"
                      className="inline-flex items-center p-1.5 border border-transparent text-xs font-medium rounded-md text-red-500 hover:bg-red-50 focus:outline-none disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
