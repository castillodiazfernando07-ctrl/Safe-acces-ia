import Slider from '@react-native-community/slider';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/tokens';
import { Text } from './Text';

type Props = {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};

export function SliderField({ label, unit, value, min, max, step, onChange }: Props) {
  const { c } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="body">{label}</Text>
        <Text variant="headline" color="accent">
          {value} {unit}
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={c.accent}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.accent}
        style={{ height: 44, marginHorizontal: -spacing.xs }}
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: `${value} ${unit}` }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" color="text2">{min} {unit}</Text>
        <Text variant="caption" color="text2">{max} {unit}</Text>
      </View>
    </View>
  );
}
