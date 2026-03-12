import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-2xl bg-[linear-gradient(90deg,rgba(226,232,240,1)_25%,rgba(241,245,249,1)_37%,rgba(226,232,240,1)_63%)] bg-[length:400%_100%]',
        className,
      )}
    />
  );
}
