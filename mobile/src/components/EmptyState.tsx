import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme/theme';
import { IconCircle } from './ui/IconCircle';
import { FeatherIcon } from './ui/Icon';
import { SurfaceCard } from './ui/SurfaceCard';
import { ThemeText } from './ui/ThemeText';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  iconName?: string;
};

export function EmptyState({ title, description, action, iconName = 'inbox' }: EmptyStateProps) {
  return (
    <SurfaceCard style={styles.container}>
      <IconCircle tone="brand">
        <FeatherIcon color={colors.brand} name={iconName} size={18} />
      </IconCircle>
      <ThemeText center variant="subtitle">
        {title}
      </ThemeText>
      <ThemeText center muted style={styles.description}>
        {description}
      </ThemeText>
      {action}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
  },
  description: {
    maxWidth: 300,
  },
});
