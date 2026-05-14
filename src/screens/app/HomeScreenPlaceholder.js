import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HomeScreenPlaceholder() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Feather name="home" size={44} color="#4f46e5" />
        <Text style={styles.title}>🏠 Home</Text>
        <Text style={styles.subtitle}>Biblioteca principal (Fase 2)</Text>
        <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
          <Text style={styles.btnText}>En desarrollo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  btn: {
    marginTop: 10,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: {
    color: '#4f46e5',
    fontWeight: '700',
  },
});
