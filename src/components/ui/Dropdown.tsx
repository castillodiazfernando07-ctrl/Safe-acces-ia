import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, touch } from '../../theme/tokens';
import { Sheet } from './Sheet';
import { Text } from './Text';

type Props<T extends string> = { label: string; value: T; options: readonly T[]; onChange: (v: T) => void };

export function Dropdown<T extends string>({ label, value, options, onChange }: Props<T>) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text variant="caption" color="text2" style={{ marginBottom: spacing.xs }}>{label}</Text>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint="Abre la lista de opciones"
        onPress={() => setOpen(true)}
        style={{ height: touch.button, borderRadius: radius.button, borderWidth: 1, borderColor: c.border, backgroundColor: c.card, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text variant="body">{value}</Text>
        <Ionicons name="chevron-down" size={20} color={c.text2} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Text variant="title2" style={{ marginBottom: spacing.md }}>{label}</Text>
        {options.map((o) => (
          <Pressable
            key={o}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: o === value }}
            onPress={() => { onChange(o); setOpen(false); }}
            style={{ minHeight: touch.button, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: c.border }}
          >
            <Text variant="body" color={o === value ? 'accent' : 'text'}>{o}</Text>
            {o === value ? <Ionicons name="checkmark" size={22} color={c.accent} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}
