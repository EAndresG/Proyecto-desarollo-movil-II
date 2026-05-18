import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line as SvgLine, Text as SvgText, G } from 'react-native-svg';

function formatXAxisLabel(label) {
  if (!label) return '';
  const parts = label.split(' ');
  if (parts.length >= 2) {
    const year = parts[1];
    const shortYear = year.length === 4 ? year.slice(2) : year;
    return `${parts[0]} ${shortYear}`;
  }
  return label;
}

function getYAxisTicks(maxValue, steps = 4) {
  const safeMax = Math.max(1, maxValue);
  const step = Math.ceil(safeMax / (steps - 1));
  return Array.from({ length: steps }, (_, index) => step * index);
}

export default function BarChartComponent({ data, color, height }) {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState(null);
  const chartWidth = useMemo(() => Math.max(280, width - 64), [width]);
  const chartHeight = height || 260;
  const padding = 32;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>Sin datos en este periodo</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.paginas || 0), 1);
  const slotWidth = innerWidth / data.length;
  const barWidth = slotWidth * 0.6;

  const yTicks = getYAxisTicks(maxValue, 4);
  const gridLines = yTicks.map((tick) => {
    const ratio = tick / Math.max(1, yTicks[yTicks.length - 1]);
    const y = padding + innerHeight - ratio * innerHeight;
    return { y, tick };
  });

  const minLabelSpacing = 48;
  const showAllLabels = innerWidth / data.length >= minLabelSpacing;

  return (
    <View style={styles.chartWrap}>
      <Svg width={chartWidth} height={chartHeight}>
        <G>
          {gridLines.map((grid, index) => (
            <SvgLine
              key={`grid-${index}`}
              x1={padding}
              x2={chartWidth - padding}
              y1={grid.y}
              y2={grid.y}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
            />
          ))}
          {gridLines.map((grid, index) => (
            <SvgText
              key={`tick-${index}`}
              x={padding - 8}
              y={grid.y + 4}
              fill="#6b7280"
              fontSize="10"
              textAnchor="end"
            >
              {grid.tick}
            </SvgText>
          ))}
          {data.map((item, index) => {
            const barHeight = (item.paginas / maxValue) * innerHeight;
            const x = padding + slotWidth * index + (slotWidth - barWidth) / 2;
            const y = padding + innerHeight - barHeight;
            return (
              <Rect
                key={item.label}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={color}
                onPress={() => setSelected(item)}
              />
            );
          })}
          {data.map((item, index) => {
            if (!showAllLabels && index % 2 === 1 && index !== data.length - 1) return null;
            return (
              <SvgText
                key={`label-${item.label}`}
                x={padding + slotWidth * index + slotWidth / 2}
                y={chartHeight - 6}
                fill="#6b7280"
                fontSize="9"
                textAnchor="middle"
              >
                {formatXAxisLabel(item.label)}
              </SvgText>
            );
          })}
        </G>
      </Svg>
      {selected ? (
        <Text style={styles.helperText}>
          {selected.label}: {selected.paginas} paginas
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
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
