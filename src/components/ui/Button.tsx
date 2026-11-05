import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { onPrimary, primary, radius, spacing, touch } from '../../theme/tokens';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'text' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, accessibilityLabel, style }: Props) {
  const { c, scheme } = useTheme();
  const inactive = disabled || loading;
  const height = variant === 'text' ? touch.minTarget : touch.button;

  const label = (color: string) =>
    loading ? (
      <ActivityIndicator color={color} />
    ) : (
      <Text variant="body" style={{ color, fontWeight: '600' }}>
        {title}
      </Text>
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        { height, borderRadius: radius.button, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      {({ pressed }) => {
        if (variant === 'primary' || variant === 'danger') {
          const colorsPair: [string, string] =
            variant === 'danger'
              ? [c.err, c.err]
              : inactive
                ? [c.card, c.card]
                : pressed
                  ? [c.pressed, c.pressed]
                  : [primary[500], primary[600]];
          return (
            <LinearGradient colors={colorsPair} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.fill, { borderRadius: radius.button }]}>
              {label(inactive ? c.text2 : onPrimary)}
            </LinearGradient>
          );
        }
        if (variant === 'secondary') {
          return (
            <View
              style={[
                styles.fill,
                {
                  borderRadius: radius.button,
                  borderWidth: 1,
                  borderColor: inactive ? c.border : c.accent,
                  backgroundColor: pressed ? (scheme === 'dark' ? primary[900] : primary[100]) : 'transparent',
                },
              ]}
            >
              {label(inactive ? c.text2 : c.accent)}
            </View>
          );
        }
        return (
          <View style={[styles.fill, { opacity: pressed ? 0.7 : 1, paddingHorizontal: spacing.sm }]}>
            {label(inactive ? c.text2 : c.accent)}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
