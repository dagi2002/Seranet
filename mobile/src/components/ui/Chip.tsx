import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '../../theme/theme';
import { ThemeText } from './ThemeText';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
};

export function Chip({ label, active = false, onPress, icon }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.base, active ? styles.active : styles.inactive]}>
      {icon}
      <ThemeText variant="label" color={active ? colors.white : colors.textMuted}>
        {label}
      </ThemeText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  active: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  inactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
});
