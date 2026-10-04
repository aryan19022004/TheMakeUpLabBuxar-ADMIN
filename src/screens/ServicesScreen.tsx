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
import { Scissors, Plus, Trash2, Edit2, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function ServicesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    serviceTypeId: '',
    name: '',
    price: '',
    description: '',
    duration: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [sRes, stRes] = await Promise.all([api.getServices(), api.getServiceTypes()]);
    if (sRes.success) setServices(sRes.data || []);
    if (stRes.success && Array.isArray(stRes.data)) {
      setServiceTypes(stRes.data);
      if (stRes.data.length > 0 && !form.serviceTypeId) {
        setForm((prev) => ({ ...prev, serviceTypeId: stRes.data[0]._id }));
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.serviceTypeId || !form.name || !form.price) {
      Alert.alert('Error', 'Category, service name, and price are required');
      return;
    }

    if (editingId) {
      const res = await api.updateService(editingId, form);
      if (res.success) {
        Alert.alert('Success', 'Service updated');
        resetForm();
        fetchData();
      } else {
        Alert.alert('Error', res.message);
      }
    } else {
      const res = await api.createService(form);
      if (res.success) {
        Alert.alert('Success', 'Service added');
        resetForm();
        fetchData();
      } else {
        Alert.alert('Error', res.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      serviceTypeId: serviceTypes[0]?._id || '',
      name: '',
      price: '',
      description: '',
      duration: '',
    });
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete service "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteService(id);
          if (res.success) {
            Alert.alert('Deleted', 'Service removed');
            fetchData();
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
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Services & Pricing</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Service' : 'Add New Service'}</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Select Service Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {serviceTypes.map((t) => {
            const isSelected = form.serviceTypeId === t._id;
            return (
              <TouchableOpacity
                key={t._id}
                style={[
                  styles.typeChip,
                  { backgroundColor: theme.chipBg, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose }
                ]}
                onPress={() => setForm({ ...form, serviceTypeId: t._id })}
              >
                <Text style={[styles.chipText, { color: theme.chipText }, isSelected && { color: theme.accentRose, fontWeight: 'bold' }]}>
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Service Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Royal HD Bridal Makeup"
          placeholderTextColor={theme.textMuted}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Price (₹) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 1500"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={form.price}
          onChangeText={(v) => setForm({ ...form, price: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Duration (e.g. 45 mins)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 45 mins / 1 hour"
          placeholderTextColor={theme.textMuted}
          value={form.duration}
          onChangeText={(v) => setForm({ ...form, duration: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary, height: 60 }]}
          placeholder="What is included in this service..."
          placeholderTextColor={theme.textMuted}
          multiline
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update Service' : 'Save Service'}</Text>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.chipBg }]} onPress={resetForm}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>SERVICES MENU ({services.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : (
          services.map((item) => (
            <View key={item._id} style={[styles.serviceItem, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.categoryBadge, { color: theme.accentGold }]}>
                  {typeof item.serviceTypeId === 'object' ? item.serviceTypeId?.name : 'Category'}
                </Text>
                <Text style={[styles.serviceName, { color: theme.textPrimary }]}>{item.name}</Text>
                <Text style={[styles.servicePrice, { color: theme.accentRose }]}>₹{item.price}</Text>
                {item.duration ? (
                  <View style={styles.durationRow}>
                    <Clock size={12} color={theme.textMuted} />
                    <Text style={[styles.durationText, { color: theme.textMuted }]}>{item.duration}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                  onPress={() => {
                    setEditingId(item._id);
                    const tId = typeof item.serviceTypeId === 'object' ? item.serviceTypeId?._id : item.serviceTypeId;
                    setForm({
                      serviceTypeId: tId || '',
                      name: item.name,
                      price: String(item.price),
                      description: item.description || '',
                      duration: item.duration || '',
                    });
                  }}
                >
                  <Edit2 size={14} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.name)}>
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
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 12 },

  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  serviceName: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  servicePrice: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  durationText: { fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
