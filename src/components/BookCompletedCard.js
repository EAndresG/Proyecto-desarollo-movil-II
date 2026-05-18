import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function BookCompletedCard({ book, index, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.index}>{index}.</Text>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{book.titulo}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.autor}</Text>
        <View style={styles.metaRow}>
          <View style={styles.genrePill}>
            <Text style={styles.genreText}>{book.genero}</Text>
          </View>
          <Text style={styles.pages}>{book.paginas} pags</Text>
        </View>
      </View>
      <Text style={styles.date}>{book.fechaLabel}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  index: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4f46e5',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  author: {
    fontSize: 12,
    color: '#6b7280',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  genrePill: {
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  genreText: {
    fontSize: 11,
    color: '#4f46e5',
    fontWeight: '700',
  },
  pages: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
});
