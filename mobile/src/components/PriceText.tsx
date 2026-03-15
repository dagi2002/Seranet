import type { TextProps } from 'react-native';
import { formatCurrency } from '../lib/currency';
import { ThemeText } from './ui/ThemeText';

type PriceTextProps = TextProps & {
  amount: number;
  variant?: 'bodyStrong' | 'subtitle' | 'price';
};

export function PriceText({ amount, style, variant = 'bodyStrong', ...props }: PriceTextProps) {
  return (
    <ThemeText {...props} style={style} variant={variant}>
      {formatCurrency(amount)}
    </ThemeText>
  );
}
