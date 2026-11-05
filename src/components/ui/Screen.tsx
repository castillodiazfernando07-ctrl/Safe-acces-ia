import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens';

type Props = { children: React.ReactNode; scroll?: boolean; style?: ViewStyle; bottomInset?: boolean };

export function Screen({ children, scroll = true, style, bottomInset = true }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = {
    paddingTop: insets.top + spacing.sm,
    paddingBottom: bottomInset ? insets.bottom + spacing.lg : spacing.lg,
    paddingHorizontal: spacing.lg,
  };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: c.bg }, pad, style]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[{ flexGrow: 1 }, pad, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
