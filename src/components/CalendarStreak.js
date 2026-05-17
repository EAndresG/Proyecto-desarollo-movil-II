import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WEEK_DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate();
}

export default function CalendarStreak({
  monthDate,
  readings,
  onNavigate,
  canGoPrev,
  canGoNext,
  onDayPress,
  colors,
}) {
  const safeColors = colors || {
    text: '#1a1a2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    primary: '#4f46e5',
    success: '#10b981',
    soft: '#f3f4f6',
  };

  const [selectedInfo, setSelectedInfo] = useState(null);
  const today = new Date();

  const gridDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const startDate = new Date(year, month, 1 - startOffset);
    const days = [];
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push({
        date,
        inMonth: date.getMonth() === month,
      });
    }
    return days;
  }, [monthDate]);

  const monthLabel = useMemo(() => {
    return `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  }, [monthDate]);

  const handleSelect = useCallback((date) => {
    const key = formatDateKey(date);
    const pages = readings?.[key] || 0;
    const info = { date, pages, key };
    setSelectedInfo(info);
    if (onDayPress) {
      onDayPress(info);
    }
  }, [onDayPress, readings]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.navBtn, !canGoPrev && styles.navBtnDisabled]}
          onPress={() => onNavigate(-1)}
          disabled={!canGoPrev}
          activeOpacity={0.85}
        >
          <Feather name="chevron-left" size={18} color={safeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: safeColors.text }]}>{monthLabel}</Text>
        <TouchableOpacity
          style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
          onPress={() => onNavigate(1)}
          disabled={!canGoNext}
          activeOpacity={0.85}
        >
          <Feather name="chevron-right" size={18} color={safeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={[styles.weekLabel, { color: safeColors.muted }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {gridDays.map((dayItem) => {
          const key = formatDateKey(dayItem.date);
          const readPages = readings?.[key] || 0;
          const isRead = readPages > 0;
          const isToday = isSameDay(dayItem.date, today);
          return (
            <TouchableOpacity
              key={key}
              style={styles.cell}
              onPress={() => handleSelect(dayItem.date)}
              disabled={!dayItem.inMonth}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: isRead ? safeColors.success : safeColors.soft,
                    borderColor: isToday ? safeColors.primary : 'transparent',
                    opacity: dayItem.inMonth ? 1 : 0.25,
                  },
                ]}
              >
                <Text style={[styles.dayLabel, { color: isRead ? '#fff' : safeColors.muted }]}>
                  {dayItem.date.getDate()}
                </Text>
                {isRead ? (
                  <Text style={styles.checkMark}>✓</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedInfo ? (
        <View style={[styles.tooltip, { backgroundColor: safeColors.soft }]}
        >
          <Text style={[styles.tooltipText, { color: safeColors.text }]}>
            {selectedInfo.key}: {selectedInfo.pages} paginas leidas
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    width: '14.2%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2%',
    paddingVertical: 6,
    alignItems: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkMark: {
    position: 'absolute',
    bottom: -8,
    fontSize: 10,
    color: '#ffffff',
  },
  tooltip: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
