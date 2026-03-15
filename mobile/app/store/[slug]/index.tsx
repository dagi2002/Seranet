import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppScreen } from '../../../src/components/AppScreen';
import { EmptyState } from '../../../src/components/EmptyState';
import { ProductCard } from '../../../src/components/ProductCard';
import { getCartItemCount, getCartItems } from '../../../src/features/cart/selectors';
import { useMerchantQuery, useProductsQuery } from '../../../src/features/storefront/queries';
import { useCartStore } from '../../../src/state/cart-store';
import { colors, layout, radii, shadows, spacing } from '../../../src/theme/theme';
import { Button } from '../../../src/components/ui/Button';
import { Chip } from '../../../src/components/ui/Chip';
import { FeatherIcon } from '../../../src/components/ui/Icon';
import { LoadingState } from '../../../src/components/ui/LoadingState';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { SurfaceCard } from '../../../src/components/ui/SurfaceCard';
import { ThemeText } from '../../../src/components/ui/ThemeText';

const FLOATING_CART_HEIGHT = 72;

export default function StorefrontScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? '';
  const merchantQuery = useMerchantQuery(slug);
  const productsQuery = useProductsQuery(slug);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => getCartItems(state.carts, slug));
  const cartCount = getCartItemCount(cartItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const useTwoColumns = width >= 390;

  const products = productsQuery.data ?? [];
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesQuery && matchesCategory;
      }),
    [products, searchQuery, selectedCategory],
  );
  const productRows = useMemo(() => {
    if (!useTwoColumns) {
      return filteredProducts.map((product) => [product]);
    }

    const rows: Array<typeof filteredProducts> = [];
    for (let index = 0; index < filteredProducts.length; index += 2) {
      rows.push(filteredProducts.slice(index, index + 2));
    }
    return rows;
  }, [filteredProducts, useTwoColumns]);

  if (merchantQuery.isLoading || productsQuery.isLoading) {
    return (
      <AppScreen>
        <LoadingState label="Loading storefront..." />
      </AppScreen>
    );
  }

  if (merchantQuery.isError || !merchantQuery.data) {
    return (
      <AppScreen>
        <EmptyState
          iconName="shopping-bag"
          title="Store unavailable"
          description={
            merchantQuery.error instanceof Error
              ? merchantQuery.error.message
              : 'The requested storefront could not be loaded.'
          }
        />
      </AppScreen>
    );
  }

  const merchant = merchantQuery.data;

  return (
    <AppScreen
      scroll
      scrollContentStyle={{ paddingBottom: cartCount ? FLOATING_CART_HEIGHT + insets.bottom + 40 : 28 }}
    >
      <SurfaceCard accent style={styles.heroShell}>
        <View style={styles.heroTopBar}>
          <View style={styles.brandLockup}>
            {merchant.logo_url ? (
              <Image source={{ uri: merchant.logo_url }} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <ThemeText color={colors.brand} variant="sectionTitle">
                  {merchant.business_name.slice(0, 1)}
                </ThemeText>
              </View>
            )}
            <View style={styles.brandCopy}>
              <ThemeText variant="eyebrow" color={colors.brand}>
                Seranet Mobile
              </ThemeText>
              <ThemeText variant="subtitle">{merchant.business_name}</ThemeText>
            </View>
          </View>
          <Button
            iconLeft={<FeatherIcon color={colors.text} name="shopping-cart" size={16} />}
            onPress={() => router.push({ pathname: '/store/[slug]/cart', params: { slug } })}
            size="sm"
            variant="outline"
          >
            Cart ({cartCount})
          </Button>
        </View>

        {merchant.banner_url ? (
          <ImageBackground imageStyle={styles.heroImageInner} source={{ uri: merchant.banner_url }} style={styles.heroImage}>
            <View style={styles.heroOverlay}>
              <ThemeText color={colors.white} muted={false}>
                Premium storefront, local checkout
              </ThemeText>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.heroFallback}>
            <ThemeText variant="caption" color={colors.brandDark}>
              Curated catalog. Premium mobile experience. Shared local backend.
            </ThemeText>
          </View>
        )}

        {merchant.description ? <ThemeText muted>{merchant.description}</ThemeText> : null}
      </SurfaceCard>

      <SurfaceCard style={styles.searchPanel}>
        <View style={styles.searchInputWrap}>
          <FeatherIcon color={colors.textSoft} name="search" size={16} />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder="Search the catalog"
            placeholderTextColor={colors.textSoft}
            style={styles.searchInput}
            value={searchQuery}
          />
        </View>
        <View style={styles.chipRow}>
          {categories.map((category) => (
            <Chip
              key={category}
              active={selectedCategory === category}
              label={category === 'all' ? 'All products' : category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </View>
      </SurfaceCard>

      <SectionHeader
        description="Explore the latest products from this storefront with the same premium design language as the web app."
        eyebrow="Storefront"
        title="Browse products"
      />

      {filteredProducts.length ? (
        <View style={styles.productList}>
          {productRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={[styles.productRow, useTwoColumns ? styles.productRowTwoColumns : null]}>
              {row.map((product) => (
                <View key={product.id} style={useTwoColumns ? styles.productGridItem : styles.productListItem}>
                  <ProductCard
                    compact={useTwoColumns}
                    onAddToCart={() => addItem(slug, product, 1)}
                    onPress={() =>
                      router.push({
                        pathname: '/store/[slug]/product/[productId]',
                        params: { slug, productId: product.id },
                      })
                    }
                    product={product}
                  />
                </View>
              ))}
              {useTwoColumns && row.length === 1 ? <View style={styles.productGridItem} /> : null}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          iconName="search"
          title="No products found"
          description="Try another search term or switch categories."
        />
      )}

      {cartCount ? (
        <View style={[styles.floatingCartWrap, { bottom: insets.bottom + layout.floatingBottomOffset }]}>
          <Button
            fullWidth
            iconLeft={<FeatherIcon color={colors.white} name="shopping-cart" size={16} />}
            onPress={() => router.push({ pathname: '/store/[slug]/cart', params: { slug } })}
            size="lg"
          >
            Open cart ({cartCount})
          </Button>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroShell: {
    gap: spacing.md,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandCopy: {
    flex: 1,
    gap: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  heroImage: {
    minHeight: 210,
    borderRadius: radii.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.backgroundMuted,
  },
  heroImageInner: {
    borderRadius: radii.xl,
  },
  heroOverlay: {
    padding: 18,
    backgroundColor: 'rgba(15,23,42,0.36)',
  },
  heroFallback: {
    minHeight: 124,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  searchPanel: {
    gap: spacing.md,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: 'Manrope-Medium',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  productList: {
    gap: 14,
  },
  productRow: {
    width: '100%',
  },
  productRowTwoColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  productGridItem: {
    flex: 1,
  },
  productListItem: {
    width: '100%',
  },
  floatingCartWrap: {
    position: 'absolute',
    left: layout.screenPaddingHorizontal,
    right: layout.screenPaddingHorizontal,
    height: FLOATING_CART_HEIGHT,
  },
});
