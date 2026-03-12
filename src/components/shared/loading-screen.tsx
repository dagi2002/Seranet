import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading Seranet...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-soft">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
}
