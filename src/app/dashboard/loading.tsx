import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
      <p className="text-muted-foreground font-medium animate-pulse">Loading data...</p>
    </div>
  );
}
