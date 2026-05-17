import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MetaProgressCard({ meta, colors, onEdit, onDelete }) {
  const safeColors = colors || {
    card: '#ffffff',
    text: '#1a1a2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    primary: '#4f46e5',
    danger: '#ef4444',
  };

  const percent = useMemo(() => {
    if (!meta?.cantidad) return 0;
    return Math.min(100, Math.round((meta.lograda / meta.cantidad) * 100));
  }, [meta]);

  const progressWidth = `${Math.max(6, percent)}%`;
  const isBooks = meta?.tipo === 'libros';
  const unitLabel = isBooks ? 'libros' : 'paginas';
  const amountLabel = `${meta.cantidad} ${unitLabel}`;
  const progressLabel = isBooks
    ? `${meta.lograda}/${meta.cantidad} libros`
    : `${meta.lograda}/${meta.cantidad} paginas`;

  return (
    <View style={[styles.card, { backgroundColor: safeColors.card, borderColor: safeColors.border }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: safeColors.text }]}>{amountLabel}</Text>
          <Text style={[styles.subtitle, { color: safeColors.muted }]}>{meta.periodoLabel}</Text>
        </View>
        <Text style={[styles.percent, { color: safeColors.primary }]}>{percent}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: '#f3f4f6' }]}>
        <View style={[styles.progressFill, { width: progressWidth, backgroundColor: safeColors.primary }]} />
      </View>
      <View style={styles.progressRow}>
        <Text style={[styles.progressText, { color: safeColors.muted }]}>{progressLabel}</Text>
        {meta.tipoLabel ? (
          <Text style={[styles.typeLabel, { color: safeColors.text }]}>{meta.tipoLabel}</Text>
        ) : null}
      </View>
      {(onEdit || onDelete) ? (
        <View style={styles.actions}>
          {onEdit ? (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.85}>
              <Feather name="edit" size={14} color={safeColors.primary} />
              <Text style={[styles.actionText, { color: safeColors.primary }]}>Editar</Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: '#fecdd3' }]}
              onPress={onDelete}
              activeOpacity={0.85}
            >
              <Feather name="trash-2" size={14} color={safeColors.danger} />
              <Text style={[styles.actionText, { color: safeColors.danger }]}>Eliminar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  percent: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
