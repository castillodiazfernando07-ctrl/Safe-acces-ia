import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Palette, primary, radius, spacing } from '../../theme/tokens';
import { Text } from './Text';

type Props = { label: string; tone?: keyof Palette; accessibilityLabel?: string };

export function Chip({ label, tone = 'accent', accessibilityLabel }: Props) {
  const { c, scheme } = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={{
        height: 30,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        justifyContent: 'center',
        backgroundColor: tone === 'accent' ? (scheme === 'dark' ? primary[900] : primary[100]) : c.card,
        borderWidth: 1,
        borderColor: c.border,
      }}
    >
      <Text variant="caption" color={tone}>
        {label}
      </Text>
    </View>
  );
}
