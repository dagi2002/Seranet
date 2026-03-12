import { Loader2 } from 'lucide-react';

export function LoadingScreen({ message = 'Loading Seranet...' }: { message?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="surface-panel flex flex-col items-center gap-4 px-8 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">Seranet</p>
          <p className="mt-1 text-sm font-medium text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
}
