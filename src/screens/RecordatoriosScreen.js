import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TimePickerComponent from '../components/TimePickerComponent';
import DaySelector from '../components/DaySelector';
import PresetButton from '../components/PresetButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGE_LIMIT = 100;
const ALL_DAYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
const WEEKEND = ['sab', 'dom'];
const WEEKDAYS = ['lun', 'mar', 'mie', 'jue', 'vie'];

const PRESETS = [
  { id: 'morning', label: '🌅 Manana a las 7:00 AM', time: '07:00', type: 'todos' },
  { id: 'afternoon', label: '🌤️ Tarde a las 6:00 PM', time: '18:00', type: 'todos' },
  { id: 'night', label: '🌙 Noche a las 9:00 PM', time: '21:00', type: 'todos' },
  { id: 'custom', label: '⚙️ Personalizado', time: null, type: 'especifico' },
];

const DEFAULT_CONFIG = {
  title: '',
  time: '00:00',
  days: WEEKDAYS,
  selectionType: 'especifico',
  active: true,
  pushEnabled: true,
  message: 'Es hora de leer',
};

const REMINDERS_STORAGE_KEY = 'device:reminders';

export default function RecordatoriosScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [time, setTime] = useState(DEFAULT_CONFIG.time);
  const [days, setDays] = useState(DEFAULT_CONFIG.days);
  const [selectionType, setSelectionType] = useState(DEFAULT_CONFIG.selectionType);
  const [active, setActive] = useState(DEFAULT_CONFIG.active);
  const [pushEnabled, setPushEnabled] = useState(DEFAULT_CONFIG.pushEnabled);
  const [message, setMessage] = useState(DEFAULT_CONFIG.message);
  const [title, setTitle] = useState(DEFAULT_CONFIG.title);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [reminders, setReminders] = useState(() => [
    { id: 'rem-1', ...DEFAULT_CONFIG },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeConfig, setNoticeConfig] = useState({ message: '', variant: 'success' });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;

  const reminderIdRef = useRef(2);

  const colors = {
    background: '#f8f9ff',
    card: '#ffffff',
    text: '#1a1a2e',
    muted: '#6b7280',
    border: '#e5e7eb',
    soft: '#f3f4f6',
    primary: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444',
    indigoSoft: '#eef2ff',
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    let isMounted = true;
    const loadReminders = async () => {
      try {
        const raw = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        if (!raw || !isMounted) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReminders(parsed);
          const nextId = parsed.reduce((max, item) => {
            const match = String(item.id || '').match(/rem-(\d+)/);
            const value = match ? Number(match[1]) : 0;
            return Number.isNaN(value) ? max : Math.max(max, value);
          }, 0);
          reminderIdRef.current = Math.max(2, nextId + 1);
        }
      } catch (error) {
        // ignore storage errors
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    };

    loadReminders();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, [isHydrated, reminders]);

  const showNotice = useCallback((messageText, variant) => {
    setNoticeConfig({ message: messageText, variant });
    setNoticeVisible(true);
    noticeOpacity.setValue(0);
    Animated.timing(noticeOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(noticeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setNoticeVisible(false));
    }, 1600);
  }, [noticeOpacity]);

  const getDaySummary = useCallback((type, selectedDays) => {
    if (type === 'todos') return 'Todos los dias';
    if (type === 'fines_semana') return 'Sabado y domingo';
    if (
      selectedDays.length === WEEKDAYS.length
      && WEEKDAYS.every((day) => selectedDays.includes(day))
    ) {
      return 'Lunes a viernes';
    }
    if (!selectedDays.length) return 'Sin dias seleccionados';
    const mapLabel = {
      lun: 'Lun',
      mar: 'Mar',
      mie: 'Mie',
      jue: 'Jue',
      vie: 'Vie',
      sab: 'Sab',
      dom: 'Dom',
    };
    return selectedDays.map((day) => mapLabel[day]).join(', ');
  }, []);

  const formatTimeLabel = useCallback((value) => {
    if (!value || !value.includes(':')) return value || '';
    const [rawHours, rawMinutes] = value.split(':').map((part) => Number(part));
    if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) return value;
    const period = rawHours >= 12 ? 'PM' : 'AM';
    const displayHour = rawHours % 12 === 0 ? 12 : rawHours % 12;
    return `${displayHour}:${String(rawMinutes).padStart(2, '0')} ${period}`;
  }, []);

  const editingReminder = useMemo(
    () => reminders.find((reminder) => reminder.id === editingId) || null,
    [editingId, reminders],
  );

  const editingIndex = useMemo(() => {
    if (!editingId) return -1;
    return reminders.findIndex((reminder) => reminder.id === editingId);
  }, [editingId, reminders]);

  const confirmLabel = useMemo(() => {
    if (!confirmTarget) return '';
    const titleValue = (confirmTarget.title || '').trim();
    if (titleValue) return titleValue;
    const index = reminders.findIndex((reminder) => reminder.id === confirmTarget.id);
    return index >= 0 ? `Recordatorio ${index + 1}` : 'este recordatorio';
  }, [confirmTarget, reminders]);

  const baseConfig = editingReminder || DEFAULT_CONFIG;

  const isDirty = useMemo(() => {
    const baseDays = baseConfig.days || [];
    const baseTitle = (baseConfig.title || '').trim();
    const nextTitle = title.trim();
    const sameDays = baseDays.length === days.length
      && baseDays.every((day) => days.includes(day));
    return !(
      baseTitle === nextTitle
      && baseConfig.time === time
      && sameDays
      && baseConfig.selectionType === selectionType
      && baseConfig.active === active
      && baseConfig.pushEnabled === pushEnabled
      && baseConfig.message === message
    );
  }, [active, baseConfig, days, message, pushEnabled, selectionType, time, title]);

  const handleToggleActive = useCallback((reminderId) => {
    setReminders((prev) => prev.map((reminder) => {
      if (reminder.id !== reminderId) return reminder;
      const nextActive = !reminder.active;
      if (reminderId === editingId) {
        setActive(nextActive);
      }
      showNotice(`Recordatorio ${nextActive ? 'activado' : 'desactivado'}.`, 'success');
      return { ...reminder, active: nextActive };
    }));
  }, [editingId, showNotice]);

  const resetForm = useCallback(() => {
    setTitle(DEFAULT_CONFIG.title);
    setTime(DEFAULT_CONFIG.time);
    setDays([...DEFAULT_CONFIG.days]);
    setSelectionType(DEFAULT_CONFIG.selectionType);
    setActive(DEFAULT_CONFIG.active);
    setPushEnabled(DEFAULT_CONFIG.pushEnabled);
    setMessage(DEFAULT_CONFIG.message);
    setSelectedPreset('custom');
    setEditingId(null);
  }, []);

  const handleTypeChange = useCallback((nextType) => {
    setSelectionType(nextType);
    if (nextType === 'todos') {
      setDays(ALL_DAYS);
    } else if (nextType === 'fines_semana') {
      setDays(WEEKEND);
    } else if (!days.length) {
      setDays(['lun']);
    }
    setSelectedPreset('custom');
  }, [days.length]);

  const handleTimeChange = useCallback((nextTime) => {
    setTime(nextTime);
    setSelectedPreset('custom');
  }, []);

  const handleTitleChange = useCallback((value) => {
    setTitle(value);
    setSelectedPreset('custom');
  }, []);

  const handleMessageChange = useCallback((value) => {
    if (value.length <= MESSAGE_LIMIT) {
      setMessage(value);
      setSelectedPreset('custom');
    }
  }, []);

  const handleEditReminder = useCallback((reminder) => {
    setTitle(reminder.title || '');
    setTime(reminder.time);
    setDays([...reminder.days]);
    setSelectionType(reminder.selectionType);
    setActive(reminder.active);
    setPushEnabled(reminder.pushEnabled);
    setMessage(reminder.message);
    setSelectedPreset('custom');
    setEditingId(reminder.id);
  }, []);

  const handleRequestDelete = useCallback((reminder) => {
    setConfirmTarget(reminder);
    setConfirmVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmTarget) return;
    setReminders((prev) => prev.filter((reminder) => reminder.id !== confirmTarget.id));
    if (confirmTarget.id === editingId) {
      resetForm();
    }
    setConfirmVisible(false);
    setConfirmTarget(null);
    showNotice('Recordatorio eliminado.', 'success');
  }, [confirmTarget, editingId, resetForm, showNotice]);

  const handleCancelDelete = useCallback(() => {
    setConfirmVisible(false);
    setConfirmTarget(null);
  }, []);

  const createReminderId = useCallback(() => {
    const next = reminderIdRef.current;
    reminderIdRef.current += 1;
    return `rem-${next}`;
  }, []);

  const handleApplyPreset = useCallback((preset) => {
    if (preset.id === 'custom') {
      setSelectedPreset('custom');
      return;
    }
    setTime(preset.time);
    setSelectionType(preset.type);
    setDays(ALL_DAYS);
    setSelectedPreset(preset.id);
    showNotice('Preset aplicado.', 'success');
  }, [showNotice]);

  const handleSave = useCallback(() => {
    const timeValid = /^\d{2}:\d{2}$/.test(time);
    if (!timeValid) {
      showNotice('Hora invalida.', 'error');
      return;
    }
    if (!days.length) {
      showNotice('Selecciona al menos un dia.', 'error');
      return;
    }
    if (message.length > MESSAGE_LIMIT) {
      showNotice('El mensaje supera los 100 caracteres.', 'error');
      return;
    }

    const payload = {
      title: title.trim(),
      time,
      days: [...days],
      selectionType,
      active,
      pushEnabled,
      message,
    };

    if (editingId) {
      setReminders((prev) => prev.map((reminder) => (
        reminder.id === editingId ? { ...reminder, ...payload } : reminder
      )));
      showNotice('Recordatorio actualizado.', 'success');
    } else {
      setReminders((prev) => [{ id: createReminderId(), ...payload }, ...prev]);
      showNotice('Recordatorio guardado.', 'success');
    }

    resetForm();
  }, [active, createReminderId, days, editingId, message, pushEnabled, resetForm, selectionType, showNotice, time, title]);

  const gridWidth = isLandscape ? '48%' : '100%';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Recordatorios</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 30 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.reminderList}>
            {reminders.map((reminder, index) => (
              <View
                key={reminder.id}
                style={[styles.activeCard, { backgroundColor: colors.indigoSoft }]}
              >
                <View style={styles.activeRow}>
                  <View style={styles.activeIconWrap}>
                    <Feather name="bell" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activeTitle, { color: colors.text }]}>
                      {reminder.title?.trim() ? reminder.title.trim() : `Recordatorio ${index + 1}`}
                    </Text>
                    <Text style={[styles.activeText, { color: colors.muted }]}>
                      Hora {formatTimeLabel(reminder.time)}
                    </Text>
                    <Text style={[styles.activeText, { color: colors.muted }]}>
                      {getDaySummary(reminder.selectionType, reminder.days)}
                    </Text>
                  </View>
                  <Switch
                    value={reminder.active}
                    onValueChange={() => handleToggleActive(reminder.id)}
                    trackColor={{ false: '#cbd5f5', true: '#c7d2fe' }}
                    thumbColor={reminder.active ? '#4f46e5' : '#f1f5f9'}
                  />
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditReminder(reminder)}
                    activeOpacity={0.85}
                  >
                    <Feather name="edit" size={14} color={colors.primary} />
                    <Text style={[styles.editText, { color: colors.primary }]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRequestDelete(reminder)}
                    activeOpacity={0.85}
                  >
                    <Feather name="trash-2" size={14} color={colors.danger} />
                    <Text style={[styles.deleteText, { color: colors.danger }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {editingReminder ? `Editar recordatorio ${editingIndex + 1}` : 'Nuevo recordatorio'}
              </Text>
              {editingReminder ? (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={resetForm}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.clearText, { color: colors.primary }]}>Nuevo ></Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.inputBlock}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Titulo del recordatorio</Text>
              <TextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Ej: Leer por la noche"
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
            <TimePickerComponent value={time} onChange={handleTimeChange} colors={colors} fontScale={1} />
            <DaySelector
              selectionType={selectionType}
              selectedDays={days}
              onTypeChange={handleTypeChange}
              onDaysChange={setDays}
              colors={colors}
              fontScale={1}
            />
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>Enviar notificacion push</Text>
                <Text style={[styles.toggleDesc, { color: colors.muted }]}>Recibe notificaciones en tu dispositivo</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(value) => {
                  setPushEnabled(value);
                  setSelectedPreset('custom');
                }}
                trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                thumbColor={pushEnabled ? '#4f46e5' : '#f9fafb'}
              />
            </View>
            <View style={styles.inputBlock}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mensaje personalizado (opcional)</Text>
              <TextInput
                value={message}
                onChangeText={handleMessageChange}
                placeholder="Ej: Es hora de leer..."
                placeholderTextColor={colors.muted}
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              />
              <Text style={[styles.counter, { color: colors.muted }]}>
                {MESSAGE_LIMIT - message.length} caracteres restantes
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: isDirty ? colors.primary : '#cbd5f5' }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!isDirty}
            >
              <Text style={styles.saveText}>
                {editingReminder ? 'Guardar cambios' : 'Guardar recordatorio'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Presets rapidos</Text>
            <View style={styles.presetGrid}>
              {PRESETS.map((preset) => (
                <View key={preset.id} style={{ width: gridWidth }}>
                  <PresetButton
                    label={preset.label}
                    onPress={() => handleApplyPreset(preset)}
                    isSelected={selectedPreset === preset.id}
                    fontScale={1}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <Modal transparent visible={confirmVisible} animationType="none">
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmEmoji}>🗑️</Text>
            <Text style={styles.confirmTitle}>Eliminar recordatorio</Text>
            <Text style={styles.confirmText}>
              Esta accion no se puede deshacer. ¿Deseas eliminar "{confirmLabel}"?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmBtnSecondary}
                onPress={handleCancelDelete}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtnDanger}
                onPress={handleConfirmDelete}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnDangerText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {noticeVisible ? (
        <View style={styles.noticeBackdrop}>
          <Animated.View
            style={[
              styles.noticeCard,
              {
                opacity: noticeOpacity,
                backgroundColor:
                  noticeConfig.variant === 'error' ? colors.danger : colors.success,
              },
            ]}
          >
            <Text style={styles.noticeText}>{noticeConfig.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#1a1a2e',
  },
  scrollContent: {
    gap: 20,
  },
  reminderList: {
    gap: 16,
  },
  activeCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  activeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeText: {
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontWeight: '700',
    fontSize: 12,
  },
  deleteBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 12,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  clearText: {
    fontWeight: '700',
    fontSize: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  inputBlock: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  counter: {
    fontSize: 11,
    textAlign: 'right',
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  noticeBackdrop: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  confirmBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  confirmCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '94%',
    paddingHorizontal: 22,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  confirmEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4f46e5',
  },
  confirmText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  confirmBtnSecondary: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnSecondaryText: {
    color: '#6b7280',
    fontWeight: '700',
  },
  confirmBtnDanger: {
    flex: 1,
    backgroundColor: '#be123c',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnDangerText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  noticeCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: '70%',
    alignItems: 'center',
  },
  noticeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
