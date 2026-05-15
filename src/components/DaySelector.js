import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DAY_OPTIONS = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mie' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sab' },
  { key: 'dom', label: 'Dom' },
];

export default function DaySelector({
  selectionType,
  selectedDays,
  onTypeChange,
  onDaysChange,
  colors,
  fontScale,
}) {
  const toggleDay = (dayKey) => {
    const exists = selectedDays.includes(dayKey);
    const next = exists
      ? selectedDays.filter((day) => day !== dayKey)
      : [...selectedDays, dayKey];
    onDaysChange(next);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, fontSize: 13 * fontScale }]}>
        Que dias?
      </Text>

      <View style={styles.radioRow}>
        {[
          { key: 'todos', label: 'Todos los dias' },
          { key: 'fines_semana', label: 'Solo fines de semana' },
          { key: 'especifico', label: 'Seleccionar especificos' },
        ].map((option) => {
          const selected = selectionType === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={styles.radioOption}
              onPress={() => onTypeChange(option.key)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: selected ? colors.primary : colors.border },
                ]}
              >
                {selected ? (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                ) : null}
              </View>
              <Text style={[styles.radioLabel, { color: colors.text, fontSize: 12 * fontScale }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectionType === 'especifico' ? (
        <View style={styles.daysRow}>
          {DAY_OPTIONS.map((day) => {
            const selected = selectedDays.includes(day.key);
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayChip,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? 'rgba(79, 70, 229, 0.12)' : colors.card,
                  },
                ]}
                onPress={() => toggleDay(day.key)}
                activeOpacity={0.85}
              >
                <Text
                  style={{
                    color: selected ? colors.primary : colors.text,
                    fontSize: 12 * fontScale,
                    fontWeight: selected ? '700' : '600',
                  }}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      <View style={styles.selectedRow}>
        {selectedDays.length === 0 ? (
          <Text style={[styles.selectedText, { color: colors.muted, fontSize: 12 * fontScale }]}>
            Selecciona al menos un dia
          </Text>
        ) : (
          selectedDays.map((dayKey) => {
            const label = DAY_OPTIONS.find((day) => day.key === dayKey)?.label ?? dayKey;
            return (
              <View key={dayKey} style={[styles.selectedChip, { backgroundColor: colors.soft }]}
              >
                <Feather name="check" size={12} color={colors.primary} />
                <Text style={[styles.selectedText, { color: colors.text, fontSize: 11 * fontScale }]}>
                  {label}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontWeight: '700',
  },
  radioRow: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioLabel: {
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedText: {
    fontWeight: '600',
  },
});
