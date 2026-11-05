import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, scrim, spacing } from '../../theme/tokens';

type Props = { visible: boolean; onClose: () => void; children: React.ReactNode };

export function Sheet({ visible, onClose, children }: Props) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Cerrar"
        accessibilityRole="button"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: scrim, justifyContent: 'flex-end' }}
      >
        <Pressable
          accessible={false}
          style={{
            backgroundColor: c.card,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + spacing.lg,
          }}
        >
          <View style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: c.border, marginBottom: spacing.lg }} />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
