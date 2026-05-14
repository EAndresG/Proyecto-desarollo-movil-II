import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MetasScreen() {
  return (
    <View style={styles.container}>
      <Feather name="target" size={44} color="#4f46e5" />
      <Text style={styles.title}>🎯 Metas y Habitos</Text>
      <Text style={styles.subtitle}>Configura tus metas de lectura</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
  },
});
