import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { useLibros } from '../context/LibrosContext';

const EMPTY_FORM = {
  titulo: '',
  autor: '',
  genero: '',
  anio: '',
  paginas: '',
  sinopsis: '',
  portada: '',
};

const PLACEHOLDER_PORTADA = 'https://placehold.co/200x300/png?text=Libro';
const VALID_EXTENSIONS = ['pdf', 'epub'];

export default function AgregarLibroScreen({ route, navigation }) {
  const params = route.params ?? {};
  const modoEdicion = params.modoEdicion === true;
  const libroRecibido = params.libro ?? null;
  const libroIdRecibido = params.libroId ?? null;
  const { libros, addLibro, updateLibro, generateLibroId } = useLibros();

  const [form, setForm] = useState(EMPTY_FORM);
  const [busqueda, setBusqueda] = useState('');
  const [archivoInfo, setArchivoInfo] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [noticeConfig, setNoticeConfig] = useState({
    title: '',
    message: '',
    emoji: '',
    variant: 'info',
  });
  const noticeTimer = useRef(null);
  const submitTimer = useRef(null);
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const libroActual = useMemo(() => {
    if (libroIdRecibido) {
      return libros.find((item) => item.id === libroIdRecibido) ?? libroRecibido;
    }
    return libroRecibido;
  }, [libroIdRecibido, libroRecibido, libros]);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    navigation.setOptions({ title: modoEdicion ? 'Editar Libro' : 'Agregar Libro' });

    if (modoEdicion && libroActual) {
      setForm({
        titulo: libroActual.titulo ?? '',
        autor: libroActual.autor ?? '',
        genero: libroActual.genero ?? '',
        anio: String(libroActual.anio ?? ''),
        paginas: String(libroActual.paginas ?? ''),
        sinopsis: libroActual.sinopsis ?? '',
        portada: libroActual.portada ?? '',
      });
      if (libroActual.rutaArchivo) {
        setArchivoInfo({
          uri: libroActual.rutaArchivo,
          nombre: libroActual.titulo ?? 'Archivo cargado',
          extension: getFileExtension(libroActual.rutaArchivo),
          paginas: libroActual.paginas ?? '',
        });
      }
    }
  }, [getFileExtension, modoEdicion, libroActual, navigation]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
      if (submitTimer.current) {
        clearTimeout(submitTimer.current);
      }
    };
  }, []);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

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

    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }
    const durationMs = config.durationMs ?? 2600;
    noticeTimer.current = setTimeout(() => {
      Animated.timing(noticeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setNoticeVisible(false));
    }, durationMs);
  }, [noticeOpacity, noticeScale]);

  const handleBuscar = useCallback(() => {
    showNotice({
      title: 'Próximamente',
      message: 'Búsqueda con Google Books en camino',
      emoji: '🔍✨',
      variant: 'info',
    });
  }, [showNotice]);

  const requestGalleryPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }, []);

  const handleSubirPortada = useCallback(async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        showNotice({
          title: 'Permiso requerido',
          message: 'Autoriza el acceso a tu galeria para elegir una portada',
          emoji: '🖼️',
          variant: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.85,
      });

      if (result.canceled) {
        showNotice({
          title: 'Sin cambios',
          message: 'No se selecciono ninguna portada',
          emoji: '⚠️',
          variant: 'warning',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        showNotice({
          title: 'Error al cargar',
          message: 'No se pudo leer la imagen seleccionada',
          emoji: '❌',
          variant: 'warning',
        });
        return;
      }

      setForm((prev) => ({ ...prev, portada: asset.uri }));
      showNotice({
        title: 'Portada lista',
        message: 'Imagen agregada correctamente',
        emoji: '🖼️✅',
        variant: 'success',
        durationMs: 1400,
      });
    } catch (error) {
      showNotice({
        title: 'Error al cargar',
        message: 'No se pudo abrir tu galeria',
        emoji: '❌',
        variant: 'warning',
      });
    }
  }, [requestGalleryPermission, showNotice]);

  const getFileExtension = useCallback((nameOrUri) => {
    if (!nameOrUri) return '';
    const cleaned = nameOrUri.split('?')[0];
    const parts = cleaned.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }, []);

  const getBaseFileName = useCallback((nameOrUri) => {
    if (!nameOrUri) return 'Libro importado';
    const cleaned = nameOrUri.split('?')[0];
    const name = cleaned.split('/').pop() ?? cleaned;
    const withoutExt = name.replace(/\.[^/.]+$/, '');
    return withoutExt.trim() || 'Libro importado';
  }, []);

  const handleDesdeArchivo = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/epub+zip'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        showNotice({
          title: 'Importación cancelada',
          message: 'No se seleccionó ningún archivo',
          emoji: '⚠️',
          variant: 'warning',
        });
        return;
      }

      const asset = result.assets?.[0];
      if (!asset) {
        showNotice({
          title: 'Archivo no encontrado',
          message: 'No se pudo leer el archivo seleccionado',
          emoji: '⚠️',
          variant: 'warning',
        });
        return;
      }

      const extension = getFileExtension(asset.name || asset.uri);
      if (!VALID_EXTENSIONS.includes(extension)) {
        showNotice({
          title: 'Formato no compatible',
          message: 'Selecciona un archivo PDF o EPUB',
          emoji: '📄❌',
          variant: 'warning',
        });
        return;
      }

      const titulo = getBaseFileName(asset.name || asset.uri);

      setArchivoInfo({
        uri: asset.uri,
        nombre: asset.name || titulo,
        extension,
        paginas: '',
      });
      setForm((prev) => ({
        ...prev,
        titulo: prev.titulo.trim() ? prev.titulo : titulo,
        sinopsis: prev.sinopsis.trim()
          ? prev.sinopsis
          : 'Sinopsis pendiente de completar.',
      }));
    } catch (error) {
      showNotice({
        title: 'Error al importar',
        message: 'No pudimos leer el archivo seleccionado',
        emoji: '❌',
        variant: 'warning',
      });
    }
  }, [
    getBaseFileName,
    getFileExtension,
    showNotice,
  ]);

  const handleLimpiarArchivo = useCallback(() => {
    setArchivoInfo(null);
  }, []);

  const normalizeNumber = useCallback((value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return '';
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? '' : parsed;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.titulo.trim() || !form.autor.trim()) {
      showNotice({
        title: 'Campos requeridos',
        message: 'Completa título y autor para continuar',
        emoji: '⚠️',
        variant: 'warning',
      });
      return;
    }

    const libroBase = {
      id: libroActual?.id || libroIdRecibido,
      titulo: form.titulo.trim(),
      autor: form.autor.trim(),
      genero: form.genero.trim(),
      anio: normalizeNumber(form.anio),
      paginas: normalizeNumber(form.paginas),
      sinopsis: form.sinopsis.trim(),
      portada: form.portada.trim() || PLACEHOLDER_PORTADA,
      estado: libroActual?.estado ?? 'Por leer',
      rutaArchivo: archivoInfo?.uri || libroActual?.rutaArchivo,
    };

    if (modoEdicion && (libroActual?.id || libroIdRecibido)) {
      updateLibro(libroBase);
    } else {
      addLibro({
        ...libroBase,
        id: generateLibroId ? generateLibroId() : undefined,
      });
    }

    const mensaje = modoEdicion
      ? `Los cambios de "${form.titulo}" fueron guardados correctamente.`
      : `"${form.titulo}" fue agregado a tu biblioteca.`;

    showNotice({
      title: modoEdicion ? 'Cambios guardados' : 'Libro agregado',
      message: mensaje,
      emoji: modoEdicion ? '💾✅' : '✅📚',
      variant: 'success',
      durationMs: 1700,
    });

    if (submitTimer.current) {
      clearTimeout(submitTimer.current);
    }
    submitTimer.current = setTimeout(() => {
      navigation.goBack();
    }, 1900);
  }, [
    addLibro,
    archivoInfo,
    form,
    generateLibroId,
    libroActual,
    libroIdRecibido,
    modoEdicion,
    navigation,
    normalizeNumber,
    showNotice,
    updateLibro,
  ]);

  const hPad = isLandscape ? width * 0.12 : width * 0.05;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Buscador Google Books ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUSCAR EN GOOGLE BOOKS</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Título, autor o ISBN..."
              placeholderTextColor="#aaa"
              value={busqueda}
              onChangeText={setBusqueda}
              returnKeyType="search"
              onSubmitEditing={handleBuscar}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleBuscar} activeOpacity={0.85}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Formulario ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATOS DEL LIBRO</Text>

          <Field
            label="Título *"
            value={form.titulo}
            onChangeText={(v) => handleChange('titulo', v)}
            placeholder="Ej. Cien años de soledad"
          />
          <Field
            label="Autor *"
            value={form.autor}
            onChangeText={(v) => handleChange('autor', v)}
            placeholder="Ej. Gabriel García Márquez"
          />
          <Field
            label="Género"
            value={form.genero}
            onChangeText={(v) => handleChange('genero', v)}
            placeholder="Ej. Realismo mágico"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field
                label="Año"
                value={form.anio}
                onChangeText={(v) => handleChange('anio', v)}
                placeholder="Ej. 1967"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Páginas"
                value={form.paginas}
                onChangeText={(v) => handleChange('paginas', v)}
                placeholder="Ej. 432"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Field
            label="Sinopsis"
            value={form.sinopsis}
            onChangeText={(v) => handleChange('sinopsis', v)}
            placeholder="Breve descripción del libro..."
            multiline
            numberOfLines={4}
          />
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Portada</Text>
            <View style={styles.coverRow}>
              <View style={styles.coverPreview}>
                <Animated.Image
                  source={{ uri: form.portada || PLACEHOLDER_PORTADA }}
                  style={styles.coverPreviewImage}
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity
                style={styles.coverBtn}
                onPress={handleSubirPortada}
                activeOpacity={0.85}
              >
                <Text style={styles.coverBtnText}>➕  Subir portada</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {archivoInfo && (
          <View style={styles.fileCard}>
            <View style={styles.fileRow}>
              <View style={styles.fileIconWrap}>
                <Text style={styles.fileIcon}>📄</Text>
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {archivoInfo.nombre}
                </Text>
                <Text style={styles.fileMeta}>
                  {archivoInfo.extension.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fileClearBtn}
                onPress={handleLimpiarArchivo}
                activeOpacity={0.85}
              >
                <Text style={styles.fileClearText}>Quitar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fileHint}>Archivo cargado. Completa los datos y guarda.</Text>
          </View>
        )}

        {/* ── Botón importar desde archivo ── */}
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={handleDesdeArchivo}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlineText}>📂  Importar desde archivo</Text>
        </TouchableOpacity>

        {/* ── Botón principal ── */}
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>
            {modoEdicion ? '💾  Guardar cambios' : '➕  Agregar libro'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={noticeVisible} animationType="none">
        <View style={styles.noticeBackdrop}>
          <Animated.View
            style={[
              styles.noticeCard,
              styles[`noticeCard_${noticeConfig.variant}`],
              {
                opacity: noticeOpacity,
                transform: [{ scale: noticeScale }],
              },
            ]}
          >
            <Text style={styles.noticeEmoji}>{noticeConfig.emoji}</Text>
            <Text style={styles.noticeTitle}>{noticeConfig.title}</Text>
            <Text style={styles.noticeText}>{noticeConfig.message}</Text>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ── Componente auxiliar para campos del formulario ──
function Field({ label, multiline, numberOfLines, ...inputProps }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 24 * (numberOfLines ?? 4), textAlignVertical: 'top' }]}
        placeholderTextColor="#bbb"
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 48,
    gap: 16,
  },
  // Secciones
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: 1,
    marginBottom: 2,
  },
  // Búsqueda
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a2e',
  },
  searchBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontSize: 18,
  },
  // Campos
  fieldContainer: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    backgroundColor: '#f8f9ff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a2e',
  },
  row: {
    flexDirection: 'row',
  },
  coverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverPreview: {
    width: 72,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  coverPreviewImage: {
    width: '100%',
    height: '100%',
  },
  coverBtn: {
    flex: 1,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  coverBtnText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '600',
  },
  fileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIcon: {
    fontSize: 18,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  fileMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  fileClearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  fileClearText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  fileHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  // Botones
  btnPrimary: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  btnOutlineText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  noticeBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    color: '#4f46e5',
  },
  noticeText: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
