import { useMemo } from 'react';
import { DEFAULT_PRIMARY_COLOR } from '@/utils';

export function MerchantThemeStyle({ color }: { color?: string }) {
  const safeColor = useMemo(() => color || DEFAULT_PRIMARY_COLOR, [color]);

  return (
    <style>
      {`
        :root {
          --store-primary: ${safeColor};
        }
        .store-primary-bg { background-color: var(--store-primary); }
        .store-primary-text { color: var(--store-primary); }
        .store-primary-border { border-color: var(--store-primary); }
        .store-primary-soft { background: linear-gradient(135deg, ${safeColor}22, ${safeColor}08); }
      `}
    </style>
  );
}
