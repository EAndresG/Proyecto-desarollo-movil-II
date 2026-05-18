import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import ProfileInfoCard from '../components/ProfileInfoCard';
import StatCard from '../components/StatCard';
import ConfigOption from '../components/ConfigOption';

const BIO_LIMIT = 150;
const NAME_LIMIT = 50;

const FONT_SCALES = {
  small: 0.92,
  normal: 1,
  large: 1.08,
};

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [name, setName] = useState(user?.nombre || 'Juan Pérez');
  const [email] = useState(user?.email || 'juan@example.com');
  const [bio, setBio] = useState('Amante de la lectura y las historias');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editBio, setEditBio] = useState(bio);

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeConfig, setNoticeConfig] = useState({
    message: '',
    variant: 'success',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;

  const fontScale = FONT_SCALES[fontSize] ?? 1;

  const colors = useMemo(() => {
    if (darkMode) {
      return {
        background: '#0f172a',
        card: '#111827',
        text: '#f8fafc',
        muted: '#94a3b8',
        border: '#1f2937',
        primary: '#4f46e5',
        avatarBg: '#1f2937',
        avatarIcon: '#f8fafc',
        danger: '#ef4444',
        success: '#10b981',
        soft: '#1f2937',
      };
    }
    return {
      background: '#f8f9ff',
      card: '#ffffff',
      text: '#1a1a2e',
      muted: '#6b7280',
      border: '#e5e7eb',
      primary: '#4f46e5',
      avatarBg: '#e5e7eb',
      avatarIcon: '#ffffff',
      danger: '#ef4444',
      success: '#10b981',
      soft: '#f3f4f6',
    };
  }, [darkMode]);

  const stats = useMemo(
    () => [
      { title: 'Libros leidos', value: '5', icon: 'book-open', color: '#4f46e5' },
      { title: 'Paginas leidas', value: '1,240', icon: 'file-text', color: '#14b8a6' },
      { title: 'Racha actual', value: '7 dias', icon: 'zap', color: '#f97316' },
      { title: 'Genero favorito', value: 'Fantasia', icon: 'star', color: '#a855f7' },
    ],
    []
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const showNotice = useCallback((message, variant) => {
    setNoticeConfig({ message, variant });
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

  const handleEditProfile = useCallback(() => {
    setEditName(name);
    setEditBio(bio);
    setEditVisible(true);
  }, [bio, name]);

  const handleSaveProfile = useCallback(() => {
    const trimmedName = editName.trim();
    const trimmedBio = editBio.trim();

    if (!trimmedName) {
      showNotice('El nombre no puede estar vacio.', 'error');
      return;
    }
    if (trimmedName.length > NAME_LIMIT) {
      showNotice('El nombre supera los 50 caracteres.', 'error');
      return;
    }
    if (trimmedBio.length > BIO_LIMIT) {
      showNotice('La bio supera los 150 caracteres.', 'error');
      return;
    }

    if (trimmedName === name && trimmedBio === bio) {
      setEditVisible(false);
      showNotice('No hay cambios por guardar.', 'success');
      return;
    }

    setName(trimmedName);
    setBio(trimmedBio);
    setEditVisible(false);
    showNotice('Perfil actualizado correctamente.', 'success');
  }, [bio, editBio, editName, name, showNotice]);

  const handleLogout = useCallback(() => {
    setLogoutVisible(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setLogoutVisible(false);
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [logout, navigation]);

  const statPress = useCallback((title, value) => {
    showNotice(`${title}: ${value}`, 'success');
  }, [showNotice]);

  const cardWidth = isLandscape ? '48%' : '48%';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.headerTitle, { color: colors.text, fontSize: 24 * fontScale }]}>
        Mi Perfil
      </Text>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileInfoCard
            name={name}
            email={email}
            bio={bio}
            onEdit={handleEditProfile}
            colors={colors}
            fontScale={fontScale}
          />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
              Estadisticas rapidas
            </Text>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <View key={stat.title} style={{ width: cardWidth }}>
                  <StatCard
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    onPress={() => statPress(stat.title, stat.value)}
                    fontScale={fontScale}
                    colors={colors}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
              Accesos rapidos
            </Text>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.soft }]}
              onPress={() => navigation.navigate('Estadisticas')}
              activeOpacity={0.85}
            >
              <Text style={[styles.quickText, { color: colors.text, fontSize: 14 * fontScale }]}>
                📊 Ver estadisticas completas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.soft }]}
              onPress={() => navigation.navigate('MetasYHabitos')}
              activeOpacity={0.85}
            >
              <Text style={[styles.quickText, { color: colors.text, fontSize: 14 * fontScale }]}>
                🎯 Gestionar metas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.soft }]}
              onPress={() => navigation.navigate('Recordatorios', { from: 'perfil' })}
              activeOpacity={0.85}
            >
              <Text style={[styles.quickText, { color: colors.text, fontSize: 14 * fontScale }]}>
                🔔 Ver recordatorios
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
              Configuracion
            </Text>
            <ConfigOption
              title="Modo oscuro"
              description="Cambia el tema general de la app"
              type="toggle"
              value={darkMode}
              onChange={setDarkMode}
              colors={colors}
              fontScale={fontScale}
            />
            <ConfigOption
              title="Tamaño de fuente"
              description="Ajusta el tamaño de los textos"
              type="selector"
              value={fontSize}
              onChange={setFontSize}
              options={[
                { label: 'Pequeño', value: 'small' },
                { label: 'Normal', value: 'normal' },
                { label: 'Grande', value: 'large' },
              ]}
              colors={colors}
              fontScale={fontScale}
            />
          </View>

          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.danger }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Feather name="log-out" size={16} color="#fff" />
            <Text style={[styles.logoutText, { fontSize: 14 * fontScale }]}
            >
              Cerrar sesion
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      <Modal transparent visible={editVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
              Editar perfil
            </Text>
            <Text style={[styles.modalLabel, { color: colors.muted, fontSize: 12 * fontScale }]}>
              Nombre
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              maxLength={NAME_LIMIT}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nombre"
              placeholderTextColor={colors.muted}
            />
            <Text style={[styles.modalLabel, { color: colors.muted, fontSize: 12 * fontScale }]}>
              Bio
            </Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              maxLength={BIO_LIMIT}
              multiline
              style={[
                styles.textArea,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Cuéntanos sobre ti"
              placeholderTextColor={colors.muted}
            />
            <Text style={[styles.charCount, { color: colors.muted, fontSize: 11 * fontScale }]}>
              {BIO_LIMIT - editBio.length} caracteres restantes
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: colors.text, fontSize: 13 * fontScale }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: '#fff', fontSize: 13 * fontScale }]}
                >
                  Guardar cambios
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 16 * fontScale }]}>
              Cerrar sesion
            </Text>
            <Text style={[styles.modalBody, { color: colors.muted, fontSize: 13 * fontScale }]}>
              ¿Deseas cerrar sesion y volver al login?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setLogoutVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: colors.text, fontSize: 13 * fontScale }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
                onPress={confirmLogout}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: '#fff', fontSize: 13 * fontScale }]}
                >
                  Cerrar sesion
                </Text>
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 12,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickBtn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  quickText: {
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
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
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  modalTitle: {
    fontWeight: '800',
  },
  modalBody: {
    lineHeight: 18,
  },
  modalLabel: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
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
  modalBtnText: {
    fontWeight: '700',
  },
  noticeBackdrop: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: 'center',
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
