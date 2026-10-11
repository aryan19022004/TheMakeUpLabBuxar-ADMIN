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
import { MessageSquareQuote, Plus, Trash2, Edit2, Star, Video, Upload, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickImage } from '../utils/imagePicker';

export default function TestimonialsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    instaVideoLink: '',
    rating: '5',
  });

  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');

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
    if (!form.name || !form.description) {
      Alert.alert('Error', 'Name and review description are required');
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      description: form.description.trim(),
      instaVideoLink: form.instaVideoLink.trim(),
      rating: Number(form.rating) || 5,
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
        const res = await api.updateTestimonial(editingId, payload);
        if (res.success) {
          Alert.alert('Success', 'Review updated');
          resetForm();
          fetchTestimonials();
        } else {
          Alert.alert('Error', res.message || 'Failed to update review');
        }
      } else {
        const res = await api.createTestimonial(payload);
        if (res.success) {
          Alert.alert('Success', 'Review added');
          resetForm();
          fetchTestimonials();
        } else {
          Alert.alert('Error', res.message || 'Failed to add review');
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
      description: '',
      instaVideoLink: '',
      rating: '5',
    });
    setSelectedImage(null);
    setExistingImageUrl('');
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

  const currentDisplayImageUri = selectedImage?.uri || existingImageUrl || null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Client Reviews & Testimonials</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          {editingId ? 'Edit Review' : 'Add Client Review'}
        </Text>

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

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 8 }]}>Instagram Reel / Video Link (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="https://instagram.com/reel/..."
          placeholderTextColor={theme.textMuted}
          value={form.instaVideoLink}
          onChangeText={(v) => setForm({ ...form, instaVideoLink: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Rating (1 - 5 Stars)</Text>
        <View style={styles.ratingRow}>
          {['1', '2', '3', '4', '5'].map((star) => (
            <TouchableOpacity
              key={star}
              style={[
                styles.starBtn,
                { backgroundColor: theme.chipBg, borderColor: theme.border },
                form.rating === star && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentGold }
              ]}
              onPress={() => setForm({ ...form, rating: star })}
            >
              <Star size={16} color={Number(form.rating) >= Number(star) ? theme.accentGold : theme.textMuted} fill={Number(form.rating) >= Number(star) ? theme.accentGold : 'transparent'} />
              <Text style={[styles.starText, { color: theme.chipText }, form.rating === star && { color: theme.accentGold, fontWeight: 'bold' }]}>
                {star}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
                <Text style={styles.saveBtnText}>{editingId ? 'Update Review' : 'Save Review'}</Text>
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
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Client Testimonials ({testimonials.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : testimonials.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No client reviews added yet.</Text>
        ) : (
          testimonials.map((item) => (
            <View key={item._id} style={[styles.listItem, { borderBottomColor: theme.border }]}>
              <View style={styles.itemHeader}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.chipBg }]}>
                    <Text style={[styles.avatarLetter, { color: theme.accentRose }]}>{item.name[0] || 'C'}</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={[styles.clientName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <View style={styles.starsDisplay}>
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} color={theme.accentGold} fill={theme.accentGold} />
                    ))}
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                    onPress={() => {
                      setEditingId(item._id);
                      setForm({
                        name: item.name,
                        description: item.description,
                        instaVideoLink: item.instaVideoLink || '',
                        rating: String(item.rating || 5),
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

              <Text style={[styles.reviewDesc, { color: theme.textPrimary }]}>{item.description}</Text>

              {item.instaVideoLink ? (
                <View style={styles.reelBadge}>
                  <Video size={12} color={theme.accentGold} />
                  <Text style={[styles.reelText, { color: theme.accentGold }]} numberOfLines={1}>
                    {item.instaVideoLink}
                  </Text>
                </View>
              ) : null}
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
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  starBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  starText: { fontSize: 12 },
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
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 14, fontWeight: 'bold' },
  clientName: { fontSize: 14, fontWeight: 'bold' },
  starsDisplay: { flexDirection: 'row', gap: 2, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editBtn: { padding: 8, borderRadius: 6 },
  deleteBtn: { padding: 8, borderRadius: 6, backgroundColor: 'rgba(251, 113, 133, 0.1)' },
  reviewDesc: { fontSize: 13, lineHeight: 18 },
  reelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  reelText: { fontSize: 11 },
});
