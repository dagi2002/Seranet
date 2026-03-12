import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
