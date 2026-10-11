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
import { Users, Plus, Trash2, Edit2, User, Upload, Image as ImageIcon, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickImage } from '../utils/imagePicker';

export default function EmployeesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    position: '',
    bio: '',
    specialtiesInput: '',
  });

  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');

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
    const result = await pickImage();
    if (result.success && result.uri && result.base64) {
      setSelectedImage({ uri: result.uri, base64: result.base64 });
    } else if (result.message && result.message !== 'Image selection cancelled') {
      Alert.alert('Error', result.message);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setExistingImageUrl('');
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

    const payload: any = {
      name: form.name.trim(),
      position: form.position.trim(),
      bio: form.bio.trim(),
      specialties,
    };

    if (selectedImage) {
      payload.image = selectedImage.base64;
      payload.imageUrl = selectedImage.base64;
    } else if (existingImageUrl) {
      payload.imageUrl = existingImageUrl;
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await api.updateEmployee(editingId, payload);
        if (res.success) {
          Alert.alert('Success', 'Staff details updated');
          resetForm();
          fetchEmployees();
        } else {
          Alert.alert('Error', res.message || 'Failed to update employee');
        }
      } else {
        const res = await api.createEmployee(payload);
        if (res.success) {
          Alert.alert('Success', 'Staff member added');
          resetForm();
          fetchEmployees();
        } else {
          Alert.alert('Error', res.message || 'Failed to add employee');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network request failed');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      position: '',
      bio: '',
      specialtiesInput: '',
    });
    setSelectedImage(null);
    setExistingImageUrl('');
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

  const currentDisplayImageUri = selectedImage?.uri || existingImageUrl || null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Staff & Beauticians</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
        </Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Full Name *</Text>
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
          disabled={saving}
        >
          <Upload size={16} color={theme.accentRose} />
          <Text style={[styles.uploadBtnText, { color: theme.accentRose }]}>
            {currentDisplayImageUri ? 'Change Photo from Gallery' : 'Select Photo from Gallery'}
          </Text>
        </TouchableOpacity>

        {currentDisplayImageUri ? (
          <View style={styles.imagePreviewRow}>
            <Image source={{ uri: currentDisplayImageUri }} style={styles.previewThumbnail} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.previewStatusText, { color: theme.textPrimary }]}>
                {selectedImage ? 'Photo selected (ready to save)' : 'Existing photo attached'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearImage} style={styles.clearImgBtn}>
              <X size={14} color="#fb7185" />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 8 }]}>Specialties (comma separated)</Text>
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
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.accentRose }, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Plus size={16} color="#fff" />
                <Text style={styles.saveBtnText}>{editingId ? 'Update Staff Member' : 'Save Staff Member'}</Text>
              </>
            )}
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.chipBg }]} onPress={resetForm} disabled={saving}>
              <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Current Team ({employees.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : employees.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No staff members added yet.</Text>
        ) : (
          employees.map((item) => (
            <View key={item._id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
              <View style={styles.itemHeader}>
                <View style={[styles.avatarBox, { backgroundColor: theme.chipBg }]}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
                  ) : (
                    <User size={20} color={theme.accentRose} />
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
                        bio: item.bio || '',
                        specialtiesInput: Array.isArray(item.specialties) ? item.specialties.join(', ') : '',
                      });
                      setSelectedImage(null);
                      setExistingImageUrl(item.imageUrl || '');
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
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 113, 133, 0.08)',
  },
  previewThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  previewStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearImgBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 113, 133, 0.15)',
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 14 },
  listItem: { paddingVertical: 12, borderBottomWidth: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  empName: { fontSize: 15, fontWeight: 'bold' },
  empPosition: { fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 6 },
  deleteBtn: { padding: 8, borderRadius: 6, backgroundColor: 'rgba(251, 113, 133, 0.1)' },
});
