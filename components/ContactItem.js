import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactItem({ item, onEdit, onDelete }) {
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=4f46e5&color=ffffff&bold=true&size=128`;

  return (
    <View style={styles.card}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={13} color="#64748b" />
          <Text style={styles.subText}>{item.phone}</Text>
        </View>
        {item.email ? (
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={13} color="#64748b" />
            <Text style={styles.subText}>{item.email}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => onEdit(item)}>
          <Ionicons name="create-outline" size={17} color="#0284c7" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => onDelete(item.id, item.name)}>
          <Ionicons name="trash-outline" size={17} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e7ff'
  },
  details: {
    flex: 1,
    marginLeft: 12
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4
  },
  subText: {
    fontSize: 13,
    color: '#64748b'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editBtn: {
    backgroundColor: '#e0f2fe'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2'
  }
});
