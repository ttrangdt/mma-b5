import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({ onSeed }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Contact Management</Text>
        <Text style={styles.subtitle}>SQLite CRUD & Performance (Lab MMA301)</Text>
      </View>
      <TouchableOpacity style={styles.seedBtn} onPress={onSeed}>
        <Ionicons name="flash-outline" size={15} color="#ffffff" />
        <Text style={styles.seedText}>Seed DB</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4338ca',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 12,
    color: '#c7d2fe',
    marginTop: 2
  },
  seedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  seedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  }
});
