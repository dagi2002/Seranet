import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen } from '../../../src/components/AppScreen';
import { EmptyState } from '../../../src/components/EmptyState';
import { PriceText } from '../../../src/components/PriceText';
import { getCartItems, getCartTotal } from '../../../src/features/cart/selectors';
import { checkoutSchema, type CheckoutFormValues } from '../../../src/features/checkout/schema';
import { useCreateOrderMutation } from '../../../src/features/storefront/queries';
import { useInitiatePaymentMutation } from '../../../src/features/order-status/queries';
import { useCartStore } from '../../../src/state/cart-store';
import { useSessionStore } from '../../../src/state/session-store';
import { colors, layout, spacing } from '../../../src/theme/theme';
import { Button } from '../../../src/components/ui/Button';
import { FeatherIcon } from '../../../src/components/ui/Icon';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { SurfaceCard } from '../../../src/components/ui/SurfaceCard';
import { TextField } from '../../../src/components/ui/TextField';
import { ThemeText } from '../../../src/components/ui/ThemeText';

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const items = useCartStore((state) => getCartItems(state.carts, slug));
  const clearCart = useCartStore((state) => state.clearCart);
  const total = getCartTotal(items);
  const createOrder = useCreateOrderMutation(slug);
  const initiatePayment = useInitiatePaymentMutation();
  const setLastOrder = useSessionStore((state) => state.setLastOrder);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
    },
  });

  if (items.length === 0) {
    return (
      <AppScreen>
        <EmptyState
          iconName="shopping-bag"
          title="No cart items"
          description="Add products to the cart before creating an order."
        />
      </AppScreen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const order = await createOrder.mutateAsync({
      ...values,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    });

    setLastOrder({
      slug,
      orderId: order.id,
      accessToken: order.public_access_token,
    });
    clearCart(slug);

    let paymentError: string | undefined;
    try {
      await initiatePayment.mutateAsync({
        orderId: order.id,
        customerPhone: values.customer_phone,
      });
    } catch (error) {
      paymentError = error instanceof Error ? error.message : 'Payment could not be initiated';
    }

    router.replace({
      pathname: '/store/[slug]/order/[orderId]',
      params: {
        slug,
        orderId: order.id,
        accessToken: order.public_access_token,
        ...(paymentError ? { paymentError } : {}),
      },
    });
  });

  const submissionError = createOrder.error ?? initiatePayment.error;

  return (
    <AppScreen contentStyle={styles.flushContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
        style={styles.keyboardWrap}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader
            description="Complete the anonymous checkout flow using the existing backend simulation."
            eyebrow="Checkout"
            title="Customer details"
          />

          <SurfaceCard style={styles.formCard}>
            <View style={styles.stepRow}>
              {['Customer details', 'Payment review', 'Order confirmation'].map((step, index) => (
                <View key={step} style={styles.stepCard}>
                  <ThemeText variant="eyebrow" color={colors.textSoft}>
                    Step {index + 1}
                  </ThemeText>
                  <ThemeText variant="caption">{step}</ThemeText>
                </View>
              ))}
            </View>

            <Controller
              control={control}
              name="customer_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.customer_name?.message}
                  label="Customer name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Selamawit Tekle"
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="customer_phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.customer_phone?.message}
                  keyboardType="phone-pad"
                  label="Customer phone"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="0911223344"
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="customer_address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  error={errors.customer_address?.message}
                  label="Delivery address"
                  multiline
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Bole, Addis Ababa"
                  value={value}
                />
              )}
            />

            <SurfaceCard accent style={styles.noticeCard}>
              <View style={styles.noticeRow}>
                <FeatherIcon color={colors.brandDark} name="shield" size={16} />
                <ThemeText variant="caption" color={colors.brandDark}>
                  This staging flow keeps the current anonymous checkout and payment simulation intact.
                </ThemeText>
              </View>
            </SurfaceCard>

            {submissionError ? (
              <ThemeText color={colors.danger}>
                {submissionError instanceof Error ? submissionError.message : 'The order could not be submitted.'}
              </ThemeText>
            ) : null}

            <Button
              fullWidth
              iconLeft={<FeatherIcon color={colors.white} name="arrow-right" size={16} />}
              loading={createOrder.isPending || initiatePayment.isPending}
              onPress={() => void onSubmit()}
              size="lg"
            >
              {createOrder.isPending || initiatePayment.isPending ? 'Submitting order...' : 'Create order'}
            </Button>
          </SurfaceCard>

          <SurfaceCard accent style={styles.summaryCard}>
            <ThemeText variant="eyebrow" color={colors.brandDark}>
              Order summary
            </ThemeText>
            <View style={styles.summaryList}>
              {items.map((item) => (
                <View key={item.id} style={styles.summaryRow}>
                  <View style={styles.summaryCopy}>
                    <ThemeText variant="bodyStrong">{item.name}</ThemeText>
                    <ThemeText muted variant="caption">
                      {item.quantity} × ETB {item.price.toFixed(2)}
                    </ThemeText>
                  </View>
                  <PriceText amount={item.price * item.quantity} />
                </View>
              ))}
            </View>
            <View style={styles.totalRow}>
              <ThemeText variant="sectionTitle">Total due</ThemeText>
              <PriceText amount={total} style={styles.totalValue} variant="price" />
            </View>
          </SurfaceCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flushContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  formCard: {
    gap: spacing.md,
  },
  stepRow: {
    gap: 10,
  },
  stepCard: {
    borderRadius: 22,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  noticeCard: {
    padding: 14,
  },
  noticeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryList: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalValue: {
    color: colors.brand,
  },
});
