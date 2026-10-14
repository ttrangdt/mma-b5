import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ContactItem from './components/ContactItem';
import ContactModal from './components/ContactModal';
import {
  initDB,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  seedBatchContacts
} from './database/database';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 1. KHỞI TẠO CƠ SỞ DỮ LIỆU
  useEffect(() => {
    async function setup() {
      await initDB();
      await fetchContacts('');
      setLoading(false);
    }
    setup();
  }, []);

  const fetchContacts = async (query = searchQuery) => {
    const list = await getContacts(query);
    setContacts(list);
  };

  // 2. CREATE & UPDATE (Slide 13 & 15)
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống!');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống!');
      return;
    }

    try {
      if (editingId) {
        await updateContact(editingId, name, phone, email);
        Alert.alert('Thành công', 'Đã cập nhật liên hệ!');
      } else {
        await addContact(name, phone, email);
        Alert.alert('Thành công', 'Đã thêm liên hệ mới vào SQLite!');
      }
      closeModal();
      fetchContacts(searchQuery);
    } catch (err) {
      Alert.alert('Lỗi', err.message);
    }
  };

  // 3. DELETE (Slide 16)
  const handleDelete = (id, contactName) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa "${contactName}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa ngay',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContact(id);
            fetchContacts(searchQuery);
          } catch (err) {
            Alert.alert('Lỗi', err.message);
          }
        }
      }
    ]);
  };

  // 4. TRANSACTION SEED DATA (Slide 20)
  const handleSeed = async () => {
    try {
      await seedBatchContacts();
      await fetchContacts(searchQuery);
      Alert.alert('Thành công', 'Đã thêm 3 bản ghi bằng SQLite Transaction!');
    } catch (err) {
      Alert.alert('Lỗi Transaction', err.message);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setPhone(item.phone);
    setEmail(item.email || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />

      {/* Header */}
      <Header onSeed={handleSeed} />

      {/* Tìm kiếm */}
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchContacts(text);
        }}
        onClear={() => {
          setSearchQuery('');
          fetchContacts('');
        }}
      />

      {/* Thống kê */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          Danh bạ: <Text style={styles.countBold}>{contacts.length}</Text> người
        </Text>
      </View>

      {/* Danh sách */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4338ca" />
          <Text style={styles.loadingText}>Đang tải SQLite...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ContactItem
              item={item}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={54} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có liên hệ nào</Text>
              <Text style={styles.emptySub}>Bấm nút (+) hoặc 'Seed DB' để thêm.</Text>
            </View>
          }
        />
      )}

      {/* FAB thêm mới */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal */}
      <ContactModal
        visible={modalVisible}
        isEditing={!!editingId}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        onSave={handleSave}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  countBar: {
    paddingHorizontal: 20,
    paddingVertical: 4
  },
  countText: {
    fontSize: 12,
    color: '#64748b'
  },
  countBold: {
    fontWeight: '700',
    color: '#4338ca'
  },
  list: {
    paddingBottom: 90
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b'
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4338ca',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6
  }
});
