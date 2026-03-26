import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Modal,
} from 'react-native';

export default function LibroDetalleScreen({ route, navigation }) {
  const { libro } = route.params;
  const { width, height } = useWindowDimensions();
  const [coverVisible, setCoverVisible] = useState(false);
  const [noticeVisible, setNoticeVisible] = useState(false);
  const noticeTimer = useRef(null);

  const coverFade = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.96)).current;
  const editScale = useRef(new Animated.Value(1)).current;
  const readScale = useRef(new Animated.Value(1)).current;
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  const noticeScale = useRef(new Animated.Value(0.96)).current;

  // Poner el título del libro en el header
  useEffect(() => {
    navigation.setOptions({ title: libro.titulo });
  }, [navigation, libro.titulo]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(coverFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, [coverFade, contentAnim]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    };
  }, []);


  const handleEditar = useCallback(() => {
    navigation.navigate('AgregarLibro', { libro, modoEdicion: true });
  }, [navigation, libro]);

  const handleLeer = useCallback(() => {
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
    noticeTimer.current = setTimeout(() => {
      Animated.timing(noticeOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setNoticeVisible(false));
    }, 1600);
  }, []);

  const openCover = useCallback(() => {
    setCoverVisible(true);
    modalOpacity.setValue(0);
    modalScale.setValue(0.96);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalOpacity, modalScale]);

  const closeCover = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.96,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setCoverVisible(false));
  }, [modalOpacity, modalScale]);

  const handlePressIn = useCallback((scaleRef) => {
    Animated.spring(scaleRef, {
      toValue: 0.97,
      friction: 7,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressOut = useCallback((scaleRef) => {
    Animated.spring(scaleRef, {
      toValue: 1,
      friction: 6,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, []);

  const isLandscape = width > height;
  const coverHeight = height * 0.38;

  return (
    <View style={[styles.container, isLandscape && styles.containerRow]}>
      {/* Portada: fija arriba (portrait) o lateral izquierda (landscape) */}
      <TouchableOpacity
        style={
          isLandscape
            ? styles.coverContainerLandscape
            : [styles.coverContainer, { height: coverHeight }]
        }
        activeOpacity={0.9}
        onPress={openCover}
      >
        <Animated.Image
          source={{ uri: libro.portada }}
          style={[styles.coverImage, { opacity: coverFade }]}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
        <View style={styles.coverHint}>
          <Text style={styles.coverHintText}>Toca para ver portada completa</Text>
        </View>
      </TouchableOpacity>

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
        <Animated.Text
          style={[
            styles.titulo,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {libro.titulo}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.autor,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {libro.autor}
        </Animated.Text>

        {/* Badges de metadatos */}
        <Animated.View
          style={[
            styles.metaRow,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
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
        </Animated.View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sinopsis */}
        <Animated.Text
          style={[
            styles.sectionTitle,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Sinopsis
        </Animated.Text>
        <Animated.Text
          style={[
            styles.sinopsis,
            {
              opacity: contentAnim,
              transform: [
                {
                  translateY: contentAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {libro.sinopsis}
        </Animated.Text>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: editScale }] }}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleEditar}
              onPressIn={() => handlePressIn(editScale)}
              onPressOut={() => handlePressOut(editScale)}
              activeOpacity={0.9}
            >
              <Text style={styles.btnPrimaryText}>✏️  Editar libro</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: readScale }] }}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleLeer}
              onPressIn={() => handlePressIn(readScale)}
              onPressOut={() => handlePressOut(readScale)}
              activeOpacity={0.9}
            >
              <Text style={styles.btnSecondaryText}>📖  Leer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <Modal transparent visible={coverVisible} animationType="none">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeCover}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <Image
              source={{ uri: libro.portada }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={noticeVisible} animationType="none">
        <View style={styles.noticeBackdrop}>
          <Animated.View
            style={[
              styles.noticeCard,
              {
                opacity: noticeOpacity,
                transform: [{ scale: noticeScale }],
              },
            ]}
          >
            <Text style={styles.noticeEmoji}>✨📖</Text>
            <Text style={styles.noticeTitle}>Próximamente</Text>
            <Text style={styles.noticeText}>
              Estamos preparando esta función para ti
            </Text>
          </Animated.View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(26,26,46,0.12)',
  },
  coverHint: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(17,24,39,0.65)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coverHintText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
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
    marginBottom: 22,
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
    marginBottom: 34,
  },
  // Botones
  buttonsContainer: {
    gap: 14,
    marginBottom: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    height: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  noticeBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 180,
  },
  noticeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    fontSize: 20,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  noticeText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
