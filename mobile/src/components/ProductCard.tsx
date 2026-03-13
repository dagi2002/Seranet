import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { Product } from '../types/api';
import { colors, radii, shadows, spacing } from '../theme/theme';
import { Button } from './ui/Button';
import { FeatherIcon } from './ui/Icon';
import { PriceText } from './PriceText';
import { ThemeText } from './ui/ThemeText';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  compact?: boolean;
};

export function ProductCard({ product, onPress, onAddToCart, compact = false }: ProductCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, compact ? styles.cardCompact : null]}>
      {product.image_url ? <Image source={{ uri: product.image_url }} style={styles.image} /> : <View style={styles.imageFallback} />}
      <View style={[styles.badgeRow, compact ? styles.badgeRowCompact : null]}>
        <View style={[styles.categoryBadge, compact ? styles.categoryBadgeCompact : null]}>
          <ThemeText color={colors.textMuted} style={compact ? styles.eyebrowCompact : undefined} variant="eyebrow">
            {product.category}
          </ThemeText>
        </View>
        <View style={[styles.stockBadge, compact ? styles.stockBadgeCompact : null, product.stock_quantity === 0 ? styles.soldOutBadge : null]}>
          <ThemeText
            color={product.stock_quantity === 0 ? colors.danger : colors.white}
            style={compact ? styles.eyebrowCompact : undefined}
            variant="eyebrow"
          >
            {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Sold out'}
          </ThemeText>
        </View>
      </View>
      <View style={[styles.body, compact ? styles.bodyCompact : null]}>
        <View style={styles.copy}>
          <ThemeText numberOfLines={2} style={compact ? styles.titleCompact : undefined} variant="sectionTitle">
            {product.name}
          </ThemeText>
          {product.description ? (
            <ThemeText muted numberOfLines={compact ? 2 : 2} style={[styles.description, compact ? styles.descriptionCompact : null]}>
              {product.description}
            </ThemeText>
          ) : null}
        </View>
        <View style={[styles.footer, compact ? styles.footerCompact : null]}>
          <View>
            <PriceText amount={product.price} style={[styles.price, compact ? styles.priceCompact : null]} variant={compact ? 'bodyStrong' : 'subtitle'} />
            <ThemeText variant="caption" muted>
              Per item
            </ThemeText>
          </View>
          <Button
            disabled={product.stock_quantity === 0}
            iconLeft={<FeatherIcon color={colors.white} name="plus" size={16} />}
            onPress={(event) => {
              event.stopPropagation();
              onAddToCart?.();
            }}
            size={compact ? 'sm' : 'sm'}
          >
            Add
          </Button>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    gap: 0,
  },
  cardCompact: {
    borderRadius: 28,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundMuted,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.brandSoft,
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRowCompact: {
    top: 10,
    left: 10,
    right: 10,
  },
  categoryBadge: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryBadgeCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockBadge: {
    borderRadius: radii.pill,
    backgroundColor: colors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockBadgeCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  soldOutBadge: {
    backgroundColor: '#fef2f2',
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bodyCompact: {
    padding: 12,
    gap: 12,
  },
  copy: {
    gap: 8,
  },
  eyebrowCompact: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.1,
  },
  titleCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  description: {
    minHeight: 42,
  },
  descriptionCompact: {
    minHeight: 34,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  footerCompact: {
    alignItems: 'flex-end',
    gap: 8,
  },
  price: {
    color: colors.brand,
  },
  priceCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
});
