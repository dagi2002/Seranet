import { StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme/theme';
import { ThemeText } from './ThemeText';

type Status = 'pending' | 'paid' | 'cancelled' | 'fulfilled' | 'initiated' | 'success' | 'failed';

export function StatusBadge({ status }: { status: Status }) {
  const palette = statusPalette[status];
  return (
    <View style={[styles.base, { backgroundColor: palette.background }]}>
      <ThemeText variant="eyebrow" color={palette.text}>
        {status}
      </ThemeText>
    </View>
  );
}

const statusPalette: Record<Status, { background: string; text: string }> = {
  pending: { background: '#fef3c7', text: '#92400e' },
  initiated: { background: '#e0f2fe', text: '#0369a1' },
  paid: { background: '#d1fae5', text: '#065f46' },
  success: { background: '#d1fae5', text: '#065f46' },
  fulfilled: { background: '#ccfbf1', text: colors.brandDark },
  cancelled: { background: '#fee2e2', text: '#991b1b' },
  failed: { background: '#fee2e2', text: '#991b1b' },
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
