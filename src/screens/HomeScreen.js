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

const LIBROS = [
  {
    id: '1',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    genero: 'Realismo mágico',
    anio: 1967,
    paginas: 432,
    sinopsis:
      'La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.',
    portada: 'https://covers.openlibrary.org/b/id/8231432-L.jpg',
  },
  {
    id: '2',
    titulo: '1984',
    autor: 'George Orwell',
    genero: 'Distopía',
    anio: 1949,
    paginas: 328,
    sinopsis:
      'Una sociedad totalitaria controlada por el Gran Hermano donde el pensamiento independiente es un crimen.',
    portada: 'https://covers.openlibrary.org/b/id/8575708-L.jpg',
  },
  {
    id: '3',
    titulo: 'El Principito',
    autor: 'Antoine de Saint-Exupéry',
    genero: 'Fábula',
    anio: 1943,
    paginas: 96,
    sinopsis:
      'Un principito viaja por distintos planetas y reflexiona sobre la vida, el amor y la amistad.',
    portada: 'https://covers.openlibrary.org/b/id/8516558-L.jpg',
  },
  {
    id: '4',
    titulo: 'Don Quijote de la Mancha',
    autor: 'Miguel de Cervantes',
    genero: 'Novela clásica',
    anio: 1605,
    paginas: 863,
    sinopsis:
      'Un hidalgo enloquece leyendo libros de caballerías y sale a vivir aventuras como caballero errante.',
    portada: 'https://covers.openlibrary.org/b/id/9255566-L.jpg',
  },
  {
    id: '5',
    titulo: 'Harry Potter y la piedra filosofal',
    autor: 'J.K. Rowling',
    genero: 'Fantasía',
    anio: 1997,
    paginas: 309,
    sinopsis:
      'Un joven huérfano descubre que es un mago y es admitido en la escuela de magia Hogwarts.',
    portada: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
  },
  {
    id: '6',
    titulo: 'El nombre del viento',
    autor: 'Patrick Rothfuss',
    genero: 'Fantasía épica',
    anio: 2007,
    paginas: 662,
    sinopsis:
      'Kvothe narra su propia leyenda: cómo pasó de ser un niño prodigio a convertirse en el mago más temido.',
    portada: 'https://covers.openlibrary.org/b/id/8479041-L.jpg',
  },
  {
    id: '7',
    titulo: 'Dune',
    autor: 'Frank Herbert',
    genero: 'Ciencia ficción',
    anio: 1965,
    paginas: 688,
    sinopsis:
      'En un planeta desértico con la especia más valiosa del universo, un joven asume su destino épico.',
    portada: 'https://covers.openlibrary.org/b/id/9264645-L.jpg',
  },
];

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
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
    if (!texto) return LIBROS;
    return LIBROS.filter(
      (l) =>
        l.titulo.toLowerCase().includes(texto) ||
        l.autor.toLowerCase().includes(texto)
    );
  }, [query]);

  const handlePressLibro = useCallback(
    (libro) => {
      navigation.navigate('LibroDetalle', { libro });
    },
    [navigation]
  );

  const handleAgregar = useCallback(() => {
    navigation.navigate('AgregarLibro');
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
});
