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
  Modal,
} from 'react-native';
import { Tag, Plus, Trash2, Edit2, Clock, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CouponsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Default to 30 days from today
  const getInitialValidDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    validTill: getInitialValidDate(),
    description: '',
    minSpend: '0',
  });

  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());

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
      validTill: getInitialValidDate(),
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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        const dayStr = String(d).padStart(2, '0');
        const monthStr = String(m + 1).padStart(2, '0');
        return `${dayStr}-${monthStr}-${y} (${dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})`;
      }
    } catch {}
    return dateStr;
  };

  const openDatePicker = () => {
    if (form.validTill) {
      const parts = form.validTill.split('-');
      if (parts.length === 3) {
        setPickerYear(parseInt(parts[0], 10));
        setPickerMonth(parseInt(parts[1], 10) - 1);
      }
    }
    setShowDatePicker(true);
  };

  const handleSelectDay = (day: number) => {
    const y = pickerYear;
    const m = String(pickerMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    setForm({ ...form, validTill: `${y}-${m}-${d}` });
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const applyPreset = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setForm({ ...form, validTill: `${y}-${m}-${day}` });
    setPickerYear(y);
    setPickerMonth(d.getMonth());
    setShowDatePicker(false);
  };

  // Calendar calculations
  const firstDayOfWeek = new Date(pickerYear, pickerMonth, 1).getDay();
  const totalDaysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();

  // Highlight selected date
  const isSelectedDate = (day: number) => {
    if (!form.validTill) return false;
    const parts = form.validTill.split('-');
    if (parts.length === 3) {
      return (
        parseInt(parts[0], 10) === pickerYear &&
        parseInt(parts[1], 10) === pickerMonth + 1 &&
        parseInt(parts[2], 10) === day
      );
    }
    return false;
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

        {/* Date Picker Button Trigger */}
        <Text style={[styles.label, { color: theme.textPrimary }]}>Valid Till (Expiry Date) *</Text>
        <TouchableOpacity
          style={[styles.datePickerTrigger, { backgroundColor: theme.bgInput, borderColor: theme.border }]}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <View style={styles.datePickerLeft}>
            <Calendar size={18} color={theme.accentRose} />
            <Text style={[styles.datePickerText, { color: theme.textPrimary }]}>
              {formatDisplayDate(form.validTill)}
            </Text>
          </View>
          <View style={[styles.dateBadge, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
            <Text style={[styles.dateBadgeText, { color: theme.accentRose }]}>Pick Date</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.label, { color: theme.textPrimary, marginTop: 4 }]}>Min Spend Amount (₹)</Text>
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

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color={theme.accentRose} />
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Select Expiry Date</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.closeBtn}>
                <X size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { backgroundColor: theme.chipBg }]}>
                <ChevronLeft size={18} color={theme.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.monthYearText, { color: theme.textPrimary }]}>
                {MONTH_NAMES[pickerMonth]} {pickerYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { backgroundColor: theme.chipBg }]}>
                <ChevronRight size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Day Names Row */}
            <View style={styles.dayNamesRow}>
              {DAY_NAMES.map((name, i) => (
                <Text key={i} style={[styles.dayNameCell, { color: theme.textMuted }]}>
                  {name}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {/* Empty leading cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}

              {/* Day cells */}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = isSelectedDate(dayNum);
                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.dayCell,
                      isSelected && [styles.selectedDayCell, { backgroundColor: theme.accentRose }]
                    ]}
                    onPress={() => handleSelectDay(dayNum)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        { color: theme.textPrimary },
                        isSelected && { color: '#ffffff', fontWeight: 'bold' }
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Presets Row */}
            <Text style={[styles.presetLabel, { color: theme.textMuted }]}>QUICK SELECT</Text>
            <View style={styles.presetsRow}>
              <TouchableOpacity style={[styles.presetBtn, { backgroundColor: theme.chipBg }]} onPress={() => applyPreset(7)}>
                <Text style={[styles.presetText, { color: theme.accentRose }]}>+7 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { backgroundColor: theme.chipBg }]} onPress={() => applyPreset(30)}>
                <Text style={[styles.presetText, { color: theme.accentRose }]}>+1 Month</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { backgroundColor: theme.chipBg }]} onPress={() => applyPreset(90)}>
                <Text style={[styles.presetText, { color: theme.accentRose }]}>+3 Months</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { backgroundColor: theme.chipBg }]} onPress={() => applyPreset(365)}>
                <Text style={[styles.presetText, { color: theme.accentRose }]}>+1 Year</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>COUPONS ({coupons.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : coupons.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No coupons created yet.</Text>
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
                ⏳ Valid Till: {formatDisplayDate(new Date(item.validTill).toISOString().split('T')[0])}
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

  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  datePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  cancelBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12 },
  cancelBtnText: { fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 8,
    borderRadius: 8,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedDayCell: {
    borderRadius: 19,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '500',
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

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
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 14 },
});
