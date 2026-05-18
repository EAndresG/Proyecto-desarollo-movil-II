import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function KPICard({ title, value, subtitle, icon, color, onPress }) {
  const content = (
    <View style={[styles.card, { borderColor: '#e5e7eb' }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});
