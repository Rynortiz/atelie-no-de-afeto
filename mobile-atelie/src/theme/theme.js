import { Platform } from 'react-native';

export const colors = {
  primary: '#A0522D',
  primaryDark: '#7B3F21',
  primaryLight: '#D9A57C',

  background: '#FDF8F4',
  surface: '#FFFFFF',
  border: '#E8DDD4',

  text: '#3D2C23',
  textPrimary: '#3D2C23',
  textSecondary: '#7A6A5F',
  textInverse: '#FFFFFF',

  success: '#2E7D53',
  danger: '#C0392B',
  warning: '#B8860B',

  disabled: '#C9BEB5',

  decorWarm: 'rgba(217, 165, 124, 0.22)',
  decorSoft: 'rgba(160, 82, 45, 0.08)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
};

/**
 * fonte Dancing Script, mesma usada no site
 */
export const fonts = {
  brand: 'DancingScript-Bold',
  brandSemiBold: 'DancingScript-SemiBold',
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  button: { fontSize: 16, fontWeight: '600' },

  brand: { fontFamily: fonts.brand, fontSize: 42, lineHeight: 58 },
  brandSmall: { fontFamily: fonts.brand, fontSize: 28, lineHeight: 40 },
};

/** elevação tanto para android quanto para IOS */
export const shadows = {
  card: Platform.select({
    android: { elevation: 4 },
    ios: {
      shadowColor: '#3D2C23',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    default: {},
  }),
  emblem: Platform.select({
    android: { elevation: 2 },
    ios: {
      shadowColor: '#3D2C23',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    default: {},
  }),
};

export default { colors, spacing, radius, typography, fonts, shadows };