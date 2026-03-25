import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const EMPTY_FORM = {
  titulo: '',
  autor: '',
  genero: '',
  anio: '',
  paginas: '',
  sinopsis: '',
  portada: '',
};

export default function AgregarLibroScreen({ route, navigation }) {
  const params = route.params ?? {};
  const modoEdicion = params.modoEdicion === true;
  const libroRecibido = params.libro ?? null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [busqueda, setBusqueda] = useState('');
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    navigation.setOptions({ title: modoEdicion ? 'Editar Libro' : 'Agregar Libro' });

    if (modoEdicion && libroRecibido) {
      setForm({
        titulo: libroRecibido.titulo ?? '',
        autor: libroRecibido.autor ?? '',
        genero: libroRecibido.genero ?? '',
        anio: String(libroRecibido.anio ?? ''),
        paginas: String(libroRecibido.paginas ?? ''),
        sinopsis: libroRecibido.sinopsis ?? '',
        portada: libroRecibido.portada ?? '',
      });
    }
  }, [modoEdicion, libroRecibido, navigation]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBuscar = useCallback(() => {
    Alert.alert('Próximamente', 'Búsqueda con Google Books próximamente');
  }, []);

  const handleDesdeArchivo = useCallback(() => {
    Alert.alert('Próximamente', 'Importar desde archivo próximamente');
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.titulo.trim() || !form.autor.trim()) {
      Alert.alert('Campos requeridos', 'El título y el autor son obligatorios.');
      return;
    }

    const mensaje = modoEdicion
      ? `Los cambios de "${form.titulo}" fueron guardados correctamente.`
      : `"${form.titulo}" fue agregado a tu biblioteca.`;

    Alert.alert(modoEdicion ? 'Cambios guardados' : 'Libro agregado', mensaje, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }, [form, modoEdicion, navigation]);

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
          <Field
            label="URL de portada"
            value={form.portada}
            onChangeText={(v) => handleChange('portada', v)}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

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
});
