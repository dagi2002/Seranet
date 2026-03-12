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
    <div className="surface-panel rounded-[2rem] border-dashed px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 shadow-sm">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
