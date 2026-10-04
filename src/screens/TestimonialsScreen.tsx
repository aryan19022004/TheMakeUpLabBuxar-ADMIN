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
import { MessageSquareQuote, Plus, Trash2, Edit2, Star, Video, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickAndUploadImage } from '../utils/imagePicker';

export default function TestimonialsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    instaVideoLink: '',
    rating: '5',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const res = await api.getTestimonials();
    if (res.success && Array.isArray(res.data)) {
      setTestimonials(res.data);
    }
    setLoading(false);
  };

  const handlePickImage = async () => {
    setUploadingImage(true);
    const result = await pickAndUploadImage();
    setUploadingImage(false);

    if (result.success && result.url) {
      setForm((prev) => ({ ...prev, imageUrl: result.url! }));
      Alert.alert('Image Uploaded', 'Client photo uploaded to Cloudinary successfully!');
    } else if (result.message && result.message !== 'Image selection cancelled') {
      Alert.alert('Upload Failed', result.message);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.description) {
      Alert.alert('Error', 'Name and review description are required');
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      instaVideoLink: form.instaVideoLink,
      rating: Number(form.rating) || 5,
    };

    if (editingId) {
      const res = await api.updateTestimonial(editingId, payload);
      if (res.success) {
        Alert.alert('Success', 'Review updated');
        resetForm();
        fetchTestimonials();
      } else {
        Alert.alert('Error', res.message);
      }
    } else {
      const res = await api.createTestimonial(payload);
      if (res.success) {
        Alert.alert('Success', 'Review added');
        resetForm();
        fetchTestimonials();
      } else {
        Alert.alert('Error', res.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      description: '',
      imageUrl: '',
      instaVideoLink: '',
      rating: '5',
    });
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Remove review by "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteTestimonial(id);
          if (res.success) {
            Alert.alert('Deleted', 'Review removed');
            fetchTestimonials();
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
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Client Reviews & Testimonials</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Review' : 'Add Client Review'}</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Client Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Pooja Singh"
          placeholderTextColor={theme.textMuted}
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Review Description *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary, height: 60 }]}
          placeholder="Share client feedback, experience with parlour..."
          placeholderTextColor={theme.textMuted}
          multiline
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Client Photo</Text>
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

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 8 }]}>Direct Image URL (Optional fallback)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="https://..."
          placeholderTextColor={theme.textMuted}
          value={form.imageUrl}
          onChangeText={(v) => setForm({ ...form, imageUrl: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Instagram Reel / Video Link (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="https://instagram.com/reel/..."
          placeholderTextColor={theme.textMuted}
          value={form.instaVideoLink}
          onChangeText={(v) => setForm({ ...form, instaVideoLink: v })}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update Review' : 'Save Review'}</Text>
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
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>REVIEWS LIST ({testimonials.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : (
          testimonials.map((item) => (
            <View key={item._id} style={[styles.reviewCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.reviewTop}>
                <Text style={[styles.customerName, { color: theme.textPrimary }]}>{item.name}</Text>
                <View style={styles.starRow}>
                  <Star size={12} color={theme.accentGold} fill={theme.accentGold} />
                  <Text style={[styles.starText, { color: theme.accentGold }]}>{item.rating || 5}.0</Text>
                </View>
              </View>

              <Text style={[styles.descText, { color: theme.textMuted }]}>"{item.description}"</Text>

              {item.instaVideoLink ? (
                <View style={styles.reelRow}>
                  <Video size={12} color={theme.accentRose} />
                  <Text style={[styles.reelText, { color: theme.accentRose }]} numberOfLines={1}>
                    {item.instaVideoLink}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                  onPress={() => {
                    setEditingId(item._id);
                    setForm({
                      name: item.name,
                      description: item.description,
                      imageUrl: item.imageUrl || '',
                      instaVideoLink: item.instaVideoLink || '',
                      rating: String(item.rating || 5),
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
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  reviewCard: { padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  customerName: { fontSize: 15, fontWeight: 'bold' },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starText: { fontSize: 12, fontWeight: 'bold' },
  descText: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },
  reelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  reelText: { fontSize: 11 },

  actionRow: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, paddingTop: 8 },
  editBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
