import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

function polarToCartesian(cx, cy, radius, angle) {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeWedge(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export default function PieChartComponent({ data, height }) {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(null);
  const chartWidth = useMemo(() => Math.max(280, width - 64), [width]);
  const chartHeight = height || 260;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Sin datos en este periodo</Text>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = Math.min(90, chartHeight / 3);
  const cx = chartWidth / 2;
  const cy = chartHeight / 2;
  let startAngle = 0;

  const slices = data.map((item) => {
    const angle = (item.value / total) * 360;
    const endAngle = startAngle + angle;
    const path = describeWedge(cx, cy, radius, startAngle, endAngle);
    const slice = { ...item, path, startAngle, endAngle };
    startAngle = endAngle;
    return slice;
  });

  return (
    <View style={styles.wrapper}>
      <Svg width={chartWidth} height={chartHeight}>
        {slices.map((slice) => (
          <Path
            key={slice.name}
            d={slice.path}
            fill={slice.color}
            onPress={() => setSelected(slice)}
          />
        ))}
      </Svg>
      {selected ? (
        <Text style={styles.helperText}>
          {selected.name}: {Math.round((selected.value / total) * 100)}%
        </Text>
      ) : null}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.name} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
            <Text style={styles.legendValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 12,
  },
  legend: {
    width: '100%',
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyBox: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
});
