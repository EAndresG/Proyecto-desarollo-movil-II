import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useWindowDimensions,
} from 'react-native';

export default function LibroDetalleScreen({ route, navigation }) {
  const { libro } = route.params;
  const { width, height } = useWindowDimensions();

  // Poner el título del libro en el header
  useEffect(() => {
    navigation.setOptions({ title: libro.titulo });
  }, [navigation, libro.titulo]);

  const handleEditar = useCallback(() => {
    navigation.navigate('AgregarLibro', { libro, modoEdicion: true });
  }, [navigation, libro]);

  const handleLeer = useCallback(() => {
    Alert.alert('Próximamente', 'Función disponible próximamente');
  }, []);

  const isLandscape = width > height;
  const coverHeight = height * 0.38;

  return (
    <View style={[styles.container, isLandscape && styles.containerRow]}>
      {/* Portada: fija arriba (portrait) o lateral izquierda (landscape) */}
      <View
        style={
          isLandscape
            ? styles.coverContainerLandscape
            : [styles.coverContainer, { height: coverHeight }]
        }
      >
        <Image
          source={{ uri: libro.portada }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
      </View>

      {/* Contenido scrolleable */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isLandscape ? width * 0.04 : width * 0.06 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Título y autor */}
        <Text style={styles.titulo}>{libro.titulo}</Text>
        <Text style={styles.autor}>{libro.autor}</Text>

        {/* Badges de metadatos */}
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{libro.genero}</Text>
          </View>
          <View style={[styles.badge, styles.badgeSecondary]}>
            <Text style={[styles.badgeText, styles.badgeTextSecondary]}>
              {libro.anio}
            </Text>
          </View>
          <View style={[styles.badge, styles.badgeSecondary]}>
            <Text style={[styles.badgeText, styles.badgeTextSecondary]}>
              {libro.paginas} págs.
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sinopsis */}
        <Text style={styles.sectionTitle}>Sinopsis</Text>
        <Text style={styles.sinopsis}>{libro.sinopsis}</Text>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={handleEditar}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>✏️  Editar libro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={handleLeer}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>📖  Leer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  containerRow: {
    flexDirection: 'row',
  },
  // Portada
  coverContainerLandscape: {
    width: '42%',
    height: '100%',
    overflow: 'hidden',
  },
  coverContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.18)',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 48,
  },
  // Texto
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    lineHeight: 34,
    marginBottom: 6,
  },
  autor: {
    fontSize: 15,
    color: '#666',
    marginBottom: 16,
  },
  // Badges
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  badgeSecondary: {
    backgroundColor: '#f3f4f6',
  },
  badgeTextSecondary: {
    color: '#555',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sinopsis: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 32,
  },
  // Botones
  buttonsContainer: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 15,
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
  btnSecondary: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  btnSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
