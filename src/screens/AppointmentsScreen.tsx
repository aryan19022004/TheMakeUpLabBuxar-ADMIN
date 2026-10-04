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
import { CalendarCheck, Phone, Trash2, Search, Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function AppointmentsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await api.getAppointments(search);
    if (res.success && Array.isArray(res.data)) {
      setAppointments(res.data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await api.updateAppointmentStatus(id, status);
    if (res.success) {
      Alert.alert('Status Updated', `Appointment marked as ${status}`);
      fetchAppointments();
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete request from "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await api.deleteAppointment(id);
          if (res.success) {
            Alert.alert('Deleted', 'Request removed');
            fetchAppointments();
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
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Appointments & Callbacks</Text>

      {/* Search Bar */}
      <View style={[styles.searchRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Search size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search by customer name or phone..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchAppointments}
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.accentRose }]} onPress={fetchAppointments}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>APPOINTMENT REQUESTS ({appointments.length})</Text>

        {loading ? (
          <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
        ) : appointments.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No appointment requests found.</Text>
        ) : (
          appointments.map((item) => (
            <View key={item._id} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.customerName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phoneNumber}`)}>
                    <Text style={[styles.customerPhone, { color: theme.accentGold }]}>📞 {item.phoneNumber}</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.badge,
                    item.status === 'confirmed'
                      ? styles.badgeSuccess
                      : item.status === 'completed'
                      ? styles.badgeCompleted
                      : item.status === 'cancelled'
                      ? styles.badgeCancelled
                      : styles.badgePending,
                  ]}
                >
                  <Text style={styles.badgeText}>{item.status || 'pending'}</Text>
                </View>
              </View>

              <Text style={[styles.visitDate, { color: theme.textSecondary }]}>
                📅 Date of Visit: {new Date(item.dateOfVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>

              {item.requestACallback && (
                <Text style={styles.callbackBadge}>⚡ Request a Callback from Salon</Text>
              )}

              {item.notes ? <Text style={[styles.notesText, { color: theme.textMuted }]}>Notes: {item.notes}</Text> : null}

              {/* Status Change Buttons */}
              <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                {(!item.status || item.status === 'pending') && (
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.btnConfirm]}
                    onPress={() => handleUpdateStatus(item._id, 'confirmed')}
                  >
                    <Check size={12} color="#fff" />
                    <Text style={styles.btnText}>Confirm</Text>
                  </TouchableOpacity>
                )}

                {(!item.status || item.status === 'pending' || item.status === 'confirmed') && (
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.btnComplete]}
                    onPress={() => handleUpdateStatus(item._id, 'completed')}
                  >
                    <Text style={styles.btnText}>Completed</Text>
                  </TouchableOpacity>
                )}

                {(!item.status || item.status === 'pending') && (
                  <TouchableOpacity
                    style={[styles.statusBtn, styles.btnCancel]}
                    onPress={() => handleUpdateStatus(item._id, 'cancelled')}
                  >
                    <X size={12} color="#fff" />
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item._id, item.name)}
                >
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

  searchRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, borderWidth: 1, marginBottom: 20 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13 },
  searchBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  searchBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  listSection: { marginBottom: 30 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  emptyText: { fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },

  card: { padding: 16, borderRadius: 18, marginBottom: 12, borderWidth: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  customerName: { fontSize: 16, fontWeight: 'bold' },
  customerPhone: { fontSize: 13, marginTop: 2, fontWeight: 'bold' },
  visitDate: { fontSize: 12, marginTop: 8 },
  callbackBadge: { color: '#f59e0b', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  notesText: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeSuccess: { backgroundColor: '#064e3b' },
  badgeCompleted: { backgroundColor: '#1e3a8a' },
  badgeCancelled: { backgroundColor: '#881337' },
  badgePending: { backgroundColor: '#78350f' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

  actionRow: { flexDirection: 'row', gap: 6, marginTop: 14, paddingTop: 10, borderTopWidth: 1, alignItems: 'center' },
  statusBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 },
  btnConfirm: { backgroundColor: '#047857' },
  btnComplete: { backgroundColor: '#1d4ed8' },
  btnCancel: { backgroundColor: '#be123c' },
  btnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  deleteBtn: { padding: 8, backgroundColor: '#4c0519', borderRadius: 8 },
});
