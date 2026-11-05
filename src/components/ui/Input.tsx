import React, { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts, radius, spacing, touch } from '../../theme/tokens';
import { Text } from './Text';

type Props = TextInputProps & { label: string; error?: string };

export function Input({ label, error, style, ...rest }: Props) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="caption" color="text2" style={{ marginBottom: spacing.xs }}>
        {label}
      </Text>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={c.text2}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          {
            height: touch.button,
            backgroundColor: c.card,
            borderRadius: radius.button,
            borderWidth: focused ? 2 : 1,
            borderColor: error ? c.err : focused ? c.accent : c.border,
            color: c.text,
            fontFamily: fonts.regular,
            fontSize: 16,
            paddingHorizontal: spacing.lg - 2,
          },
          style,
        ]}
      />
      {error ? (
        <Text variant="caption" color="err" style={{ marginTop: spacing.xs }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
