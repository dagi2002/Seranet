import { Stack } from 'expo-router';
import { colors, fonts } from '../../../src/theme/theme';

export default function StoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'rgba(255,255,255,0.96)',
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: fonts.bold,
          color: colors.text,
          fontSize: 17,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="product/[productId]" options={{ title: 'Product' }} />
      <Stack.Screen name="cart" options={{ title: 'Cart' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
      <Stack.Screen name="order/[orderId]" options={{ title: 'Order status' }} />
    </Stack>
  );
}
