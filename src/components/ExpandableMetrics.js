import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ExpandableMetrics({ metrics }) {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.85}
      >
        <Text style={styles.title}>Mas metricas</Text>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Feather name="chevron-down" size={18} color="#1a1a2e" />
        </Animated.View>
      </TouchableOpacity>

      {open ? (
        <View style={styles.list}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.row}>
              <Text style={styles.label}>{metric.label}</Text>
              <Text style={styles.value}>{metric.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '700',
  },
});
