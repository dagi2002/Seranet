import { StyleSheet, Text, type TextStyle } from 'react-native';

type IconName =
  | 'alert-circle'
  | 'alert-triangle'
  | 'arrow-left'
  | 'arrow-right'
  | 'home'
  | 'inbox'
  | 'minus'
  | 'package'
  | 'plus'
  | 'search'
  | 'shield'
  | 'shopping-bag'
  | 'shopping-cart'
  | 'x-circle'
  | 'zap';

type IconProps = {
  name: IconName | string;
  size?: number;
  color?: string;
};

const ICON_GLYPHS: Record<IconName, string> = {
  'alert-circle': '!',
  'alert-triangle': '⚠',
  'arrow-left': '←',
  'arrow-right': '→',
  home: '⌂',
  inbox: '⌄',
  minus: '−',
  package: '□',
  plus: '+',
  search: '⌕',
  shield: '⛨',
  'shopping-bag': '◫',
  'shopping-cart': '◧',
  'x-circle': '✕',
  zap: '⚡',
};

function AppIcon({ color = '#0f172a', name, size = 18 }: IconProps) {
  const glyph = ICON_GLYPHS[(name in ICON_GLYPHS ? name : 'package') as IconName];
  const style: TextStyle = {
    color,
    fontSize: size,
    lineHeight: size,
  };

  return <Text style={[styles.icon, style]}>{glyph}</Text>;
}

export function FeatherIcon(props: IconProps) {
  return <AppIcon {...props} />;
}

export function IonIcon(props: IconProps) {
  return <AppIcon {...props} />;
}

const styles = StyleSheet.create({
  icon: {
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
