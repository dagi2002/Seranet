import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppScreen } from '../../../../src/components/AppScreen';
import { EmptyState } from '../../../../src/components/EmptyState';
import { PriceText } from '../../../../src/components/PriceText';
import { ProductCard } from '../../../../src/components/ProductCard';
import { useMerchantQuery, useProductQuery, useProductsQuery } from '../../../../src/features/storefront/queries';
import { useCartStore } from '../../../../src/state/cart-store';
import { colors, radii, spacing } from '../../../../src/theme/theme';
import { Button } from '../../../../src/components/ui/Button';
import { FeatherIcon } from '../../../../src/components/ui/Icon';
import { LoadingState } from '../../../../src/components/ui/LoadingState';
import { QuantityStepper } from '../../../../src/components/ui/QuantityStepper';
import { SectionHeader } from '../../../../src/components/ui/SectionHeader';
import { SurfaceCard } from '../../../../src/components/ui/SurfaceCard';
import { ThemeText } from '../../../../src/components/ui/ThemeText';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ slug: string; productId: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const productId = Array.isArray(params.productId) ? params.productId[0] : params.productId ?? '';
  const merchantQuery = useMerchantQuery(slug);
  const productQuery = useProductQuery(slug, productId);
  const productsQuery = useProductsQuery(slug);
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>();
  const { width } = useWindowDimensions();
  const useTwoColumns = width >= 390;

  const product = productQuery.data;
  const galleryImages = product?.image_urls?.length ? product.image_urls : product?.image_url ? [product.image_url] : [];

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(undefined);
  }, [productId]);

  useEffect(() => {
    setSelectedImage(galleryImages[0]);
  }, [product?.id, galleryImages]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const others = (productsQuery.data ?? []).filter((item) => item.id !== product.id);
    return [
      ...others.filter((item) => item.category === product.category),
      ...others.filter((item) => item.category !== product.category),
    ].slice(0, 4);
  }, [product, productsQuery.data]);
  const relatedProductRows = useMemo(() => {
    if (!useTwoColumns) {
      return relatedProducts.map((relatedProduct) => [relatedProduct]);
    }

    const rows: Array<typeof relatedProducts> = [];
    for (let index = 0; index < relatedProducts.length; index += 2) {
      rows.push(relatedProducts.slice(index, index + 2));
    }
    return rows;
  }, [relatedProducts, useTwoColumns]);

  if (merchantQuery.isLoading || productQuery.isLoading) {
    return (
      <AppScreen>
        <LoadingState label="Loading product..." />
      </AppScreen>
    );
  }

  if (productQuery.isError || !product || merchantQuery.isError || !merchantQuery.data) {
    return (
      <AppScreen>
        <EmptyState
          iconName="package"
          title="Product unavailable"
          description={
            productQuery.error instanceof Error
              ? productQuery.error.message
              : 'The product could not be loaded.'
          }
        />
      </AppScreen>
    );
  }

  const merchant = merchantQuery.data;
  const activeImage = selectedImage ?? galleryImages[0];

  return (
    <AppScreen scroll scrollContentStyle={{ paddingBottom: 40 }}>
      <Button
        iconLeft={<FeatherIcon color={colors.textMuted} name="arrow-left" size={16} />}
        onPress={() => router.back()}
        size="sm"
        variant="ghost"
      >
        Back to store
      </Button>

      <SurfaceCard style={styles.imageCard}>
        {activeImage ? <Image source={{ uri: activeImage }} style={styles.heroImage} /> : <View style={styles.imageFallback} />}
      </SurfaceCard>

      {galleryImages.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
          {galleryImages.map((imageUrl) => (
            <Pressable
              key={imageUrl}
              onPress={() => setSelectedImage(imageUrl)}
              style={[styles.galleryThumbWrap, activeImage === imageUrl ? styles.galleryThumbWrapActive : null]}
            >
              <Image source={{ uri: imageUrl }} style={styles.galleryThumb} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <SurfaceCard style={styles.copyCard}>
        <ThemeText variant="eyebrow" color={colors.brand}>
          {merchant.business_name} • {product.category}
        </ThemeText>
        <ThemeText variant="display">{product.name}</ThemeText>
        {product.description ? <ThemeText muted>{product.description}</ThemeText> : null}
        <SurfaceCard accent style={styles.pricePanel}>
          <ThemeText variant="caption" color={colors.brandDark}>
            Price
          </ThemeText>
          <PriceText amount={product.price} variant="price" style={styles.price} />
        </SurfaceCard>
        <View style={styles.metaRow}>
          <QuantityStepper
            max={Math.max(product.stock_quantity, 1)}
            onChange={setQuantity}
            value={quantity}
          />
          <View style={styles.stockPill}>
            <ThemeText variant="caption" muted>
              {product.stock_quantity} in stock
            </ThemeText>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button
            fullWidth
            iconLeft={<FeatherIcon color={colors.text} name="shopping-cart" size={16} />}
            onPress={() => addItem(slug, product, quantity)}
            variant="outline"
          >
            Add to cart
          </Button>
          <Button
            fullWidth
            iconLeft={<FeatherIcon color={colors.white} name="arrow-right" size={16} />}
            onPress={() => {
              addItem(slug, product, quantity);
              router.push({ pathname: '/store/[slug]/cart', params: { slug } });
            }}
          >
            Buy now
          </Button>
        </View>
      </SurfaceCard>

      {relatedProducts.length ? (
        <View style={styles.relatedSection}>
          <SectionHeader
            description={`Browse more items from ${merchant.business_name} before checkout.`}
            eyebrow="More from this store"
            title="Related products"
          />
          <View style={styles.relatedList}>
            {relatedProductRows.map((row, rowIndex) => (
              <View key={`related-row-${rowIndex}`} style={[styles.relatedRow, useTwoColumns ? styles.relatedRowTwoColumns : null]}>
                {row.map((relatedProduct) => (
                  <View key={relatedProduct.id} style={useTwoColumns ? styles.relatedGridItem : styles.relatedListItem}>
                    <ProductCard
                      compact={useTwoColumns}
                      onAddToCart={() => addItem(slug, relatedProduct, 1)}
                      onPress={() =>
                        router.push({
                          pathname: '/store/[slug]/product/[productId]',
                          params: { slug, productId: relatedProduct.id },
                        })
                      }
                      product={relatedProduct}
                    />
                  </View>
                ))}
                {useTwoColumns && row.length === 1 ? <View style={styles.relatedGridItem} /> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundMuted,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.brandSoft,
  },
  galleryRow: {
    gap: 12,
    paddingRight: 20,
  },
  galleryThumbWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  galleryThumbWrapActive: {
    borderColor: colors.brand,
  },
  galleryThumb: {
    width: 84,
    height: 84,
  },
  copyCard: {
    gap: spacing.md,
  },
  pricePanel: {
    gap: 4,
  },
  price: {
    color: colors.brand,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  stockPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.backgroundMuted,
  },
  buttonRow: {
    gap: 12,
  },
  relatedSection: {
    gap: spacing.md,
  },
  relatedList: {
    gap: 14,
  },
  relatedRow: {
    width: '100%',
  },
  relatedRowTwoColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  relatedGridItem: {
    flex: 1,
  },
  relatedListItem: {
    width: '100%',
  },
});
