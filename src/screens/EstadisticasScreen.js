import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLibros } from '../context/LibrosContext';
import KPICard from '../components/KPICard';
import LineChartComponent from '../components/LineChartComponent';
import BarChartComponent from '../components/BarChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import ExpandableMetrics from '../components/ExpandableMetrics';
import BookCompletedCard from '../components/BookCompletedCard';

const COLORS = {
  background: '#f8f9ff',
  card: '#ffffff',
  text: '#1a1a2e',
  muted: '#6b7280',
  border: '#e5e7eb',
  primary: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  soft: '#f3f4f6',
};

const RANGE_OPTIONS = [
  { key: 'mes', label: 'Este mes' },
  { key: 'ano', label: 'Este año' },
  { key: 'todoTiempo', label: 'Todo el tiempo' },
];

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const BASE_MONTH_DATA = [
  { key: '2025-12', label: 'Dic 2025', libros: 1, paginas: 180 },
  { key: '2026-01', label: 'Ene 2026', libros: 2, paginas: 340 },
  { key: '2026-02', label: 'Feb 2026', libros: 1, paginas: 215 },
  { key: '2026-03', label: 'Mar 2026', libros: 3, paginas: 580 },
  { key: '2026-04', label: 'Abr 2026', libros: 2, paginas: 420 },
  { key: '2026-05', label: 'May 2026', libros: 2, paginas: 340 },
];

const GENRE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

function parseDate(value) {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
}

function formatDateLabel(value) {
  const date = parseDate(value);
  const month = MONTH_LABELS[date.getMonth()];
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

function isInRange(date, range) {
  const now = new Date();
  if (range === 'mes') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (range === 'ano') {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

export default function EstadisticasScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;

  const { libros } = useLibros();
  const [range, setRange] = useState('mes');
  const [sortOrder, setSortOrder] = useState('reciente');
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeConfig, setNoticeConfig] = useState({ title: '', message: '', emoji: '✨' });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const showNotice = useCallback((config) => {
    setNoticeConfig(config);
    setNoticeVisible(true);
    noticeOpacity.setValue(0);
    noticeScale.setValue(0.96);
    Animated.parallel([
      Animated.timing(noticeOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(noticeScale, {
        toValue: 1,
        friction: 7,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.timing(noticeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setNoticeVisible(false));
    }, 1800);
  }, [noticeOpacity, noticeScale]);

  const completedBooks = useMemo(() => [
    {
      id: 'comp-1',
      titulo: '1984',
      autor: 'George Orwell',
      genero: 'Drama',
      paginas: 254,
      fecha: '2026-05-10',
    },
    {
      id: 'comp-2',
      titulo: 'Cien años de soledad',
      autor: 'Gabriel Garcia Marquez',
      genero: 'Realismo magico',
      paginas: 432,
      fecha: '2026-05-05',
    },
    {
      id: 'comp-3',
      titulo: 'El Principito',
      autor: 'Saint-Exupery',
      genero: 'Fantasia',
      paginas: 96,
      fecha: '2026-04-25',
    },
    {
      id: 'comp-4',
      titulo: 'Dune',
      autor: 'Frank Herbert',
      genero: 'Ciencia ficcion',
      paginas: 688,
      fecha: '2026-03-18',
    },
    {
      id: 'comp-5',
      titulo: 'Harry Potter',
      autor: 'J.K. Rowling',
      genero: 'Fantasia',
      paginas: 309,
      fecha: '2026-02-02',
    },
  ], []);

  const filteredBooks = useMemo(() => {
    return completedBooks.filter((book) => isInRange(parseDate(book.fecha), range));
  }, [completedBooks, range]);

  const kpis = useMemo(() => {
    const totalBooks = filteredBooks.length;
    const totalPages = filteredBooks.reduce((sum, book) => sum + (book.paginas || 0), 0);
    const streak = 7;
    return {
      totalBooks,
      totalPages,
      streak,
    };
  }, [filteredBooks]);

  const chartData = useMemo(() => {
    if (range === 'mes') {
      const currentKey = BASE_MONTH_DATA[BASE_MONTH_DATA.length - 1]?.key;
      return BASE_MONTH_DATA.map((item) => (
        item.key === currentKey ? item : { ...item, libros: 0, paginas: 0 }
      ));
    }
    return BASE_MONTH_DATA;
  }, [range]);

  const genreData = useMemo(() => {
    const map = new Map();
    filteredBooks.forEach((book) => {
      const key = book.genero || 'Sin genero';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value], index) => ({
      name,
      value,
      color: GENRE_COLORS[index % GENRE_COLORS.length],
    }));
  }, [filteredBooks]);

  const sortedCompleted = useMemo(() => {
    const data = [...filteredBooks];
    if (sortOrder === 'mayorPaginas') {
      data.sort((a, b) => (b.paginas || 0) - (a.paginas || 0));
    } else if (sortOrder === 'menorPaginas') {
      data.sort((a, b) => (a.paginas || 0) - (b.paginas || 0));
    } else {
      data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    return data;
  }, [filteredBooks, sortOrder]);

  const displayedCompleted = showAllCompleted ? sortedCompleted : sortedCompleted.slice(0, 5);

  const metrics = useMemo(() => {
    const bestStreak = '30 dias';
    const favorite = sortedCompleted[0]
      ? `${sortedCompleted[0].titulo} - ${sortedCompleted[0].paginas} pags`
      : 'Sin datos';
    const topGenre = genreData[0]
      ? `${genreData[0].name} - ${Math.round((genreData[0].value / Math.max(1, filteredBooks.length)) * 100)}%`
      : 'Sin datos';
    const days = range === 'mes' ? 30 : range === 'ano' ? 365 : 365;
    const avgPages = days ? (kpis.totalPages / days).toFixed(1) : '0';
    const librosPendientes = libros.filter((book) => (book.estado || 'Pendiente por leer') === 'Pendiente por leer').length;
    const librosLeyendo = libros.filter((book) => book.estado === 'Leyendo').length;
    return [
      { label: 'Mejor racha alcanzada', value: bestStreak },
      { label: 'Libro favorito', value: favorite },
      { label: 'Genero mas leido', value: topGenre },
      { label: 'Promedio de paginas por dia', value: `${avgPages} pags/dia` },
      { label: 'Libros por leer', value: `${librosPendientes} libros` },
      { label: 'Libros en progreso', value: `${librosLeyendo} libros` },
    ];
  }, [filteredBooks.length, genreData, kpis.totalPages, libros, range, sortedCompleted]);

  const kpiWidth = isLandscape ? '30%' : '30%';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Feather name="arrow-left" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus Estadisticas</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Indicadores clave</Text>
            <View style={styles.kpiGrid}>
              <View style={{ width: kpiWidth }}>
                <KPICard
                  title="Libros leidos este mes"
                  value={kpis.totalBooks}
                  subtitle={`${kpis.totalBooks} libros completados`}
                  icon="book"
                  color={COLORS.primary}
                  onPress={() => showNotice({
                    title: 'Libros leidos',
                    message: 'Cantidad de libros terminados en el rango seleccionado',
                    emoji: '📚',
                  })}
                />
              </View>
              <View style={{ width: kpiWidth }}>
                <KPICard
                  title="Paginas leidas este mes"
                  value={kpis.totalPages}
                  subtitle={`${kpis.totalPages} paginas completadas`}
                  icon="file-text"
                  color={COLORS.success}
                  onPress={() => showNotice({
                    title: 'Paginas leidas',
                    message: 'Suma de paginas leidas en el rango',
                    emoji: '📖',
                  })}
                />
              </View>
              <View style={{ width: kpiWidth }}>
                <KPICard
                  title="Racha actual"
                  value={kpis.streak}
                  subtitle={`${kpis.streak} dias consecutivos`}
                  icon="zap"
                  color={COLORS.warning}
                  onPress={() => showNotice({
                    title: 'Racha actual',
                    message: 'Mantienes una racha constante de lectura',
                    emoji: '🔥',
                  })}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Periodo de analisis</Text>
            <View style={styles.rangeRow}>
              {RANGE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.rangeBtn,
                    range === option.key && styles.rangeBtnActive,
                  ]}
                  onPress={() => setRange(option.key)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.rangeText, range === option.key && styles.rangeTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Libros leidos por mes</Text>
            <LineChartComponent data={chartData} color={COLORS.primary} height={280} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Paginas leidas por mes</Text>
            <BarChartComponent data={chartData} color={COLORS.success} height={280} />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Libros por genero</Text>
            <PieChartComponent data={genreData} height={280} />
          </View>

          <ExpandableMetrics metrics={metrics} />

          <View style={styles.sectionCard}>
            <View style={styles.completedHeader}>
              <Text style={styles.sectionTitle}>Libros completados recientemente</Text>
              <View style={styles.sortRow}>
                {[
                  { key: 'reciente', label: 'Mas recientes' },
                  { key: 'mayorPaginas', label: 'Mayor paginas' },
                  { key: 'menorPaginas', label: 'Menor paginas' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortBtn,
                      sortOrder === option.key && styles.sortBtnActive,
                    ]}
                    onPress={() => setSortOrder(option.key)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.sortText,
                        sortOrder === option.key && styles.sortTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.completedList}>
              {displayedCompleted.map((book, index) => (
                <BookCompletedCard
                  key={book.id}
                  book={{
                    ...book,
                    fechaLabel: formatDateLabel(book.fecha),
                  }}
                  index={index + 1}
                  onPress={() => showNotice({
                    title: 'Libro completado',
                    message: `${book.titulo} - ${book.paginas} pags`,
                    emoji: '✅',
                  })}
                />
              ))}
              {displayedCompleted.length === 0 ? (
                <Text style={styles.emptyText}>Sin datos en este periodo</Text>
              ) : null}
            </View>

            {sortedCompleted.length > 5 ? (
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setShowAllCompleted((prev) => !prev)}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>
                  {showAllCompleted ? 'Ver menos' : 'Ver mas'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </Animated.View>

      <Modal transparent visible={noticeVisible} animationType="none">
        <View style={styles.noticeBackdrop}>
          <Animated.View
            style={[
              styles.noticeCard,
              { opacity: noticeOpacity, transform: [{ scale: noticeScale }] },
            ]}
          >
            <Text style={styles.noticeEmoji}>{noticeConfig.emoji}</Text>
            <Text style={styles.noticeTitle}>{noticeConfig.title}</Text>
            <Text style={styles.noticeText}>{noticeConfig.message}</Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 28,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  rangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.soft,
  },
  rangeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  rangeTextActive: {
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  completedHeader: {
    gap: 10,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.soft,
  },
  sortBtnActive: {
    backgroundColor: COLORS.primary,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  sortTextActive: {
    color: '#ffffff',
  },
  completedList: {
    gap: 10,
  },
  outlineBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  noticeBackdrop: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '94%',
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6e8f2',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  noticeEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  noticeText: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
