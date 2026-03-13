import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/theme';
import { ThemeText } from './ThemeText';

export function LoadingState({ label = 'Loading storefront...' }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand} size="large" />
      <ThemeText muted>{label}</ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
});
