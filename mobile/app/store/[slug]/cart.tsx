import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { AppScreen } from '../../../src/components/AppScreen';
import { EmptyState } from '../../../src/components/EmptyState';
import { PriceText } from '../../../src/components/PriceText';
import { getCartItems, getCartTotal } from '../../../src/features/cart/selectors';
import { useCartStore } from '../../../src/state/cart-store';
import { colors, spacing } from '../../../src/theme/theme';
import { Button } from '../../../src/components/ui/Button';
import { FeatherIcon } from '../../../src/components/ui/Icon';
import { QuantityStepper } from '../../../src/components/ui/QuantityStepper';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { SurfaceCard } from '../../../src/components/ui/SurfaceCard';
import { ThemeText } from '../../../src/components/ui/ThemeText';

export default function CartScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const items = useCartStore((state) => getCartItems(state.carts, slug));
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = getCartTotal(items);

  return (
    <AppScreen scroll scrollContentStyle={{ paddingBottom: 36 }}>
      <SectionHeader
        description="Adjust quantities, review your items, and continue to checkout with the refreshed premium mobile UI."
        eyebrow="Your cart"
        title="Review your order"
      />

      {items.length === 0 ? (
        <EmptyState
          iconName="shopping-cart"
          title="Your cart is empty"
          description="Add products from the storefront to prepare an order."
        />
      ) : (
        <>
          <View style={styles.list}>
            {items.map((item) => (
              <SurfaceCard key={item.id} style={styles.row}>
                <View style={styles.rowMain}>
                  {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumb} /> : <View style={styles.thumbFallback} />}
                  <View style={styles.rowBody}>
                    <ThemeText variant="sectionTitle">{item.name}</ThemeText>
                    <PriceText amount={item.price} style={styles.itemPrice} />
                    <ThemeText muted variant="caption">
                      Quantity in cart
                    </ThemeText>
                  </View>
                </View>
                <View style={styles.rowActions}>
                  <QuantityStepper onChange={(value) => updateQuantity(slug, item.id, value)} value={item.quantity} />
                  <Button onPress={() => removeItem(slug, item.id)} size="sm" variant="ghost">
                    Remove
                  </Button>
                </View>
              </SurfaceCard>
            ))}
          </View>

          <SurfaceCard accent style={styles.summary}>
            <ThemeText variant="eyebrow" color={colors.brandDark}>
              Order summary
            </ThemeText>
            <View style={styles.summaryRow}>
              <ThemeText muted>Subtotal</ThemeText>
              <PriceText amount={total} style={styles.summaryValue} />
            </View>
            <View style={styles.summaryRow}>
              <ThemeText muted>Payment flow</ThemeText>
              <ThemeText variant="bodyStrong">Telebirr-style simulation</ThemeText>
            </View>
            <Button
              fullWidth
              iconLeft={<FeatherIcon color={colors.white} name="arrow-right" size={16} />}
              onPress={() => router.push({ pathname: '/store/[slug]/checkout', params: { slug } })}
              size="lg"
            >
              Continue to checkout
            </Button>
          </SurfaceCard>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  row: {
    gap: 14,
  },
  rowMain: {
    flexDirection: 'row',
    gap: 14,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.backgroundMuted,
  },
  thumbFallback: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.brandSoft,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  itemPrice: {
    color: colors.brand,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  summary: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryValue: {
    color: colors.brand,
  },
});
