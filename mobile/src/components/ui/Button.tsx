import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { colors, radii, shadows } from '../../theme/theme';
import { ThemeText } from './ThemeText';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? styles.fullWidth : null,
        pressed && !disabled ? styles.pressed : null,
        (disabled || loading) ? styles.disabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.brand} />
      ) : (
        <View style={styles.content}>
          {iconLeft}
          <ThemeText variant="button" color={textColors[variant]}>
            {children}
          </ThemeText>
          {iconRight}
        </View>
      )}
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
    ...shadows.lift,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    ...shadows.soft,
  },
  secondary: {
    backgroundColor: colors.backgroundMuted,
    borderColor: colors.backgroundMuted,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: radii.lg,
  },
  lg: {
    minHeight: 54,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: radii.xl,
  },
});

const textColors: Record<ButtonVariant, string> = {
  primary: colors.white,
  outline: colors.text,
  secondary: colors.text,
  ghost: colors.textMuted,
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.97,
  },
  disabled: {
    opacity: 0.55,
  },
});
