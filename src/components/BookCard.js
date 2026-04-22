import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

const BookCard = React.memo(({ book, onPress }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const cardWidth = isLandscape ? (width / 2) - 24 : width - 32;
  const isImported = Boolean(book.rutaArchivo);
  const metaParts = [];

  if (book.anio) {
    metaParts.push(book.anio);
  }
  if (book.paginas) {
    metaParts.push(`${book.paginas} págs.`);
  }
  const metaText = metaParts.length > 0 ? metaParts.join(' · ') : 'Sin datos';

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.85}  
    >
      <Image
        source={{ uri: book.portada }}
        style={styles.cover}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.titulo}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.autor}
        </Text>
        <View style={styles.badgeRow}>
          {!!book.genero && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{book.genero}</Text>
            </View>
          )}
          {isImported && (
            <View style={styles.importBadge}>
              <Text style={styles.importBadgeText}>📎 Importado</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta}>{metaText}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default BookCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    alignSelf: 'center',
    // Shadow iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    // Shadow Android
    elevation: 4,
  },
  cover: {
    width: 80,
    height: 116,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    lineHeight: 22,
  },
  author: {
    fontSize: 13,
    color: '#555',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  importBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  importBadgeText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
