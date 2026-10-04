import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Layers, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function ServiceTypesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    const res = await api.getServiceTypes();
    if (res.success && Array.isArray(res.data)) {
      setTypes(res.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    if (editingId) {
      const res = await api.updateServiceType(editingId, { name: nameInput.trim() });
      if (res.success) {
        Alert.alert('Success', 'Category updated');
        setNameInput('');
        setEditingId(null);
        fetchTypes();
      } else {
        Alert.alert('Error', res.message);
      }
    } else {
      const res = await api.createServiceType({ name: nameInput.trim() });
      if (res.success) {
        Alert.alert('Success', 'Category created');
        setNameInput('');
        fetchTypes();
      } else {
        Alert.alert('Error', res.message);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete category "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteServiceType(id);
          if (res.success) {
            Alert.alert('Deleted', 'Category removed');
            fetchTypes();
          } else {
            Alert.alert('Error', res.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Service Categories</Text>
      <Text style={[styles.subHeading, { color: theme.textSecondary }]}>Hair, Face, Skin, Hands, Nails, Makeup, Spa, Bridal</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Category' : 'Add New Category'}</Text>
        <Text style={[styles.label, { color: theme.textPrimary }]}>Category Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Hair, Skin, Bridal"
          placeholderTextColor={theme.textMuted}
          value={nameInput}
          onChangeText={setNameInput}
        />
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Add Category'}</Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.chipBg }]}
              onPress={() => {
                setEditingId(null);
                setNameInput('');
              }}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>EXISTING CATEGORIES ({types.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : types.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No categories added yet.</Text>
        ) : (
          types.map((item) => (
            <View key={item._id} style={[styles.listItem, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.itemLeft}>
                <Layers size={18} color={theme.accentGold} />
                <Text style={[styles.itemText, { color: theme.textPrimary }]}>{item.name}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                  onPress={() => {
                    setEditingId(item._id);
                    setNameInput(item.name);
                  }}
                >
                  <Edit2 size={14} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Trash2 size={14} color="#fb7185" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold' },
  subHeading: { fontSize: 12, marginBottom: 16, marginTop: 2 },

  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },
  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  emptyText: { fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 14, marginBottom: 8, borderWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemText: { fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
