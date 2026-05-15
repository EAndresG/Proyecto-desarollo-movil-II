import React, { useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function PresetButton({ label, onPress, isSelected, fontScale }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 160,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            backgroundColor: isSelected ? '#4f46e5' : '#f3f4f6',
            borderColor: isSelected ? '#4f46e5' : '#e5e7eb',
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <Text
          style={{
            color: isSelected ? '#fff' : '#1a1a2e',
            fontWeight: '700',
            fontSize: 12 * fontScale,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
