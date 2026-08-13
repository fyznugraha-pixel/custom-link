import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat data...</p>
    </div>
  );
}
