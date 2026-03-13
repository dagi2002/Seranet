import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { spacing } from '../../theme/theme';
import { ThemeText } from './ThemeText';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ eyebrow, title, description, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.copy}>
        {eyebrow ? <ThemeText variant="eyebrow">{eyebrow}</ThemeText> : null}
        <ThemeText variant="title">{title}</ThemeText>
        {description ? <ThemeText muted>{description}</ThemeText> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  copy: {
    gap: 8,
  },
});
