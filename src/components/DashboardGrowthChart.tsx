"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

type DataPoint = {
  date: string;
  newUsers: number;
  newLinks: number;
  clicks: number;
  activeUsers: number;
  pageViews: number;
  qrGenerated: number;
};

export default function DashboardGrowthChart({ data }: { data: DataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
        No data available for this period.
      </div>
    );
  }

  const ChartCard = ({ title, dataKey, stroke, fill, gradientId }: { title: string, dataKey: string, stroke: string, fill: string, gradientId: string }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col h-[250px]">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={stroke} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={5} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
            <Area type="monotone" dataKey={dataKey} name={title} stroke={stroke} fillOpacity={1} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ChartCard title="Website Visitors" dataKey="pageViews" stroke="#f43f5e" fill="#f43f5e" gradientId="colorPageViews" />
      <ChartCard title="Short Link Clicks" dataKey="clicks" stroke="#f59e0b" fill="#f59e0b" gradientId="colorClicks" />
      <ChartCard title="Active Users" dataKey="activeUsers" stroke="#10b981" fill="#10b981" gradientId="colorActive" />
      <ChartCard title="New Users" dataKey="newUsers" stroke="#3b82f6" fill="#3b82f6" gradientId="colorUsers" />
      <ChartCard title="New Links" dataKey="newLinks" stroke="#8b5cf6" fill="#8b5cf6" gradientId="colorLinks" />
      <ChartCard title="QR Downloaded" dataKey="qrGenerated" stroke="#0ea5e9" fill="#0ea5e9" gradientId="colorQr" />
    </div>
  );
}
