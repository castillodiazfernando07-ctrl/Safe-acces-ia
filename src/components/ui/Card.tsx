import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  const { c, scheme } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: c.card,
          borderRadius: radius.card,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: c.border,
        },
        scheme === 'light' && { shadowColor: c.text, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
        style,
      ]}
    />
  );
}
