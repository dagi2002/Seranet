import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppScreen } from '../../../../src/components/AppScreen';
import { EmptyState } from '../../../../src/components/EmptyState';
import { PriceText } from '../../../../src/components/PriceText';
import { useOrderStatusQuery, usePaymentStatusQuery } from '../../../../src/features/order-status/queries';
import { useSessionStore } from '../../../../src/state/session-store';
import { colors, spacing } from '../../../../src/theme/theme';
import { Button } from '../../../../src/components/ui/Button';
import { FeatherIcon } from '../../../../src/components/ui/Icon';
import { LoadingState } from '../../../../src/components/ui/LoadingState';
import { SectionHeader } from '../../../../src/components/ui/SectionHeader';
import { StatusBadge } from '../../../../src/components/ui/StatusBadge';
import { SurfaceCard } from '../../../../src/components/ui/SurfaceCard';
import { ThemeText } from '../../../../src/components/ui/ThemeText';
import type { FulfillmentStatus, PaymentProvider } from '../../../../src/types/api';

function isManualPayment(provider?: string) {
  return provider === 'cash_on_delivery' || provider === 'bank_transfer';
}

function paymentProviderLabel(provider?: PaymentProvider | string) {
  switch (provider) {
    case 'telebirr':
      return 'Telebirr';
    case 'cash_on_delivery':
      return 'Cash on Delivery';
    case 'bank_transfer':
      return 'Bank Transfer';
    default:
      return 'Unknown';
  }
}

const FULFILLMENT_STEPS: Array<{ key: FulfillmentStatus; label: string }> = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function getFulfillmentStepIndex(status: FulfillmentStatus) {
  return FULFILLMENT_STEPS.findIndex((s) => s.key === status);
}

export default function OrderStatusScreen() {
  const params = useLocalSearchParams<{ slug: string; orderId: string; accessToken?: string; paymentError?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId ?? '';
  const accessTokenParam = Array.isArray(params.accessToken) ? params.accessToken[0] : params.accessToken;
  const paymentError = Array.isArray(params.paymentError) ? params.paymentError[0] : params.paymentError;
  const storedSession = useSessionStore((state) => state.lastOrderBySlug[slug]);
  const storedAccessToken = storedSession && storedSession.orderId === orderId ? storedSession.accessToken : undefined;
  const accessToken = accessTokenParam ?? storedAccessToken;

  if (!accessToken) {
    return (
      <AppScreen>
        <EmptyState
          iconName="alert-circle"
          title="Order access token missing"
          description="The order exists, but the app does not have the public access token needed to check its status."
        />
      </AppScreen>
    );
  }

  const orderQuery = useOrderStatusQuery(slug, orderId, accessToken);
  const paymentQuery = usePaymentStatusQuery(slug, orderId, accessToken);

  if (orderQuery.isLoading && !orderQuery.data) {
    return (
      <AppScreen>
        <LoadingState label="Checking order status..." />
      </AppScreen>
    );
  }

  const payment = paymentQuery.data;
  const order = orderQuery.data;
  const manualPayment = payment ? isManualPayment(payment.provider) : false;
  const currentFulfillmentIndex = order ? getFulfillmentStepIndex(order.fulfillment_status) : 0;

  // Header text based on payment provider
  const headerTitle = manualPayment ? 'Order placed' : 'Track payment and fulfillment';
  const headerDescription = manualPayment
    ? payment?.provider === 'cash_on_delivery'
      ? 'Pay cash when your order is delivered.'
      : 'The merchant will confirm your bank transfer shortly.'
    : 'Polling for payment and fulfillment updates.';

  return (
    <AppScreen scroll scrollContentStyle={{ paddingBottom: 36 }}>
      <SectionHeader
        description={headerDescription}
        eyebrow="Order status"
        title={headerTitle}
      />

      {paymentError ? (
        <SurfaceCard style={styles.warningCard}>
          <View style={styles.inlineRow}>
            <FeatherIcon color={colors.danger} name="alert-triangle" size={16} />
            <ThemeText color={colors.danger}>Payment initiation warning: {paymentError}</ThemeText>
          </View>
        </SurfaceCard>
      ) : null}

      {/* Order summary with price breakdown */}
      {order ? (
        <SurfaceCard style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemeText variant="sectionTitle">Order summary</ThemeText>
            <StatusBadge status={order.status} />
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Order number</ThemeText>
            <ThemeText variant="bodyStrong">{order.order_number}</ThemeText>
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Product total</ThemeText>
            <PriceText amount={order.product_total} />
          </View>
          {order.delivery_fee > 0 ? (
            <View style={styles.infoRow}>
              <ThemeText muted>Delivery fee</ThemeText>
              <PriceText amount={order.delivery_fee} />
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <ThemeText muted>Total</ThemeText>
            <PriceText amount={order.total_amount} style={styles.totalValue} />
          </View>
        </SurfaceCard>
      ) : orderQuery.error instanceof Error ? (
        <EmptyState iconName="x-circle" title="Order unavailable" description={orderQuery.error.message} />
      ) : null}

      {/* Payment card */}
      {payment ? (
        <SurfaceCard accent style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemeText variant="sectionTitle">Payment</ThemeText>
            <StatusBadge status={payment.status} />
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Method</ThemeText>
            <ThemeText variant="bodyStrong">{paymentProviderLabel(payment.provider)}</ThemeText>
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Amount</ThemeText>
            <PriceText amount={payment.amount} />
          </View>
          {payment.telebirr_txn_id ? (
            <View style={styles.infoRow}>
              <ThemeText muted>Telebirr reference</ThemeText>
              <ThemeText variant="bodyStrong">{payment.telebirr_txn_id}</ThemeText>
            </View>
          ) : null}
          {payment.bank_transfer_ref ? (
            <View style={styles.infoRow}>
              <ThemeText muted>Transfer ref</ThemeText>
              <ThemeText variant="bodyStrong">{payment.bank_transfer_ref}</ThemeText>
            </View>
          ) : null}
          {!manualPayment && !payment.telebirr_txn_id ? (
            <ThemeText muted>Waiting for payment confirmation...</ThemeText>
          ) : null}
        </SurfaceCard>
      ) : paymentQuery.error instanceof Error ? (
        <SurfaceCard style={styles.panel}>
          <ThemeText muted>{paymentQuery.error.message}</ThemeText>
        </SurfaceCard>
      ) : (
        <SurfaceCard style={styles.panel}>
          <ThemeText muted>Waiting for payment record...</ThemeText>
        </SurfaceCard>
      )}

      {/* Fulfillment stepper */}
      {order ? (
        <SurfaceCard style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemeText variant="sectionTitle">Fulfillment</ThemeText>
            <StatusBadge status={order.fulfillment_status} />
          </View>
          <View style={styles.stepper}>
            {FULFILLMENT_STEPS.map((step, index) => {
              const isCompleted = index <= currentFulfillmentIndex;
              const isCurrent = index === currentFulfillmentIndex;
              return (
                <View key={step.key} style={styles.stepItem}>
                  <View style={styles.stepIndicatorColumn}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isCompleted ? (
                        <FeatherIcon color={colors.white} name="check" size={12} />
                      ) : null}
                    </View>
                    {index < FULFILLMENT_STEPS.length - 1 ? (
                      <View
                        style={[
                          styles.stepLine,
                          isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    ) : null}
                  </View>
                  <ThemeText
                    variant={isCurrent ? 'bodyStrong' : 'body'}
                    color={isCompleted ? colors.text : colors.textSoft}
                    style={styles.stepLabel}
                  >
                    {step.label}
                  </ThemeText>
                </View>
              );
            })}
          </View>
        </SurfaceCard>
      ) : null}

      <Button
        fullWidth
        iconLeft={<FeatherIcon color={colors.white} name="home" size={16} />}
        onPress={() => router.replace({ pathname: '/store/[slug]', params: { slug } })}
        size="lg"
      >
        Back to storefront
      </Button>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  warningCard: {
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  panel: {
    gap: spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  totalValue: {
    color: colors.brand,
  },
  stepper: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIndicatorColumn: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundMuted,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  stepDotCurrent: {
    borderColor: colors.brand,
    borderWidth: 3,
  },
  stepLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
  },
  stepLineCompleted: {
    backgroundColor: colors.brand,
  },
  stepLabel: {
    paddingTop: 2,
    paddingBottom: 12,
  },
});
