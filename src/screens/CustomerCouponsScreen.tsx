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
  Linking,
} from 'react-native';
import { UserCheck, Plus, Trash2, Search, Phone, ShieldAlert, Tag, Calendar, CheckCircle2, Clock } from 'lucide-react-native';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function CustomerCouponsScreen() {
  const { theme } = useTheme();
  const [assigned, setAssigned] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  const [form, setForm] = useState({
    customerPhoneNumber: '',
    customerName: '',
    couponCodeId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ccRes, cRes] = await Promise.all([
      api.getCustomerCoupons(searchPhone),
      api.getCoupons(),
    ]);

    if (ccRes.success && Array.isArray(ccRes.data)) setAssigned(ccRes.data);
    if (cRes.success && Array.isArray(cRes.data)) {
      setCoupons(cRes.data);
      if (cRes.data.length > 0 && !form.couponCodeId) {
        setForm((prev) => ({ ...prev, couponCodeId: cRes.data[0]._id }));
      }
    }
    setLoading(false);
  };

  const handleAssign = async () => {
    if (!form.customerPhoneNumber || !form.couponCodeId) {
      Alert.alert('Error', 'Customer phone number and coupon selection are required');
      return;
    }

    const res = await api.assignCustomerCoupon(form);
    if (res.success) {
      Alert.alert('Success', 'Coupon assigned to customer');
      setForm({ customerPhoneNumber: '', customerName: '', couponCodeId: coupons[0]?._id || '' });
      fetchData();
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Delete', 'Remove this customer coupon assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteCustomerCoupon(id);
          if (res.success) {
            Alert.alert('Deleted', 'Assignment removed');
            fetchData();
          } else {
            Alert.alert('Error', res.message);
          }
        },
      },
    ]);
  };

  // Active vs Expired filtering logic
  const now = new Date();
  const activeList = assigned.filter((item) => {
    if (!item.couponCodeId || typeof item.couponCodeId !== 'object' || !item.couponCodeId.validTill) {
      return true; // Default to active if validTill is not set
    }
    return new Date(item.couponCodeId.validTill) >= now;
  });

  const expiredList = assigned.filter((item) => {
    if (!item.couponCodeId || typeof item.couponCodeId !== 'object' || !item.couponCodeId.validTill) {
      return false;
    }
    return new Date(item.couponCodeId.validTill) < now;
  });

  const displayedList = activeTab === 'active' ? activeList : expiredList;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Customer Coupon Assignments</Text>
      <View style={styles.confidentialRow}>
        <ShieldAlert size={12} color="#fb7185" />
        <Text style={styles.confidentialText}>ADMIN ONLY DATA • Never exposed publicly</Text>
      </View>

      {/* Form */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Assign Coupon to Customer</Text>

        <Text style={[styles.label, { color: theme.textPrimary }]}>Customer Phone Number *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. 9876543210"
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
          value={form.customerPhoneNumber}
          onChangeText={(v) => setForm({ ...form, customerPhoneNumber: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Customer Name (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
          placeholder="e.g. Rahul Kumar"
          placeholderTextColor={theme.textMuted}
          value={form.customerName}
          onChangeText={(v) => setForm({ ...form, customerName: v })}
        />

        <Text style={[styles.label, { color: theme.textPrimary }]}>Select Coupon Code *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {coupons.map((c) => {
            const isSelected = form.couponCodeId === c._id;
            return (
              <TouchableOpacity
                key={c._id}
                style={[
                  styles.typeChip,
                  { backgroundColor: theme.chipBg, borderColor: theme.border },
                  isSelected && { backgroundColor: theme.chipActiveBg, borderColor: theme.accentRose }
                ]}
                onPress={() => setForm({ ...form, couponCodeId: c._id })}
              >
                <Text style={[styles.chipText, { color: theme.chipText }, isSelected && { color: theme.accentRose, fontWeight: 'bold' }]}>
                  {c.code} ({c.discountType === 'percentage' ? `${c.discount}%` : `₹${c.discount}`})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleAssign}>
          <Plus size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Assign Coupon to Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Search size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search assigned coupons by phone..."
          placeholderTextColor={theme.textMuted}
          value={searchPhone}
          onChangeText={setSearchPhone}
          onSubmitEditing={fetchData}
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.chipBg }]} onPress={fetchData}>
          <Text style={[styles.searchBtnText, { color: theme.accentGold }]}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs for Active / Expired */}
      <View style={[styles.tabBar, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'active' && [styles.activeTabItem, { backgroundColor: theme.accentRose }]
          ]}
          onPress={() => setActiveTab('active')}
        >
          <CheckCircle2 size={14} color={activeTab === 'active' ? '#ffffff' : theme.textMuted} />
          <Text
            style={[
              styles.tabItemText,
              { color: theme.textMuted },
              activeTab === 'active' && styles.activeTabItemText
            ]}
          >
            Active ({activeList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'expired' && [styles.activeTabItem, { backgroundColor: '#e11d48' }]
          ]}
          onPress={() => setActiveTab('expired')}
        >
          <Clock size={14} color={activeTab === 'expired' ? '#ffffff' : theme.textMuted} />
          <Text
            style={[
              styles.tabItemText,
              { color: theme.textMuted },
              activeTab === 'expired' && styles.activeTabItemText
            ]}
          >
            Expired ({expiredList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
          {activeTab.toUpperCase()} CUSTOMER COUPONS ({displayedList.length})
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : displayedList.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No {activeTab} customer coupons found.
          </Text>
        ) : (
          displayedList.map((item) => {
            const coupon = typeof item.couponCodeId === 'object' ? item.couponCodeId : null;
            const couponCodeStr = coupon?.code || 'COUPON';
            const discountStr = coupon?.discount !== undefined
              ? coupon.discountType === 'percentage'
                ? `${coupon.discount}% OFF`
                : `₹${coupon.discount} OFF`
              : null;
            const validTillStr = coupon?.validTill
              ? new Date(coupon.validTill).toLocaleDateString()
              : null;

            return (
              <View key={item._id} style={[styles.itemCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.custName, { color: theme.textPrimary }]}>{item.customerName || 'Customer'}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.customerPhoneNumber}`)}>
                      <Text style={[styles.custPhone, { color: theme.accentGold }]}>📞 {item.customerPhoneNumber}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.couponBadgeContainer}>
                    <View style={[styles.codeBadge, { backgroundColor: theme.chipActiveBg || '#fff1f2', borderColor: theme.accentRose }]}>
                      <Tag size={12} color={theme.accentRose} style={{ marginRight: 4 }} />
                      <Text style={[styles.couponBadgeText, { color: theme.accentRose }]}>
                        {couponCodeStr}
                      </Text>
                    </View>
                    {discountStr && (
                      <Text style={[styles.discountText, { color: theme.accentGold || '#d97706' }]}>
                        {discountStr}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                  <View>
                    <Text style={[styles.assignedDate, { color: theme.textMuted }]}>
                      Assigned: {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'N/A'}
                    </Text>
                    {validTillStr && (
                      <Text style={[styles.validTillDate, { color: activeTab === 'expired' ? '#f43f5e' : theme.textMuted }]}>
                        Valid till: {validTillStr}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                    <Trash2 size={14} color="#fb7185" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold' },
  confidentialRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, marginTop: 2 },
  confidentialText: { color: '#fb7185', fontSize: 10, fontWeight: 'bold' },

  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, marginTop: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 6, borderWidth: 1 },
  chipText: { fontSize: 12 },

  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, marginBottom: 16 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13 },
  searchBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  searchBtnText: { fontSize: 12, fontWeight: 'bold' },

  tabBar: { flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1, marginBottom: 20 },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  activeTabItem: { backgroundColor: '#e11d48' },
  tabItemText: { fontSize: 13, fontWeight: '600' },
  activeTabItemText: { color: '#ffffff', fontWeight: 'bold' },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  emptyText: { fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },

  itemCard: { padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  custName: { fontSize: 15, fontWeight: 'bold' },
  custPhone: { fontSize: 13, marginTop: 2, fontWeight: 'bold' },

  couponBadgeContainer: { alignItems: 'flex-end', gap: 4 },
  codeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  couponBadgeText: { fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  discountText: { fontSize: 11, fontWeight: 'bold' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  assignedDate: { fontSize: 11 },
  validTillDate: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
