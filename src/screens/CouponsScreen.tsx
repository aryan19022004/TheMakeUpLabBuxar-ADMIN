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
import { Tag, Plus, Trash2, Edit2, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function CouponsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    validTill: '2026-12-31',
    description: '',
    minSpend: '0',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await api.getCoupons();
    if (res.success && Array.isArray(res.data)) {
      setCoupons(res.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.code || !form.discount) {
      Alert.alert('Error', 'Coupon code and discount value are required');
      return;
    }

    if (editingId) {
      const res = await api.updateCoupon(editingId, form);
      if (res.success) {
        Alert.alert('Success', 'Coupon updated');
        resetForm();
        fetchCoupons();
      } else {
        Alert.alert('Error', res.message);
      }
    } else {
      const res = await api.createCoupon(form);
      if (res.success) {
        Alert.alert('Success', 'Coupon created');
        resetForm();
        fetchCoupons();
      } else {
        Alert.alert('Error', res.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      code: '',
      discount: '',
      discountType: 'percentage',
      validTill: '2026-12-31',
      description: '',
      minSpend: '0',
    });
  };

  const handleDelete = async (id: string, code: string) => {
    Alert.alert('Confirm Delete', `Delete coupon "${code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteCoupon(id);
          if (res.success) {
            Alert.alert('Deleted', 'Coupon removed');
            fetchCoupons();
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
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Coupon Codes & Vouchers</Text>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Coupon Code *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. BEAUTY20"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
          value={form.code}
          onChangeText={(v) => setForm({ ...form, code: v.toUpperCase() })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Discount Type *</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeBtn,
              { backgroundColor: theme.chipBg, borderColor: theme.border },
              form.discountType === 'percentage' && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose }
            ]}
            onPress={() => setForm({ ...form, discountType: 'percentage' })}
          >
            <Text style={[styles.typeText, { color: theme.chipText }, form.discountType === 'percentage' && { color: theme.accentRose, fontWeight: 'bold' }]}>
              Percentage (%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeBtn,
              { backgroundColor: theme.chipBg, borderColor: theme.border },
              form.discountType === 'fixed' && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose }
            ]}
            onPress={() => setForm({ ...form, discountType: 'fixed' })}
          >
            <Text style={[styles.typeText, { color: theme.chipText }, form.discountType === 'fixed' && { color: theme.accentRose, fontWeight: 'bold' }]}>
              Fixed Amount (₹)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Discount Value *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder={form.discountType === 'percentage' ? 'e.g. 20 (%)' : 'e.g. 500 (₹)'}
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={form.discount}
          onChangeText={(v) => setForm({ ...form, discount: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Valid Till (YYYY-MM-DD) *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 2026-12-31"
          placeholderTextColor={theme.textMuted}
          value={form.validTill}
          onChangeText={(v) => setForm({ ...form, validTill: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Min Spend Amount (₹)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 999 (0 for no min)"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={form.minSpend}
          onChangeText={(v) => setForm({ ...form, minSpend: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Offer Description</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 20% off on all Luxury Bridal Packages"
          placeholderTextColor={theme.textMuted}
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
        />

        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave}>
            <Plus size={16} color="#fff" />
            <Text style={styles.saveBtnText}>{editingId ? 'Update Coupon' : 'Save Coupon'}</Text>
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
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>COUPONS ({coupons.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : (
          coupons.map((item) => (
            <View key={item._id} style={[styles.couponCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.couponHeader}>
                <Text style={[styles.codeText, { color: theme.textPrimary }]}>{item.code}</Text>
                <Text style={[styles.discountBadge, { color: theme.accentRose }]}>
                  {item.discountType === 'percentage' ? `${item.discount}% OFF` : `₹${item.discount} OFF`}
                </Text>
              </View>

              <Text style={[styles.descText, { color: theme.textMuted }]}>{item.description || 'Special Discount Offer'}</Text>
              <Text style={[styles.validText, { color: theme.accentGold }]}>
                ⏳ Valid Till: {new Date(item.validTill).toLocaleDateString()}
              </Text>

              <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: theme.chipBg }]}
                  onPress={() => {
                    setEditingId(item._id);
                    setForm({
                      code: item.code,
                      discount: String(item.discount),
                      discountType: item.discountType || 'percentage',
                      validTill: new Date(item.validTill).toISOString().split('T')[0],
                      description: item.description || '',
                      minSpend: String(item.minSpend || 0),
                    });
                  }}
                >
                  <Edit2 size={14} color={theme.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.code)}>
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

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  typeText: { fontSize: 12 },

  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  couponCard: { padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1, fontFamily: 'monospace' },
  discountBadge: { fontSize: 14, fontWeight: 'bold' },
  descText: { fontSize: 12, marginTop: 4 },
  validText: { fontSize: 11, marginTop: 4 },

  actionRow: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, paddingTop: 8 },
  editBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
