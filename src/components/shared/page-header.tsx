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
    <div className="surface-panel flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 text-balance sm:text-[2rem]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[0.95rem]">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
