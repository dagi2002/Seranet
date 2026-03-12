import { Badge } from '@/components/ui/badge';
import type { OrderStatus, PaymentStatus } from '@/types/seranet';
import { statusLabel } from '@/utils';

export function StatusBadge({ status }: { status: OrderStatus | PaymentStatus }) {
  const variant =
    status === 'paid' || status === 'fulfilled' || status === 'success'
      ? 'success'
      : status === 'pending' || status === 'initiated'
        ? 'warning'
        : status === 'cancelled' || status === 'failed'
          ? 'danger'
          : 'info';

  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}
