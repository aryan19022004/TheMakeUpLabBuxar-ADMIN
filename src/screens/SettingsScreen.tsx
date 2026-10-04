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
import { Settings, Save } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    parlourName: 'theMakeUpLabBuxar',
    tagline: 'Premier Beauty Parlour & Luxury Bridal Salon in Buxar',
    phoneNumber: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    email: 'contact@themakeuplabbuxar.com',
    address: 'Main Road, Opposite City Center, Buxar, Bihar 802101',
    instagramUrl: 'https://instagram.com/themakeuplabbuxar',
    facebookUrl: 'https://facebook.com/themakeuplabbuxar',
    openingHours: 'Mon - Sun: 10:00 AM - 8:00 PM',
    closedDays: [] as string[],
    aboutUsText: '',
  });

  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await api.getSettings();
    if (res.success && res.data) {
      setForm({
        parlourName: res.data.parlourName || 'theMakeUpLabBuxar',
        tagline: res.data.tagline || '',
        phoneNumber: res.data.phoneNumber || '',
        whatsappNumber: res.data.whatsappNumber || '',
        email: res.data.email || '',
        address: res.data.address || '',
        instagramUrl: res.data.instagramUrl || '',
        facebookUrl: res.data.facebookUrl || '',
        openingHours: res.data.openingHours || '',
        closedDays: Array.isArray(res.data.closedDays) ? res.data.closedDays : [],
        aboutUsText: res.data.aboutUsText || '',
      });
    }
    setLoading(false);
  };

  const toggleClosedDay = (day: string) => {
    setForm((prev) => {
      const exists = prev.closedDays.includes(day);
      if (exists) {
        return { ...prev, closedDays: prev.closedDays.filter((d) => d !== day) };
      } else {
        return { ...prev, closedDays: [...prev.closedDays, day] };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await api.updateSettings(form);
    if (res.success) {
      Alert.alert('Saved', 'Website contact settings updated successfully!');
    } else {
      Alert.alert('Error', res.message);
    }
    setSaving(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Salon Contact & Info</Text>

      {loading ? (
        <ActivityIndicator color={theme.accentRose} style={{ marginVertical: 20 }} />
      ) : (
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Parlour Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.parlourName}
            onChangeText={(v) => setForm({ ...form, parlourName: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Tagline</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.tagline}
            onChangeText={(v) => setForm({ ...form, tagline: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(v) => setForm({ ...form, phoneNumber: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>WhatsApp Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            keyboardType="phone-pad"
            value={form.whatsappNumber}
            onChangeText={(v) => setForm({ ...form, whatsappNumber: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Full Address *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary, height: 60 }]}
            multiline
            value={form.address}
            onChangeText={(v) => setForm({ ...form, address: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Opening Hours *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.openingHours}
            onChangeText={(v) => setForm({ ...form, openingHours: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Weekly Closed Days (Multi-Select)</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => {
              const isClosed = form.closedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    { backgroundColor: theme.chipBg, borderColor: theme.border },
                    isClosed && { backgroundColor: '#be123c', borderColor: '#fb7185' },
                  ]}
                  onPress={() => toggleClosedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      { color: theme.textSecondary },
                      isClosed && { color: '#fff', fontWeight: 'bold' },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: theme.textPrimary, marginTop: 10 }]}>Instagram URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.instagramUrl}
            onChangeText={(v) => setForm({ ...form, instagramUrl: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>Facebook URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary }]}
            value={form.facebookUrl}
            onChangeText={(v) => setForm({ ...form, facebookUrl: v })}
          />

          <Text style={[styles.label, { color: theme.textPrimary }]}>About Us Text</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bgInput, borderColor: theme.border, color: theme.textPrimary, height: 80 }]}
            multiline
            value={form.aboutUsText}
            onChangeText={(v) => setForm({ ...form, aboutUsText: v })}
          />

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accentRose }]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={16} color="#fff" />
                <Text style={styles.saveBtnText}>Save Website Settings</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },

  card: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 30 },
  label: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  dayChipText: { fontSize: 11, fontWeight: '600' },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

