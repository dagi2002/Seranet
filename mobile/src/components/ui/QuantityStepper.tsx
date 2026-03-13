import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme/theme';
import { FeatherIcon } from './Icon';
import { ThemeText } from './ThemeText';

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
};

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  const canDecrement = value > min;
  const canIncrement = typeof max === 'number' ? value < max : true;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={!canDecrement}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.button, !canDecrement ? styles.disabled : null]}
      >
        <FeatherIcon color={colors.text} name="minus" size={16} />
      </Pressable>
      <ThemeText variant="label" style={styles.value}>
        {value}
      </ThemeText>
      <Pressable
        disabled={!canIncrement}
        onPress={() => onChange(typeof max === 'number' ? Math.min(max, value + 1) : value + 1)}
        style={[styles.button, !canIncrement ? styles.disabled : null]}
      >
        <FeatherIcon color={colors.text} name="plus" size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    alignSelf: 'flex-start',
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundMuted,
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
});
