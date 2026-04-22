import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const INITIAL_LIBROS = [
  {
    id: '1',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    genero: 'Realismo mágico',
    anio: 1967,
    paginas: 432,
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
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
    estado: 'Pendiente por leer',
    sinopsis:
      'En un planeta desértico con la especia más valiosa del universo, un joven asume su destino épico.',
    portada: 'https://covers.openlibrary.org/b/id/9264645-L.jpg',
  },
];

const LibrosContext = createContext(null);

export function LibrosProvider({ children }) {
  const [libros, setLibros] = useState(() => INITIAL_LIBROS);
  const [lastPageById, setLastPageById] = useState({});

  const generateLibroId = useCallback(() => {
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    return `lib_${Date.now()}_${randomSuffix}`;
  }, []);

  const addLibroFromFile = useCallback((nuevoLibro) => {
    setLibros((prev) => [
      {
        ...nuevoLibro,
        id: nuevoLibro.id ?? generateLibroId(),
      },
      ...prev,
    ]);
  }, [generateLibroId]);

  const addLibro = useCallback((nuevoLibro) => {
    setLibros((prev) => [
      {
        ...nuevoLibro,
        id: nuevoLibro.id ?? generateLibroId(),
      },
      ...prev,
    ]);
  }, [generateLibroId]);

  const updateLibro = useCallback((libroActualizado) => {
    setLibros((prev) => prev.map((libro) => (
      libro.id === libroActualizado.id ? { ...libro, ...libroActualizado } : libro
    )));
  }, []);

  const deleteLibro = useCallback((libroId) => {
    if (!libroId) return;
    setLibros((prev) => prev.filter((libro) => libro.id !== libroId));
  }, []);

  const setLastPage = useCallback((libroId, page) => {
    if (!libroId || !page) return;
    setLastPageById((prev) => ({
      ...prev,
      [libroId]: page,
    }));
  }, []);

  const value = useMemo(() => ({
    libros,
    addLibroFromFile,
    addLibro,
    updateLibro,
    deleteLibro,
    lastPageById,
    setLastPage,
    generateLibroId,
  }), [
    libros,
    addLibroFromFile,
    addLibro,
    updateLibro,
    deleteLibro,
    lastPageById,
    setLastPage,
    generateLibroId,
  ]);

  return (
    <LibrosContext.Provider value={value}>
      {children}
    </LibrosContext.Provider>
  );
}

export function useLibros() {
  const context = useContext(LibrosContext);
  if (!context) {
    throw new Error('useLibros debe usarse dentro de LibrosProvider');
  }
  return context;
}
