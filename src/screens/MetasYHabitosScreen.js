import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLibros } from '../context/LibrosContext';
import MetaProgressCard from '../components/MetaProgressCard';
import Streak from '../components/Streak';
import CalendarStreak from '../components/CalendarStreak';
import BadgeItem from '../components/BadgeItem';
import PresetMetaButton from '../components/PresetMetaButton';
import useAuth from '../hooks/useAuth';

const COLORS = {
  background: '#f8f9ff',
  card: '#ffffff',
  text: '#1a1a2e',
  muted: '#6b7280',
  border: '#e5e7eb',
  primary: '#4f46e5',
  softIndigo: '#eef2ff',
  success: '#10b981',
  danger: '#ef4444',
  soft: '#f3f4f6',
  warning: '#f59e0b',
};

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

const DAILY_GOAL = 100;
const MAX_BACK_MONTHS = 6;
const DEFAULT_ACCOUNT_EMAIL = 'test@example.com';

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthLabel(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMotivationalMessage(days) {
  if (days <= 0) return 'Empieza tu racha hoy!';
  if (days <= 6) return 'Vas muy bien! Sigue adelante';
  if (days <= 14) return 'Increible! Una semana leyendo';
  if (days <= 30) return 'Eres un lector consistente!';
  return 'Legendario! Eres un verdadero amante de la lectura!';
}

function calculateStreak(readings) {
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (true) {
    const key = formatDateKey(cursor);
    if (readings[key]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  const keys = Object.keys(readings);
  const lastReadKey = keys.sort().slice(-1)[0] || '';
  return { streak, lastReadKey };
}

function createInitialReadings() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 14, 15, today.getDate()];
  const readings = {};
  days.forEach((day) => {
    const date = new Date(year, month, day);
    readings[formatDateKey(date)] = day === today.getDate() ? 45 : 20;
  });
  return readings;
}

function buildDefaultMetas() {
  const now = new Date();
  const year = now.getFullYear();
  return [
    {
      id: 'meta-1',
      tipo: 'libros',
      cantidad: 3,
      lograda: 2,
      periodoType: 'mes',
      periodoLabel: getMonthLabel(now),
      periodoKey: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    },
    {
      id: 'meta-2',
      tipo: 'paginas',
      cantidad: 500,
      lograda: 360,
      periodoType: 'ano',
      periodoLabel: String(year),
      periodoKey: String(year),
    },
  ];
}

function buildDefaultRacha() {
  return {
    diasActuales: 7,
    mejorRacha: 15,
    ultimaLectura: formatDateKey(new Date()),
    completadoHoy: true,
  };
}

const EMPTY_RACHA = {
  diasActuales: 0,
  mejorRacha: 0,
  ultimaLectura: '',
  completadoHoy: false,
};

export default function MetasYHabitosScreen({ navigation }) {
  const { user } = useAuth();
  const userKey = (user?.email || DEFAULT_ACCOUNT_EMAIL).toLowerCase();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [isHydrated, setIsHydrated] = useState(false);

  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeConfig, setNoticeConfig] = useState({
    title: '',
    message: '',
    emoji: '✨',
    variant: 'info',
  });

  const [metas, setMetas] = useState([]);
  const [dailyReadings, setDailyReadings] = useState({});
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [racha, setRacha] = useState(EMPTY_RACHA);

  const [metaModalVisible, setMetaModalVisible] = useState(false);
  const [metaForm, setMetaForm] = useState({
    id: null,
    tipo: 'libros',
    cantidad: '',
    periodoType: 'mes',
    fechaPersonalizada: new Date(),
  });
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const metaActual = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthMeta = metas.find(
      (meta) => meta.periodoType === 'mes' && meta.periodoKey === monthKey,
    );
    if (monthMeta) return { ...monthMeta, heroLabel: 'Tu meta de este mes' };
    const yearMeta = metas.find(
      (meta) => meta.periodoType === 'ano' && meta.periodoKey === String(year),
    );
    if (yearMeta) return { ...yearMeta, heroLabel: 'Tu meta del año' };
    if (metas.length) return { ...metas[0], heroLabel: 'Tu meta activa' };
    return null;
  }, [metas]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      setIsHydrated(false);
      try {
        const raw = await AsyncStorage.getItem(`user:${userKey}:goals`);
        if (!isMounted) return;

        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.metas)) {
            setMetas(parsed.metas);
          }
          if (parsed?.dailyReadings && typeof parsed.dailyReadings === 'object') {
            setDailyReadings(parsed.dailyReadings);
          }
          if (parsed?.racha && typeof parsed.racha === 'object') {
            setRacha({ ...EMPTY_RACHA, ...parsed.racha });
          }
          return;
        }

        if (userKey === DEFAULT_ACCOUNT_EMAIL) {
          setMetas(buildDefaultMetas());
          setDailyReadings(createInitialReadings());
          setRacha(buildDefaultRacha());
        } else {
          setMetas([]);
          setDailyReadings({});
          setRacha(EMPTY_RACHA);
        }
      } catch (error) {
        // ignore storage errors
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    loadUserData();

    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [userKey]);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(
      `user:${userKey}:goals`,
      JSON.stringify({ metas, dailyReadings, racha }),
    );
  }, [dailyReadings, isHydrated, metas, racha, userKey]);

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
    }, 2000);
  }, [noticeOpacity, noticeScale]);

  const todaysKey = useMemo(() => formatDateKey(new Date()), []);
  const { libros, lastPageById } = useLibros();

  const totalPagesFromProgress = useMemo(() => {
    return libros.reduce((sum, libro) => {
      const lastPage = Number(lastPageById?.[libro.id] || 0);
      if (!lastPage) return sum;
      const totalPages = Number(libro.paginas) || lastPage;
      return sum + Math.min(lastPage, totalPages);
    }, 0);
  }, [libros, lastPageById]);

  const pagesToday = totalPagesFromProgress || (dailyReadings[todaysKey] || 0);

  const metaActualDisplay = useMemo(() => {
    if (!metaActual) {
      return {
        tipo: 'libros',
        cantidad: 0,
        lograda: 0,
        percent: 0,
        heroLabel: 'Tu meta principal',
        isEmpty: true,
      };
    }
    const progressValue = metaActual.tipo === 'paginas'
      ? totalPagesFromProgress
      : metaActual.lograda;
    const percent = metaActual.cantidad
      ? Math.min(100, Math.round((progressValue / metaActual.cantidad) * 100))
      : 0;
    return {
      ...metaActual,
      lograda: progressValue,
      percent,
      isEmpty: false,
    };
  }, [metaActual, totalPagesFromProgress]);

  const dailyPercent = Math.min(100, Math.round((pagesToday / DAILY_GOAL) * 100));

  const metasWithDynamicProgress = useMemo(() => {
    return metas.map((meta) => {
      if (meta.tipo === 'paginas') {
        return {
          ...meta,
          lograda: totalPagesFromProgress,
        };
      }
      return meta;
    });
  }, [metas, totalPagesFromProgress]);

  useEffect(() => {
    const { streak, lastReadKey } = calculateStreak(dailyReadings);
    setRacha((prev) => ({
      ...prev,
      diasActuales: streak,
      ultimaLectura: lastReadKey || prev.ultimaLectura,
      completadoHoy: !!dailyReadings[todaysKey],
      mejorRacha: Math.max(prev.mejorRacha, streak),
    }));
  }, [dailyReadings, todaysKey]);

  const celebracionRef = useRef(false);
  useEffect(() => {
    if (!celebracionRef.current && !metaActualDisplay.isEmpty && metaActualDisplay.percent >= 100) {
      celebracionRef.current = true;
      showNotice({
        title: 'Meta completada',
        message: 'Felicidades! completaste tu meta',
        emoji: '🎉',
        variant: 'success',
      });
    }
  }, [metaActualDisplay.percent, showNotice]);

  const handleNavigateMonth = useCallback((direction) => {
    setMonthDate((prev) => {
      const next = addMonths(prev, direction);
      const diff = (next.getFullYear() - new Date().getFullYear()) * 12
        + (next.getMonth() - new Date().getMonth());
      if (diff < -MAX_BACK_MONTHS || diff > 0) {
        return prev;
      }
      return next;
    });
  }, []);

  const canGoPrev = useMemo(() => {
    const diff = (monthDate.getFullYear() - new Date().getFullYear()) * 12
      + (monthDate.getMonth() - new Date().getMonth());
    return diff > -MAX_BACK_MONTHS;
  }, [monthDate]);

  const canGoNext = useMemo(() => {
    const diff = (monthDate.getFullYear() - new Date().getFullYear()) * 12
      + (monthDate.getMonth() - new Date().getMonth());
    return diff < 0;
  }, [monthDate]);

  const getPeriodoKey = useCallback((form) => {
    if (form.periodoType === 'mes') {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    if (form.periodoType === 'ano') {
      return String(new Date().getFullYear());
    }
    return formatDateKey(form.fechaPersonalizada);
  }, []);

  const getPeriodoLabel = useCallback((form) => {
    if (form.periodoType === 'mes') return getMonthLabel(new Date());
    if (form.periodoType === 'ano') return String(new Date().getFullYear());
    return formatDateKey(form.fechaPersonalizada);
  }, []);

  const handleOpenCreateMeta = useCallback(() => {
    setMetaForm({
      id: null,
      tipo: 'libros',
      cantidad: '',
      periodoType: 'mes',
      fechaPersonalizada: new Date(),
    });
    setIsEditingMeta(false);
    setMetaModalVisible(true);
  }, []);

  const handleOpenEditMeta = useCallback((meta) => {
    setMetaForm({
      id: meta.id,
      tipo: meta.tipo,
      cantidad: String(meta.cantidad),
      periodoType: meta.periodoType,
      fechaPersonalizada: meta.periodoType === 'personalizado'
        ? new Date(meta.periodoKey)
        : new Date(),
    });
    setIsEditingMeta(true);
    setMetaModalVisible(true);
  }, []);

  const handleSaveMeta = useCallback(() => {
    const amount = Number.parseInt(metaForm.cantidad, 10);
    if (!amount || amount <= 0 || amount > 999) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      showNotice({
        title: 'Datos invalidos',
        message: 'Cantidad debe estar entre 1 y 999',
        emoji: '⚠️',
        variant: 'warning',
      });
      return;
    }

    const periodoKey = getPeriodoKey(metaForm);
    const periodoLabel = getPeriodoLabel(metaForm);
    const duplicated = metas.some((meta) => (
      meta.id !== metaForm.id
      && meta.tipo === metaForm.tipo
      && meta.periodoKey === periodoKey
    ));

    if (duplicated) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      showNotice({
        title: 'Meta repetida',
        message: 'Ya existe una meta similar en ese periodo',
        emoji: '⚠️',
        variant: 'warning',
      });
      return;
    }

    if (isEditingMeta) {
      setMetas((prev) => prev.map((meta) => (
        meta.id === metaForm.id
          ? {
            ...meta,
            tipo: metaForm.tipo,
            cantidad: amount,
            periodoType: metaForm.periodoType,
            periodoKey,
            periodoLabel,
          }
          : meta
      )));
      showNotice({
        title: 'Meta actualizada',
        message: 'Los cambios fueron guardados',
        emoji: '✅',
        variant: 'success',
      });
    } else {
      const newMeta = {
        id: `meta-${Date.now()}`,
        tipo: metaForm.tipo,
        cantidad: amount,
        lograda: 0,
        periodoType: metaForm.periodoType,
        periodoLabel,
        periodoKey,
      };
      setMetas((prev) => [newMeta, ...prev]);
      showNotice({
        title: 'Meta creada',
        message: 'Meta creada exitosamente',
        emoji: '🎯',
        variant: 'success',
      });
    }

    setMetaModalVisible(false);
  }, [getPeriodoKey, getPeriodoLabel, isEditingMeta, metaForm, metas, showNotice, shakeAnim]);

  const handleRequestDeleteMeta = useCallback((meta) => {
    setConfirmTarget(meta);
    setConfirmVisible(true);
  }, []);

  const handleConfirmDeleteMeta = useCallback(() => {
    if (!confirmTarget) return;
    setMetas((prev) => prev.filter((meta) => meta.id !== confirmTarget.id));
    setConfirmVisible(false);
    setConfirmTarget(null);
    showNotice({
      title: 'Meta eliminada',
      message: 'La meta fue eliminada',
      emoji: '🗑️',
      variant: 'warning',
    });
  }, [confirmTarget, showNotice]);

  const handleCancelDeleteMeta = useCallback(() => {
    setConfirmVisible(false);
    setConfirmTarget(null);
  }, []);

  const badges = useMemo(() => {
    const badge7 = racha.diasActuales >= 7;
    const badge30 = racha.diasActuales >= 30;
    const badgeYear = racha.diasActuales >= 365;
    const metasCompletas = badge7 && badge30 && badgeYear;
    return [
      {
        id: 'badge-7',
        nombre: '7 dias',
        icon: '🔥',
        completado: badge7,
        descripcion: 'Manten 7 dias leyendo',
      },
      {
        id: 'badge-30',
        nombre: '30 dias',
        icon: '🏆',
        completado: badge30,
        descripcion: 'Una racha de 30 dias',
      },
      {
        id: 'badge-year',
        nombre: '1 año',
        icon: '👑',
        completado: badgeYear,
        descripcion: 'Racha de un año',
      },
      {
        id: 'badge-meta',
        nombre: 'Metas completas',
        icon: '🎯',
        completado: metasCompletas,
        descripcion: 'Completa todos los logros',
      },
    ];
  }, [racha.diasActuales]);

  const presets = [
    { id: 'preset-3', label: '3 libros', tipo: 'libros', cantidad: 3 },
    { id: 'preset-5', label: '5 libros', tipo: 'libros', cantidad: 5 },
    { id: 'preset-500', label: '500 paginas', tipo: 'paginas', cantidad: 500 },
    { id: 'preset-800', label: '800 paginas', tipo: 'paginas', cantidad: 800 },
  ];

  const handleApplyPreset = useCallback((preset) => {
    setMetaForm({
      id: null,
      tipo: preset.tipo,
      cantidad: String(preset.cantidad),
      periodoType: 'mes',
      fechaPersonalizada: new Date(),
    });
    setIsEditingMeta(false);
    setShowDatePicker(false);
    setMetaModalVisible(true);
  }, []);

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
        <Text style={styles.headerTitle}>Metas y Habitos</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroCard, { backgroundColor: COLORS.softIndigo }]}>
            <View style={styles.heroMeta}>
              <Text style={styles.sectionLabel}>
                {metaActualDisplay.heroLabel || 'Tu meta principal'}
              </Text>
              <Text style={styles.heroTitle}>
                {metaActualDisplay.isEmpty
                  ? 'Sin meta activa'
                  : (metaActualDisplay.tipo === 'libros' ? 'Libros' : 'Paginas')}
              </Text>
              <Text style={styles.heroAmount}>
                {metaActualDisplay.isEmpty
                  ? 'Crea una meta para empezar'
                  : `${metaActualDisplay.cantidad} ${metaActualDisplay.tipo}`}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${metaActualDisplay.percent}%` },
                  ]}
                />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {metaActualDisplay.isEmpty
                    ? 'Sin progreso aun'
                    : (metaActualDisplay.tipo === 'paginas'
                      ? `${metaActualDisplay.lograda}/${metaActualDisplay.cantidad} paginas`
                      : `${metaActualDisplay.lograda}/${metaActualDisplay.cantidad} completados`)}
                </Text>
                <Text style={styles.progressPercent}>{metaActualDisplay.percent}%</Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <Streak
              dias={racha.diasActuales}
              mejorRacha={racha.mejorRacha}
              mensaje={getMotivationalMessage(racha.diasActuales)}
              colors={COLORS}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Leido hoy</Text>
            <Text style={styles.pagesToday}>{pagesToday} paginas</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tu historial de lectura</Text>
            <CalendarStreak
              monthDate={monthDate}
              readings={dailyReadings}
              onNavigate={handleNavigateMonth}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              colors={COLORS}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Gestion de metas</Text>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={handleOpenCreateMeta}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineBtnText}>+ Crear nueva meta</Text>
            </TouchableOpacity>

            <View style={styles.presetsRow}>
              {presets.map((preset) => (
                <View key={preset.id} style={{ width: isLandscape ? '48%' : '48%' }}>
                  <PresetMetaButton
                    label={preset.label}
                    onPress={() => handleApplyPreset(preset)}
                    selected={metaForm.cantidad === String(preset.cantidad)}
                    colors={COLORS}
                  />
                </View>
              ))}
            </View>

            <View style={styles.metaList}>
              {metasWithDynamicProgress.map((meta) => (
                <MetaProgressCard
                  key={meta.id}
                  meta={meta}
                  colors={COLORS}
                  onEdit={() => handleOpenEditMeta(meta)}
                  onDelete={() => handleRequestDeleteMeta(meta)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tus logros</Text>
            <View style={styles.badgeGrid}>
              {badges.map((badge) => (
                <View key={badge.id} style={{ width: isLandscape ? '22%' : '48%' }}>
                  <BadgeItem
                    icon={badge.icon}
                    nombre={badge.nombre}
                    descripcion={badge.descripcion}
                    completado={badge.completado}
                    colors={COLORS}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <Modal transparent visible={metaModalVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.modalCard, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.modalTitle}>{isEditingMeta ? 'Editar meta' : 'Crear nueva meta'}</Text>
            <Text style={styles.modalLabel}>Meta por</Text>
            <View style={styles.radioRow}>
              {['libros', 'paginas'].map((option) => {
                const selected = metaForm.tipo === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioOption}
                    onPress={() => setMetaForm((prev) => ({ ...prev, tipo: option }))}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: selected ? COLORS.primary : COLORS.border },
                      ]}
                    >
                      {selected ? (
                        <View style={[styles.radioInner, { backgroundColor: COLORS.primary }]} />
                      ) : null}
                    </View>
                    <Text style={styles.radioLabel}>{option === 'libros' ? 'Libros' : 'Paginas'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>Cantidad objetivo</Text>
            <TextInput
              value={metaForm.cantidad}
              onChangeText={(value) => setMetaForm((prev) => ({ ...prev, cantidad: value }))}
              keyboardType="numeric"
              placeholder={metaForm.tipo === 'libros' ? 'Ej: 3' : 'Ej: 500'}
              placeholderTextColor={COLORS.muted}
              style={styles.modalInput}
            />

            <Text style={styles.modalLabel}>¿Para cuando?</Text>
            <View style={styles.radioRow}>
              {[
                { key: 'mes', label: 'Este mes' },
                { key: 'ano', label: 'Este año' },
                { key: 'personalizado', label: 'Día' },
              ].map((option) => {
                const selected = metaForm.periodoType === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.radioOption}
                    onPress={() => setMetaForm((prev) => ({ ...prev, periodoType: option.key }))}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: selected ? COLORS.primary : COLORS.border },
                      ]}
                    >
                      {selected ? (
                        <View style={[styles.radioInner, { backgroundColor: COLORS.primary }]} />
                      ) : null}
                    </View>
                    <Text style={styles.radioLabel}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {metaForm.periodoType === 'personalizado' ? (
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.dateBtnText}>Elegir fecha</Text>
                <Text style={styles.dateValue}>{formatDateKey(metaForm.fechaPersonalizada)}</Text>
              </TouchableOpacity>
            ) : null}

            {showDatePicker ? (
              <DateTimePicker
                value={metaForm.fechaPersonalizada}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setMetaForm((prev) => ({ ...prev, fechaPersonalizada: selectedDate }));
                  }
                }}
              />
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setMetaModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={handleSaveMeta}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {isEditingMeta ? 'Guardar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal transparent visible={confirmVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.confirmCard]}>
            <Text style={styles.confirmEmoji}>🗑️</Text>
            <Text style={styles.modalTitle}>Eliminar meta</Text>
            <Text style={styles.confirmText}>
              Esta accion no se puede deshacer. Deseas eliminar esta meta?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={handleCancelDeleteMeta}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={handleConfirmDeleteMeta}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={noticeVisible} animationType="none">
        <View style={styles.noticeBackdrop}>
          <Animated.View
            style={[
              styles.noticeCard,
              styles[`noticeCard_${noticeConfig.variant}`],
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
    gap: 20,
  },
  heroCard: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  heroMeta: {
    gap: 8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#e0e7ff',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  readToggle: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  readToggleText: {
    fontWeight: '700',
    fontSize: 13,
  },
  pagesToday: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pagesSub: {
    fontSize: 12,
    color: COLORS.muted,
  },
  progressTrackSmall: {
    height: 6,
    borderRadius: 999,
    backgroundColor: COLORS.soft,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  progressHint: {
    fontSize: 12,
    color: COLORS.muted,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
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
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaList: {
    gap: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: COLORS.text,
  },
  modalLabel: {
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.muted,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalBtnGhost: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalBtnDanger: {
    backgroundColor: COLORS.danger,
  },
  modalBtnText: {
    fontWeight: '700',
    color: COLORS.text,
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
    color: COLORS.text,
  },
  dateBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBtnText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  dateValue: {
    color: COLORS.muted,
    fontSize: 12,
  },
  confirmCard: {
    borderColor: '#fecdd3',
    borderWidth: 1,
  },
  confirmEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
  confirmText: {
    textAlign: 'center',
    color: COLORS.muted,
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
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  noticeCard_info: {
    borderColor: '#e6e8f2',
  },
  noticeCard_success: {
    borderColor: '#c7f5d9',
  },
  noticeCard_warning: {
    borderColor: '#fde5b1',
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
