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
import { Image as ImageIcon, Plus, Trash2, Upload, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickImage } from '../utils/imagePicker';

export default function GalleryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Bridal',
  });

  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const res = await api.getParlourImages();
    if (res.success && Array.isArray(res.data)) {
      setImages(res.data);
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
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setSaving(true);
    try {
      const res = await api.createParlourImage({
        title: form.title.trim(),
        category: form.category,
        image: selectedImage.base64,
        imageUrl: selectedImage.base64,
      });

      if (res.success) {
        Alert.alert('Success', 'Gallery image uploaded and saved successfully');
        setForm({ title: '', category: 'Bridal' });
        setSelectedImage(null);
        fetchImages();
      } else {
        Alert.alert('Error', res.message || 'Failed to save gallery image');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Network request failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    Alert.alert('Confirm Delete', `Remove image ${title ? `"${title}"` : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteParlourImage(id);
          if (res.success) {
            Alert.alert('Deleted', 'Image removed');
            fetchImages();
          } else {
            Alert.alert('Error', res.message);
          }
        },
      },
    ]);
  };

  const categories = ['Bridal', 'Makeup', 'Hair', 'Nails', 'Spa', 'Interior', 'General'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Parlour Gallery Images</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Add Gallery Image</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Gallery Photo *</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: theme.chipBg, borderColor: theme.accentRose }]}
          onPress={handlePickImage}
          disabled={saving}
        >
          <Upload size={16} color={theme.accentRose} />
          <Text style={[styles.uploadBtnText, { color: theme.accentRose }]}>
            {selectedImage ? 'Change Photo from Gallery' : 'Select Photo from Gallery'}
          </Text>
        </TouchableOpacity>

        {selectedImage ? (
          <View style={styles.imagePreviewRow}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewThumbnail} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.previewStatusText, { color: theme.textPrimary }]}>
                Photo selected (ready to upload on save)
              </Text>
            </View>
            <TouchableOpacity onPress={handleClearImage} style={styles.clearImgBtn}>
              <X size={14} color="#fb7185" />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 8 }]}>Title / Caption</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Royal HD Bridal Makeup Look"
          placeholderTextColor={theme.textMuted}
          value={form.title}
          onChangeText={(v) => setForm({ ...form, title: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {categories.map((cat) => {
            const isSelected = form.category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.typeChip,
                  { backgroundColor: theme.chipBg, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose },
                ]}
                onPress={() => setForm({ ...form, category: cat })}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: theme.chipText },
                    isSelected && { color: theme.accentRose, fontWeight: 'bold' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
              <Text style={styles.saveBtnText}>Add to Gallery</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Uploaded Gallery ({images.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : images.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No gallery images added yet.</Text>
        ) : (
          <View style={styles.grid}>
            {images.map((item) => (
              <View key={item._id} style={[styles.gridItem, { borderColor: theme.border, backgroundColor: theme.chipBg }]}>
                <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                <View style={styles.gridOverlay}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gridCat, { color: theme.accentGold }]}>{item.category}</Text>
                    {item.title ? (
                      <Text style={[styles.gridTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => handleDelete(item._id, item.title)}
                  >
                    <Trash2 size={14} color="#fb7185" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
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
    borderRadius: 8,
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
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  typeChipText: { fontSize: 12 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '48%', borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  gridImage: { width: '100%', height: 120 },
  gridOverlay: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridCat: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  gridTitle: { fontSize: 12, fontWeight: '600' },
  deleteIconBtn: { padding: 4, borderRadius: 4, backgroundColor: 'rgba(251, 113, 133, 0.1)' },
});
