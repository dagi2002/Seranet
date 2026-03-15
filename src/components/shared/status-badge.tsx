import { Badge } from '@/components/ui/badge';
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from '@/types/seranet';
import { fulfillmentLabel, statusLabel } from '@/utils';

type BadgeStatus = OrderStatus | PaymentStatus | FulfillmentStatus;

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const variant =
    status === 'paid' || status === 'fulfilled' || status === 'success' || status === 'delivered'
      ? 'success'
      : status === 'pending' || status === 'initiated'
        ? 'warning'
        : status === 'cancelled' || status === 'failed'
          ? 'danger'
          : 'info';

  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
}

export function FulfillmentBadge({ status }: { status: FulfillmentStatus }) {
  const variant =
    status === 'delivered'
      ? 'success'
      : status === 'out_for_delivery'
        ? 'info'
        : status === 'preparing' || status === 'confirmed'
          ? 'warning'
          : 'warning';

  return <Badge variant={variant}>{fulfillmentLabel(status)}</Badge>;
}
