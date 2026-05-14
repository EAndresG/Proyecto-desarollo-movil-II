import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';

export default function ConfigOption({
  title,
  description,
  type,
  value,
  options,
  onChange,
  colors,
  fontScale,
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text, fontSize: 14 * fontScale }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: colors.muted, fontSize: 12 * fontScale }]}>
            {description}
          </Text>
        </View>
        {type === 'toggle' ? (
          <Switch
            value={value}
            onValueChange={onChange}
            trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
            thumbColor={value ? '#4f46e5' : '#f9fafb'}
          />
        ) : null}
      </View>

      {type === 'selector' ? (
        <View style={styles.selectorRow}>
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorBtn,
                  {
                    backgroundColor: selected ? '#4f46e5' : '#f3f4f6',
                    borderColor: selected ? '#4f46e5' : '#e5e7eb',
                  },
                ]}
                onPress={() => onChange(option.value)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.selectorText,
                    {
                      color: selected ? '#fff' : '#111827',
                      fontSize: 12 * fontScale,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    marginTop: 4,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  selectorText: {
    fontWeight: '700',
  },
});
