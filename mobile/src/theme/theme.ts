import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#f8fafc',
  backgroundSoft: '#f0fdfa',
  backgroundMuted: '#eef2f7',
  surface: '#ffffff',
  surfaceGlass: 'rgba(255,255,255,0.88)',
  surfaceMuted: '#f8fafc',
  text: '#0f172a',
  textMuted: '#64748b',
  textSoft: '#94a3b8',
  brand: '#0d9488',
  brandDark: '#0f766e',
  brandSoft: '#ccfbf1',
  brandSurface: '#f0fdfa',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  overlay: 'rgba(15, 23, 42, 0.42)',
  danger: '#dc2626',
  warning: '#f59e0b',
  success: '#059669',
  white: '#ffffff',
  black: '#020617',
};

export const spacing = {
  px: 1,
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
};

export const radii = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const layout = {
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,
  sectionGap: 18,
  cardGap: 14,
  floatingBottomOffset: 14,
};

export const shadows = {
  soft: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 6,
  } satisfies ViewStyle,
  lift: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    elevation: 10,
  } satisfies ViewStyle,
};

export const fonts = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semibold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extrabold: 'Manrope-ExtraBold',
} as const;

type TypographyKey =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'sectionTitle'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'eyebrow'
  | 'label'
  | 'button'
  | 'price';

export const typography: Record<TypographyKey, TextStyle> = {
  display: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.55,
  },
  subtitle: {
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  bodyStrong: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.35,
  },
};

export const gradients = {
  hero: [colors.backgroundSoft, '#ffffff'],
  imageFallback: ['#d9f7f1', '#eff6ff'],
};
