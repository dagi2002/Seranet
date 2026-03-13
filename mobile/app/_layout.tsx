import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '../src/lib/query-client';
import { colors, fonts } from '../src/theme/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [fonts.regular]: require('../assets/fonts/Manrope-Regular.ttf'),
    [fonts.medium]: require('../assets/fonts/Manrope-Medium.ttf'),
    [fonts.semibold]: require('../assets/fonts/Manrope-SemiBold.ttf'),
    [fonts.bold]: require('../assets/fonts/Manrope-Bold.ttf'),
    [fonts.extrabold]: require('../assets/fonts/Manrope-ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: 'rgba(255,255,255,0.96)',
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontFamily: fonts.bold,
              color: colors.text,
              fontSize: 17,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
