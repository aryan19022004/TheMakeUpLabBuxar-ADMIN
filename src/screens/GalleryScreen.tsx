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
import { Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';
import { pickAndUploadImage } from '../utils/imagePicker';

export default function GalleryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    imageUrl: '',
    title: '',
    category: 'Bridal',
  });

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
    setUploadingImage(true);
    const result = await pickAndUploadImage();
    setUploadingImage(false);

    if (result.success && result.url) {
      setForm((prev) => ({ ...prev, imageUrl: result.url! }));
      Alert.alert('Image Uploaded', 'Gallery photo uploaded to Cloudinary successfully!');
    } else if (result.message && result.message !== 'Image selection cancelled') {
      Alert.alert('Upload Failed', result.message);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl) {
      Alert.alert('Error', 'Image URL is required');
      return;
    }

    const res = await api.createParlourImage(form);
    if (res.success) {
      Alert.alert('Success', 'Gallery image added');
      setForm({ imageUrl: '', title: '', category: 'Bridal' });
      fetchImages();
    } else {
      Alert.alert('Error', res.message);
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

        <Text style={[styles.label, { color: theme.textPrimary }]}>Title / Caption</Text>
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
                  isSelected && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose }
                ]}
                onPress={() => setForm({ ...form, category: cat })}
              >
                <Text style={[styles.chipText, { color: theme.chipText }, isSelected && { color: theme.accentRose, fontWeight: 'bold' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
          <Plus size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Add Image to Public Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>GALLERY PHOTOS ({images.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.grid}>
            {images.map((item) => (
              <View key={item._id} style={[styles.gridCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                <View style={styles.gridFooter}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.catText, { color: theme.accentGold }]}>{item.category || 'General'}</Text>
                    {item.title ? <Text style={[styles.titleText, { color: theme.textPrimary }]} numberOfLines={1}>{item.title}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.title)}>
                    <Trash2 size={12} color="#fb7185" />
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
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 12 },

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
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: { width: '48%', borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  gridImage: { width: '100%', height: 120 },
  gridFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8 },
  catText: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase' },
  titleText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 6, backgroundColor: '#4c0519', borderRadius: 6 },
});
