import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme/theme';

type IconCircleProps = {
  children: ReactNode;
  tone?: 'default' | 'brand';
};

export function IconCircle({ children, tone = 'default' }: IconCircleProps) {
  return <View style={[styles.base, tone === 'brand' ? styles.brand : styles.default]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: colors.backgroundMuted,
  },
  brand: {
    backgroundColor: colors.brandSoft,
  },
});
