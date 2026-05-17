import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BadgeItem({ icon, nombre, descripcion, completado, colors }) {
  const safeColors = colors || {
    text: '#1a1a2e',
    muted: '#6b7280',
    success: '#10b981',
    soft: '#f3f4f6',
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: completado ? '#eef2ff' : safeColors.soft },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.name, { color: safeColors.text }]}>{nombre}</Text>
      <Text style={[styles.desc, { color: safeColors.muted }]}>{descripcion}</Text>
      <Text style={[styles.status, { color: completado ? safeColors.success : safeColors.muted }]}
      >
        {completado ? 'Completado' : 'Pendiente'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    fontSize: 11,
    textAlign: 'center',
  },
  status: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
