'use client';

import { useState } from 'react';
import { Search, Plus, MoreHorizontal, ExternalLink, Copy, BarChart3, ChevronRight, X, QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import CreateLinkModal from './CreateLinkModal';
import Link from 'next/link';

interface LinkTableClientProps {
  initialLinks: any[];
  customDomains?: any[];
}

export default function LinkTableClient({ initialLinks, customDomains = [] }: LinkTableClientProps) {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [qrModalLink, setQrModalLink] = useState<any | null>(null);

  const filteredLinks = links.filter(
    (link) =>
      link.shortCode.toLowerCase().includes(search.toLowerCase()) ||
      link.longUrl.toLowerCase().includes(search.toLowerCase())
  );

  const defaultDomain = typeof window !== 'undefined' ? window.location.host : 'go.link.com';

  const handleCopy = (link: any) => {
    const domainToUse = link.domain?.domain || defaultDomain;
    navigator.clipboard.writeText(`http://${domainToUse}/${link.shortCode}`);
    alert('Copied to clipboard!');
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-${qrModalLink?.shortCode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200 transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Link
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex relative min-h-[400px]">
        {/* Table View */}
        <div className={`flex-1 transition-all duration-300 ${selectedLink ? 'hidden lg:block lg:w-2/3 border-r border-border' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Short Link
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Original URL
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Clicks
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No links found. Create your first link to get started!
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr 
                      key={link.id} 
                      onClick={() => setSelectedLink(link)}
                      className={`hover:bg-primary-50/50 cursor-pointer transition-colors ${selectedLink?.id === link.id ? 'bg-primary-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-primary-600 truncate max-w-[150px]" title={`${link.domain?.domain || defaultDomain}/${link.shortCode}`}>
                            {link.domain?.domain || defaultDomain}/<span className="font-bold">{link.shortCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap max-w-[200px] xl:max-w-xs truncate text-sm text-muted-foreground">
                        {link.longUrl}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <BarChart3 className="w-4 h-4 mr-2 text-primary-500" />
                          {link.clicks.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopy(link); }}
                            className="text-muted-foreground hover:text-primary-600 transition-colors p-1"
                            title="Copy Link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setQrModalLink(link); }}
                            className="text-muted-foreground hover:text-primary-600 transition-colors p-1"
                            title="Generate QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          <a 
                            href={link.longUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary-600 transition-colors p-1"
                            title="Visit Original URL"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedLink?.id === link.id ? 'transform rotate-90 lg:rotate-0' : ''}`} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Analytics Side Panel (Drawer) */}
        {selectedLink && (
          <div className="w-full lg:w-1/3 bg-white p-6 flex flex-col absolute lg:static inset-0 z-40 lg:z-auto animate-in fade-in slide-in-from-right-8 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                Quick Analytics
              </h3>
              <button 
                onClick={() => setSelectedLink(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="bg-background p-4 rounded-xl shadow-sm border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-foreground">{selectedLink.clicks.toLocaleString()}</p>
              </div>
              
              <div className="bg-background p-4 rounded-xl shadow-sm border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-3">Link Details</p>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Short Link</span>
                    <a href={`http://${selectedLink.domain?.domain || defaultDomain}/${selectedLink.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:underline bg-primary-50 px-2 py-1 rounded inline-block truncate max-w-full">
                      {selectedLink.domain?.domain || defaultDomain}/{selectedLink.shortCode}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Destination</span>
                    <p className="text-sm text-foreground break-all leading-tight bg-muted px-2 py-1 rounded">
                      {selectedLink.longUrl}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Created</span>
                    <p className="text-sm text-foreground font-medium">
                      {new Date(selectedLink.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/dashboard/analytics/${selectedLink.id}`}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-primary-200 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none transition-colors"
              >
                View Full Analytics
              </Link>
            </div>
          </div>
        )}
      </div>

      <CreateLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customDomains={customDomains}
        onSuccess={(newLink) => {
          setLinks([{
            ...newLink,
            createdAt: new Date().toISOString()
          }, ...links]);
        }}
      />

      {/* QR Code Modal */}
      {qrModalLink && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                QR Code
              </h2>
              <button onClick={() => setQrModalLink(null)} className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center bg-muted/30">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
                <QRCodeCanvas 
                  id="qr-canvas"
                  value={`http://${qrModalLink.domain?.domain || defaultDomain}/${qrModalLink.shortCode}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="mt-4 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full truncate max-w-full">
                {qrModalLink.domain?.domain || defaultDomain}/{qrModalLink.shortCode}
              </p>
            </div>
            
            <div className="p-6 border-t border-border bg-gray-50 flex justify-end">
              <button
                onClick={handleDownloadQR}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-all focus:outline-none focus:ring-4 focus:ring-primary-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
