import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ProfileInfoCard({
  name,
  email,
  bio,
  onEdit,
  colors,
  fontScale,
}) {
  const safeName = name?.trim() || 'Usuario';
  const safeBio = bio?.trim() || 'Sin bio por ahora.';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.avatarBg }]}
        >
          <Feather name="cpu" size={34} color={colors.avatarIcon} />
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.85}>
          <Feather name="edit-3" size={14} color={colors.primary} />
          <Text style={[styles.editText, { color: colors.primary, fontSize: 12 * fontScale }]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.name, { color: colors.text, fontSize: 16 * fontScale }]}>
        {safeName}
      </Text>
      <Text style={[styles.email, { color: colors.muted, fontSize: 12 * fontScale }]}>
        {email}
      </Text>
      <Text style={[styles.bio, { color: colors.text, fontSize: 13 * fontScale }]}>
        {safeBio}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(79, 70, 229, 0.12)',
  },
  editText: {
    fontWeight: '700',
  },
  name: {
    fontWeight: '700',
  },
  email: {
    fontWeight: '500',
  },
  bio: {
    lineHeight: 18,
  },
});
