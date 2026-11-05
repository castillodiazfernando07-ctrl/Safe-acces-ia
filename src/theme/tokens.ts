// Tokens de SafeAccess App (Fase 4). Ningun color o tamano va escrito a mano en las pantallas.
export const primary = {
  50: '#FFF2EB',
  100: '#FFE2D1',
  200: '#FDC9AA',
  300: '#FCAC7E',
  400: '#FF8B47',
  500: '#FF6A13',
  600: '#EB5600',
  700: '#BD4600',
  800: '#8F3500',
  900: '#612400',
} as const;

export const onPrimary = '#0B0D0E';

export const colors = {
  dark: {
    bg: '#000000',
    bg2: '#09090B',
    card: '#18181B',
    text: '#FFFFFF',
    text2: '#A1A1AA',
    border: 'rgba(255,255,255,0.08)',
    accent: '#FF8B47',
    pressed: '#FF8B47',
    ok: '#3DDC84',
    err: '#FF5C5C',
    warn: '#F59E0B',
    info: '#60A5FA',
  },
  light: {
    bg: '#FFFFFF',
    bg2: '#F4F4F5',
    card: '#FFFFFF',
    text: '#09090B',
    text2: '#52525B',
    border: '#E4E4E7',
    accent: '#BD4600',
    pressed: '#EB5600',
    ok: '#15803D',
    err: '#B91C1C',
    warn: '#B45309',
    info: '#1D4ED8',
  },
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { button: 12, card: 16, sheet: 24, pill: 999 } as const;
export const typography = {
  display: { size: 34, weight: '800', lineHeight: 1.1 },
  title1: { size: 28, weight: '700', lineHeight: 1.2 },
  title2: { size: 22, weight: '600', lineHeight: 1.25 },
  headline: { size: 17, weight: '600', lineHeight: 1.3 },
  body: { size: 16, weight: '400', lineHeight: 1.5 },
  caption: { size: 13, weight: '500', lineHeight: 1.4 },
  overline: { size: 11, weight: '600', lineHeight: 1.4, letterSpacing: 0.08 },
} as const;
export const touch = { minTarget: 44, button: 52, tabBar: 56 } as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export type Palette = { [K in keyof typeof colors.dark]: string };
export type TypeVariant = keyof typeof typography;
export const scrim = 'rgba(0,0,0,0.5)';
