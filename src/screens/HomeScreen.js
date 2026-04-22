import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  Animated,
} from 'react-native';
import BookCard from '../components/BookCard';
import { useLibros } from '../context/LibrosContext';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const { libros } = useLibros();
  const [fabPressed, setFabPressed] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 2 : 1;

  const headerAnim = React.useRef(new Animated.Value(0)).current;
  const searchAnim = React.useRef(new Animated.Value(0)).current;
  const listAnim = React.useRef(new Animated.Value(0)).current;
  const fabScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, searchAnim, listAnim]);

  const librosFiltrados = useMemo(() => {
    const texto = query.toLowerCase().trim();
    let result = libros;

    if (texto) {
      result = result.filter(
        (l) =>
          l.titulo.toLowerCase().includes(texto) ||
          l.autor.toLowerCase().includes(texto)
      );
    }

    if (filterOption === 'pendiente') {
      result = result.filter((l) => (l.estado || 'Pendiente por leer') === 'Pendiente por leer');
    }
    if (filterOption === 'leyendo') {
      result = result.filter((l) => l.estado === 'Leyendo');
    }
    if (filterOption === 'terminado') {
      result = result.filter((l) => l.estado === 'Terminado');
    }
    if (filterOption === 'paginas_desc') {
      result = [...result].sort((a, b) => (b.paginas || 0) - (a.paginas || 0));
    }
    if (filterOption === 'paginas_asc') {
      result = [...result].sort((a, b) => (a.paginas || 0) - (b.paginas || 0));
    }

    return result;
  }, [filterOption, libros, query]);

  const filterLabel = useMemo(() => {
    switch (filterOption) {
      case 'pendiente':
        return 'Pendiente por leer';
      case 'leyendo':
        return 'Leyendo';
      case 'terminado':
        return 'Terminado';
      case 'paginas_desc':
        return 'Mayor páginas';
      case 'paginas_asc':
        return 'Menor páginas';
      default:
        return 'Todos';
    }
  }, [filterOption]);


  const handlePressLibro = useCallback(
    (libro) => {
      navigation.navigate('LibroDetalle', { libroId: libro.id });
    },
    [navigation]
  );

  const handleAgregar = useCallback(() => {
    navigation.navigate('AgregarLibro');
  }, [navigation]);

  const handleAbrirIA = useCallback(() => {
    navigation.navigate('AsistenteIA');
  }, [navigation]);

  const handleFabPressIn = useCallback(() => {
    setFabPressed(true);
    Animated.spring(fabScale, {
      toValue: 0.96,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  const handleFabPressOut = useCallback(() => {
    setFabPressed(false);
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  const renderItem = useCallback(
    ({ item }) => (
      <BookCard book={item} onPress={() => handlePressLibro(item)} />
    ),
    [handlePressLibro]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9ff" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { paddingHorizontal: width * 0.05 },
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Mi Biblioteca</Text>
        <Text style={styles.headerSubtitle}>
          {librosFiltrados.length} libro{librosFiltrados.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {/* Barra de búsqueda */}
      <Animated.View
        style={[
          styles.searchContainer,
          { marginHorizontal: width * 0.04 },
          {
            opacity: searchAnim,
            transform: [
              {
                translateY: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o autor..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </Animated.View>

      <View style={[styles.filterRow, { marginHorizontal: width * 0.04 }]}
      >
        <Text style={styles.filterLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={styles.filterPill}
          onPress={() => setFilterVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.filterPillText}>{filterLabel}</Text>
          <Text style={styles.filterPillIcon}>▾</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.iaShortcut, { marginHorizontal: width * 0.04 }]}
        onPress={handleAbrirIA}
        activeOpacity={0.9}
      >
        <Text style={styles.iaShortcutTitle}>Asistente IA</Text>
        <Text style={styles.iaShortcutText}>
          Recibe recomendaciones dinamicas segun lo que quieras leer
        </Text>
      </TouchableOpacity>

      {/* Lista de libros */}
      <Animated.View
        style={{
          flex: 1,
          opacity: listAnim,
          transform: [
            {
              translateY: listAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        }}
      >
        <FlatList
          data={librosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          key={numColumns}
          numColumns={numColumns}
          removeClippedSubviews={true}
          initialNumToRender={5}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No se encontraron libros</Text>
              {!!query.trim() && (
                <Text style={styles.emptyHint}>
                  No hay resultados para "{query.trim()}"
                </Text>
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Botón flotante "+" */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          style={[styles.fabTouch, fabPressed && styles.fabPressed]}
          onPress={handleAgregar}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {filterVisible && (
        <View style={styles.filterBackdrop}>
          <TouchableOpacity
            style={styles.filterOverlay}
            onPress={() => setFilterVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.filterCard}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'pendiente', label: 'Pendiente por leer' },
              { key: 'leyendo', label: 'Leyendo' },
              { key: 'terminado', label: 'Terminado' },
              { key: 'paginas_desc', label: 'Mayor páginas' },
              { key: 'paginas_asc', label: 'Menor páginas' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.filterOption}
                onPress={() => {
                  setFilterOption(option.key);
                  setFilterVisible(false);
                }}
              >
                <Text style={styles.filterOptionText}>{option.label}</Text>
                {filterOption === option.key && (
                  <Text style={styles.filterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f8f9ff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterPillText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  filterPillIcon: {
    fontSize: 12,
    color: '#4f46e5',
  },
  iaShortcut: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  iaShortcutTitle: {
    color: '#1e3a8a',
    fontWeight: '800',
    fontSize: 15,
  },
  iaShortcutText: {
    color: '#334155',
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyHint: {
    fontSize: 13,
    color: '#8b91a1',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 8,
  },
  fabTouch: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    backgroundColor: '#4338ca',
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    lineHeight: 34,
    fontWeight: '300',
  },
  filterBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    marginTop: 180,
    marginRight: 18,
    borderRadius: 14,
    paddingVertical: 10,
    width: 210,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterOptionText: {
    fontSize: 13,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '700',
  },
});
