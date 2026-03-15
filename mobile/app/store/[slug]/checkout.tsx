import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen } from '../../../src/components/AppScreen';
import { EmptyState } from '../../../src/components/EmptyState';
import { PriceText } from '../../../src/components/PriceText';
import { getCartItems, getCartTotal } from '../../../src/features/cart/selectors';
import { checkoutSchema, type CheckoutFormValues } from '../../../src/features/checkout/schema';
import { useCreateOrderMutation, useDeliveryZonesQuery } from '../../../src/features/storefront/queries';
import { useInitiatePaymentMutation } from '../../../src/features/order-status/queries';
import { useCartStore } from '../../../src/state/cart-store';
import { useSessionStore } from '../../../src/state/session-store';
import { colors, layout, radii, spacing } from '../../../src/theme/theme';
import { Button } from '../../../src/components/ui/Button';
import { FeatherIcon } from '../../../src/components/ui/Icon';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { SurfaceCard } from '../../../src/components/ui/SurfaceCard';
import { TextField } from '../../../src/components/ui/TextField';
import { ThemeText } from '../../../src/components/ui/ThemeText';
import type { PaymentProvider } from '../../../src/types/api';

const PAYMENT_METHODS: Array<{ value: PaymentProvider; label: string; description: string }> = [
  { value: 'telebirr', label: 'Telebirr', description: 'Pay via Telebirr mobile money' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', description: 'Pay when your order arrives' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: 'Transfer to merchant bank account' },
];

function paymentMethodLabel(provider: PaymentProvider) {
  return PAYMENT_METHODS.find((m) => m.value === provider)?.label ?? provider;
}

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const items = useCartStore((state) => getCartItems(state.carts, slug));
  const clearCart = useCartStore((state) => state.clearCart);
  const cartTotal = getCartTotal(items);
  const createOrder = useCreateOrderMutation(slug);
  const initiatePayment = useInitiatePaymentMutation();
  const setLastOrder = useSessionStore((state) => state.setLastOrder);
  const zonesQuery = useDeliveryZonesQuery(slug);
  const deliveryZones = zonesQuery.data ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      customer_address: '',
      payment_method: 'telebirr',
      delivery_zone_id: undefined,
      landmark_note: '',
      bank_transfer_ref: '',
    },
  });

  const selectedPaymentMethod = watch('payment_method');
  const selectedZoneId = watch('delivery_zone_id');
  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const deliveryFee = selectedZone?.fee ?? 0;
  const orderTotal = cartTotal + deliveryFee;
  const isTelebirr = selectedPaymentMethod === 'telebirr';

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
    if (values.payment_method === 'telebirr') {
      try {
        await initiatePayment.mutateAsync({
          orderId: order.id,
          customerPhone: values.customer_phone,
        });
      } catch (error) {
        paymentError = error instanceof Error ? error.message : 'Payment could not be initiated';
      }
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
            description="Enter your details, choose a payment method, and place your order."
            eyebrow="Checkout"
            title="Complete your order"
          />

          <SurfaceCard style={styles.formCard}>
            <View style={styles.stepRow}>
              {['Customer details', 'Payment method', 'Order confirmation'].map((step, index) => (
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
                  label="Name"
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
                  label="Phone Number"
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
                  label="Address"
                  multiline
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Bole, Addis Ababa"
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="landmark_note"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Landmark / directions (optional)"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Near Edna Mall, blue gate"
                  value={value ?? ''}
                />
              )}
            />

            {/* Delivery zone picker */}
            {deliveryZones.length > 0 ? (
              <View style={styles.sectionGap}>
                <ThemeText variant="bodyStrong">Delivery zone</ThemeText>
                {deliveryZones.map((zone) => {
                  const isSelected = selectedZoneId === zone.id;
                  return (
                    <Pressable
                      key={zone.id}
                      onPress={() => setValue('delivery_zone_id', zone.id)}
                      style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected ? <View style={styles.radioCircleInner} /> : null}
                      </View>
                      <ThemeText style={styles.radioLabel}>{zone.name}</ThemeText>
                      <ThemeText variant="bodyStrong" color={colors.textSoft}>
                        ETB {zone.fee}
                      </ThemeText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {/* Payment method selector */}
            <View style={styles.sectionGap}>
              <ThemeText variant="bodyStrong">Payment method</ThemeText>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentMethod === method.value;
                return (
                  <Pressable
                    key={method.value}
                    onPress={() => setValue('payment_method', method.value)}
                    style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected ? <View style={styles.radioCircleInner} /> : null}
                    </View>
                    <View style={styles.radioContent}>
                      <ThemeText variant="bodyStrong">{method.label}</ThemeText>
                      <ThemeText variant="caption" muted>
                        {method.description}
                      </ThemeText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Payment method info banners */}
            {selectedPaymentMethod === 'telebirr' ? (
              <SurfaceCard accent style={styles.noticeCard}>
                <View style={styles.noticeRow}>
                  <FeatherIcon color={colors.brandDark} name="shield" size={16} />
                  <ThemeText variant="caption" color={colors.brandDark}>
                    Telebirr payment will be simulated through the backend after order placement.
                  </ThemeText>
                </View>
              </SurfaceCard>
            ) : selectedPaymentMethod === 'cash_on_delivery' ? (
              <SurfaceCard style={styles.codNotice}>
                <View style={styles.noticeRow}>
                  <FeatherIcon color="#92400e" name="info" size={16} />
                  <ThemeText variant="caption" color="#92400e">
                    Pay cash when your order is delivered. The merchant will confirm payment upon receipt.
                  </ThemeText>
                </View>
              </SurfaceCard>
            ) : selectedPaymentMethod === 'bank_transfer' ? (
              <SurfaceCard style={styles.bankNotice}>
                <View style={styles.noticeRow}>
                  <FeatherIcon color="#0369a1" name="info" size={16} />
                  <ThemeText variant="caption" color="#0369a1">
                    Transfer the total to the merchant&apos;s bank account. They will confirm once received.
                  </ThemeText>
                </View>
              </SurfaceCard>
            ) : null}

            {/* Bank transfer reference input */}
            {selectedPaymentMethod === 'bank_transfer' ? (
              <Controller
                control={control}
                name="bank_transfer_ref"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Transfer reference (optional)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="e.g. FT24031412345"
                    value={value ?? ''}
                  />
                )}
              />
            ) : null}

            {submissionError ? (
              <ThemeText color={colors.danger}>
                {submissionError instanceof Error ? submissionError.message : 'The order could not be submitted.'}
              </ThemeText>
            ) : null}

            <Button
              fullWidth
              iconLeft={
                <FeatherIcon
                  color={colors.white}
                  name={isTelebirr ? 'arrow-right' : 'check'}
                  size={16}
                />
              }
              loading={createOrder.isPending || initiatePayment.isPending}
              onPress={() => void onSubmit()}
              size="lg"
            >
              {createOrder.isPending || initiatePayment.isPending
                ? 'Submitting order...'
                : isTelebirr
                  ? 'Pay with Telebirr'
                  : 'Place Order'}
            </Button>
          </SurfaceCard>

          {/* Order summary */}
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

            <View style={styles.infoRow}>
              <ThemeText muted>Subtotal</ThemeText>
              <PriceText amount={cartTotal} />
            </View>

            {selectedZone ? (
              <View style={styles.infoRow}>
                <ThemeText muted>Delivery ({selectedZone.name})</ThemeText>
                <PriceText amount={deliveryFee} />
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <ThemeText muted>Payment method</ThemeText>
              <ThemeText variant="bodyStrong">{paymentMethodLabel(selectedPaymentMethod)}</ThemeText>
            </View>

            <View style={styles.totalRow}>
              <ThemeText variant="sectionTitle">Total</ThemeText>
              <PriceText amount={orderTotal} style={styles.totalValue} variant="price" />
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
  sectionGap: {
    gap: 8,
    paddingTop: 4,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  radioCardSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.brand,
  },
  radioCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  radioLabel: {
    flex: 1,
  },
  radioContent: {
    flex: 1,
    gap: 2,
  },
  noticeCard: {
    padding: 14,
  },
  codNotice: {
    padding: 14,
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  bankNotice: {
    padding: 14,
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalValue: {
    color: colors.brand,
  },
});
