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

  return (
    <AppScreen scroll scrollContentStyle={{ paddingBottom: 36 }}>
      <SectionHeader
        description="This screen keeps polling the shared backend until the simulated payment is completed."
        eyebrow="Order status"
        title="Track payment and fulfillment"
      />

      {paymentError ? (
        <SurfaceCard style={styles.warningCard}>
          <View style={styles.inlineRow}>
            <FeatherIcon color={colors.danger} name="alert-triangle" size={16} />
            <ThemeText color={colors.danger}>Payment initiation warning: {paymentError}</ThemeText>
          </View>
        </SurfaceCard>
      ) : null}

      {orderQuery.data ? (
        <SurfaceCard style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemeText variant="sectionTitle">Order summary</ThemeText>
            <StatusBadge status={orderQuery.data.status} />
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Order number</ThemeText>
            <ThemeText variant="bodyStrong">{orderQuery.data.order_number}</ThemeText>
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Total</ThemeText>
            <PriceText amount={orderQuery.data.total_amount} style={styles.totalValue} />
          </View>
        </SurfaceCard>
      ) : orderQuery.error instanceof Error ? (
        <EmptyState iconName="x-circle" title="Order unavailable" description={orderQuery.error.message} />
      ) : null}

      {paymentQuery.data ? (
        <SurfaceCard accent style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemeText variant="sectionTitle">Payment</ThemeText>
            <StatusBadge status={paymentQuery.data.status} />
          </View>
          <View style={styles.infoRow}>
            <ThemeText muted>Amount</ThemeText>
            <PriceText amount={paymentQuery.data.amount} />
          </View>
          {paymentQuery.data.telebirr_txn_id ? (
            <View style={styles.infoRow}>
              <ThemeText muted>Telebirr reference</ThemeText>
              <ThemeText variant="bodyStrong">{paymentQuery.data.telebirr_txn_id}</ThemeText>
            </View>
          ) : (
            <ThemeText muted>Waiting for payment reference...</ThemeText>
          )}
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
});
