import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
