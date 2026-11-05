import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, Palette, typography, TypeVariant } from '../../theme/tokens';

type Props = TextProps & {
  variant?: TypeVariant;
  color?: keyof Palette;
  align?: TextStyle['textAlign'];
};

const fontByWeight: Record<string, string> = {
  '400': fonts.regular,
  '500': fonts.medium,
  '600': fonts.semibold,
  '700': fonts.bold,
  '800': fonts.extrabold,
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  const { c } = useTheme();
  const t = typography[variant];
  const base: TextStyle = {
    fontFamily: fontByWeight[t.weight],
    fontSize: t.size,
    lineHeight: Math.round(t.size * t.lineHeight),
    color: c[color],
    textAlign: align,
    ...(variant === 'overline' ? { textTransform: 'uppercase' as const, letterSpacing: t.size * 0.08 } : {}),
  };
  return <RNText {...rest} style={[base, style]} />;
}
