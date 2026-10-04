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
  Image,
} from 'react-native';
import { Users, Plus, Trash2, Edit2, User, Upload, Image as ImageIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickAndUploadImage } from '../utils/imagePicker';

export default function EmployeesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    position: '',
    imageUrl: '',
    bio: '',
    specialtiesInput: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await api.getEmployees();
    if (res.success && Array.isArray(res.data)) {
      setEmployees(res.data);
    }
    setLoading(false);
  };

  const handlePickImage = async () => {
    setUploadingImage(true);
    const result = await pickAndUploadImage();
    setUploadingImage(false);

    if (result.success && result.url) {
      setForm((prev) => ({ ...prev, imageUrl: result.url! }));
      Alert.alert('Image Uploaded', 'Staff photo uploaded to Cloudinary successfully!');
    } else if (result.message && result.message !== 'Image selection cancelled') {
      Alert.alert('Upload Failed', result.message);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.position) {
      Alert.alert('Error', 'Name and position are required');
      return;
    }

    const specialties = form.specialtiesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name: form.name,
      position: form.position,
      imageUrl: form.imageUrl,
      bio: form.bio,
      specialties,
    };

    if (editingId) {
      const res = await api.updateEmployee(editingId, payload);
      if (res.success) {
        Alert.alert('Success', 'Staff details updated');
        resetForm();
        fetchEmployees();
      } else {
        Alert.alert('Error', res.message);
      }
    } else {
      const res = await api.createEmployee(payload);
      if (res.success) {
        Alert.alert('Success', 'Staff member added');
        resetForm();
        fetchEmployees();
      } else {
        Alert.alert('Error', res.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      position: '',
      imageUrl: '',
      bio: '',
      specialtiesInput: '',
    });
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Remove staff member "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteEmployee(id);
          if (res.success) {
            Alert.alert('Deleted', 'Staff member removed');
            fetchEmployees();
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
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Master Stylists / Team</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Staff Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Priya Sharma"
          placeholderTextColor={theme.textMuted}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Position / Role *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Senior Hair Stylist & Bridal Makeup Artist"
          placeholderTextColor={theme.textMuted}
          value={form.position}
          onChangeText={(v) => setForm({ ...form, position: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Staff Photo</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: theme.chipBg, borderColor: theme.accentRose }]}
          onPress={handlePickImage}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator color={theme.accentRose} size="small" />
          ) : (
            <>
              <Upload size={16} color={theme.accentRose} />
              <Text style={[styles.uploadBtnText, { color: theme.accentRose }]}>
                Pick Photo from Gallery (Cloudinary Upload)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {form.imageUrl ? (
          <View style={styles.imagePreviewRow}>
            <Image source={{ uri: form.imageUrl }} style={styles.previewThumbnail} />
            <Text style={[styles.imagePreviewUrl, { color: theme.textMuted }]} numberOfLines={1}>
              {form.imageUrl}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 10 }]}>Direct Photo URL (Optional fallback)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="https://..."
          placeholderTextColor={theme.textMuted}
          value={form.imageUrl}
          onChangeText={(v) => setForm({ ...form, imageUrl: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Specialties (comma separated)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Keratin, Hair Cut, Bridal Makeup"
          placeholderTextColor={theme.textMuted}
          value={form.specialtiesInput}
          onChangeText={(v) => setForm({ ...form, specialtiesInput: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Bio / Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary, height: 60 }]}
          placeholder="Years of experience, certifications, etc."
          placeholderTextColor={theme.textMuted}
          multiline
          value={form.bio}
          onChangeText={(v) => setForm({ ...form, bio: v })}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update' : 'Save Staff'}</Text>
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
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>TEAM MEMBERS ({employees.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : (
          employees.map((item) => (
            <View key={item._id} style={[styles.employeeCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.empHeader}>
                <View style={[styles.avatarWrapper, { backgroundColor: theme.bgInput }]}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
                  ) : (
                    <User size={24} color={theme.textSecondary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.empName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.empPosition, { color: theme.accentGold }]}>{item.position}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                    onPress={() => {
                      setEditingId(item._id);
                      setForm({
                        name: item.name,
                        position: item.position,
                        imageUrl: item.imageUrl || '',
                        bio: item.bio || '',
                        specialtiesInput: Array.isArray(item.specialties) ? item.specialties.join(', ') : '',
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
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },
  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  uploadBtnText: { fontSize: 12, fontWeight: 'bold' },
  imagePreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 4 },
  previewThumbnail: { width: 50, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#f43f5e' },
  imagePreviewUrl: { flex: 1, fontSize: 11, fontStyle: 'italic' },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  employeeCard: { padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  empHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrapper: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatar: { width: 44, height: 44 },
  empName: { fontSize: 15, fontWeight: 'bold' },
  empPosition: { fontSize: 12, marginTop: 2, fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 6 },
  editBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
