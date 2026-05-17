import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function Streak({ dias, mejorRacha, mensaje, colors }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const safeColors = colors || {
    text: '#1a1a2e',
    muted: '#6b7280',
    primary: '#4f46e5',
  };

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const bestLabel = useMemo(() => `${mejorRacha} dias - mejor racha`, [mejorRacha]);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.fire, { transform: [{ scale: pulse }] }]}>🔥</Animated.Text>
      <Text style={[styles.days, { color: safeColors.primary }]}>{dias} dias</Text>
      <Text style={[styles.message, { color: safeColors.text }]}>{mensaje}</Text>
      <Text style={[styles.subtext, { color: safeColors.muted }]}>
        Continua leyendo para mantener tu racha
      </Text>
      <Text style={[styles.best, { color: safeColors.muted }]}>{bestLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  fire: {
    fontSize: 60,
  },
  days: {
    fontSize: 38,
    fontWeight: '800',
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  best: {
    fontSize: 11,
  },
});
