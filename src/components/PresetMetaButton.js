import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function PresetMetaButton({ label, onPress, selected, colors }) {
  const safeColors = colors || {
    primary: '#4f46e5',
    text: '#1a1a2e',
    border: '#e5e7eb',
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: selected ? safeColors.primary : '#f3f4f6',
          borderColor: selected ? safeColors.primary : safeColors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={{
          color: selected ? '#fff' : safeColors.text,
          fontWeight: '700',
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
