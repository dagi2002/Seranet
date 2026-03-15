import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radii } from '../../theme/theme';
import { ThemeText } from './ThemeText';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  multiline?: boolean;
};

export function TextField({ label, error, multiline = false, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <ThemeText variant="label">{label}</ThemeText>
      <TextInput
        {...props}
        multiline={multiline}
        style={[styles.input, multiline ? styles.textArea : null, style]}
        placeholderTextColor={colors.textSoft}
      />
      {error ? (
        <ThemeText variant="caption" color={colors.danger}>
          {error}
        </ThemeText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    fontFamily: 'Manrope-Medium',
    fontSize: 15,
  },
  textArea: {
    minHeight: 118,
    textAlignVertical: 'top',
  },
});
