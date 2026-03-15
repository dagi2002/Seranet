import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../theme/theme';

type SurfaceCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
};

export function SurfaceCard({ children, style, accent = false }: SurfaceCardProps) {
  return <View style={[styles.base, accent ? styles.accent : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceGlass,
    padding: 18,
    ...shadows.soft,
  },
  accent: {
    backgroundColor: colors.brandSurface,
    borderColor: '#b4efe6',
  },
});
