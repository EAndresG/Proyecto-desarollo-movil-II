import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function StatCard({ title, value, icon, color, onPress, fontScale, colors }) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '1a' }]}
      >
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.title, { color: colors.muted, fontSize: 12 * fontScale }]}>
        {title}
      </Text>
      <Text style={[styles.value, { color: colors.text, fontSize: 18 * fontScale }]}>
        {value}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  value: {
    fontWeight: '800',
  },
});
