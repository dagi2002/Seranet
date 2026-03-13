import { forwardRef } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, typography } from '../../theme/theme';

type Variant = keyof typeof typography;

type ThemeTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  center?: boolean;
};

export const ThemeText = forwardRef<Text, ThemeTextProps>(function ThemeText(
  { variant = 'body', color, muted = false, center = false, style, ...props },
  ref,
) {
  const textStyle: TextStyle = {
    ...typography[variant],
    color: color ?? (muted ? colors.textMuted : colors.text),
    textAlign: center ? 'center' : undefined,
  };

  return <Text ref={ref} {...props} style={[textStyle, style]} />;
});
