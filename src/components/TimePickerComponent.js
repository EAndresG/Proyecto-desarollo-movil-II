import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';

function parseTime(value) {
  if (!value || !value.includes(':')) return new Date();
  const [h, m] = value.split(':').map((part) => Number(part));
  const date = new Date();
  if (!Number.isNaN(h)) date.setHours(h);
  if (!Number.isNaN(m)) date.setMinutes(m);
  date.setSeconds(0);
  return date;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
function formatTimeLabel(value) {
  if (!value || !value.includes(':')) return value || '';
  const [rawHours, rawMinutes] = value.split(':').map((part) => Number(part));
  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) return value;
  const period = rawHours >= 12 ? 'PM' : 'AM';
  const displayHour = rawHours % 12 === 0 ? 12 : rawHours % 12;
  return `${displayHour}:${String(rawMinutes).padStart(2, '0')} ${period}`;
}

export default function TimePickerComponent({ value, onChange, colors, fontScale }) {
  const [showPicker, setShowPicker] = useState(false);
  const dateValue = useMemo(() => parseTime(value), [value]);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event?.type === 'dismissed') return;
    const nextDate = selectedDate || dateValue;
    onChange(formatTime(nextDate));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text, fontSize: 13 * fontScale }]}>
        Hora del recordatorio
      </Text>
      <TouchableOpacity
        style={[styles.timeInput, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.85}
      >
          <Text style={[styles.timeText, { color: colors.text, fontSize: 14 * fontScale }]}>
            {formatTimeLabel(value)}
        </Text>
        <Feather name="clock" size={16} color={colors.muted} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontWeight: '700',
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontWeight: '600',
  },
});
