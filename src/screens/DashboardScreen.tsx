import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Scissors,
  CalendarCheck,
  Users,
  MessageSquareQuote,
  Tag,
  Image as ImageIcon,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

interface DashboardScreenProps {
  stats: {
    services: number;
    appointments: number;
    employees: number;
    testimonials: number;
    coupons: number;
    galleryImages: number;
  };
  onNavigate: (sectionId: string) => void;
  onRefresh: () => void;
}

export default function DashboardScreen({ stats, onNavigate, onRefresh }: DashboardScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSeed = async () => {
    Alert.alert(
      'Seed Sample Database',
      'This will populate sample categories, services, team members, reviews, and coupons for theMakeUpLabBuxar.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Now',
          onPress: async () => {
            const res = await api.seedDatabase();
            if (res.success) {
              Alert.alert('Success', 'Database seeded successfully!');
              onRefresh();
            } else {
              Alert.alert('Error', res.message || 'Seeding failed');
            }
          },
        },
      ]
    );
  };

  const statCards = [
    { id: 'services', title: 'Services Menu', count: stats.services, icon: Scissors, color: '#d24d77' },
    { id: 'appointments', title: 'Appointments', count: stats.appointments, icon: CalendarCheck, color: '#d4af37' },
    { id: 'employees', title: 'Master Stylists', count: stats.employees, icon: Users, color: '#a855f7' },
    { id: 'testimonials', title: 'Client Reviews', count: stats.testimonials, icon: MessageSquareQuote, color: '#10b981' },
    { id: 'coupons', title: 'Active Coupons', count: stats.coupons, icon: Tag, color: '#3b82f6' },
    { id: 'gallery', title: 'Gallery Photos', count: stats.galleryImages, icon: ImageIcon, color: '#f43f5e' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
    >
      
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>TheMakeUpLab Admin</Text>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>Full Control Panel for Buxar Salon</Text>
        </View>
        <TouchableOpacity style={[styles.seedBtn, { backgroundColor: theme.chipBg, borderColor: theme.border, borderWidth: 1 }]} onPress={handleSeed}>
          <Database size={14} color={theme.accentGold} />
          <Text style={[styles.seedText, { color: theme.accentGold }]}>Seed DB</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Cards */}
      <View style={styles.grid}>
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => onNavigate(card.id)}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrapper, { backgroundColor: card.color + '22' }]}>
                  <IconComp size={20} color={card.color} />
                </View>
                <ArrowRight size={16} color={theme.textMuted} />
              </View>
              <Text style={[styles.countText, { color: theme.textPrimary }]}>{card.count}</Text>
              <Text style={[styles.cardTitle, { color: theme.textMuted }]}>{card.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.shortcutsSection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>QUICK ACTIONS</Text>
        <View style={styles.shortcutsRow}>
          <TouchableOpacity style={[styles.shortcutBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]} onPress={() => onNavigate('appointments')}>
            <CalendarCheck size={16} color={theme.accentGold} />
            <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>View Appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.shortcutBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]} onPress={() => onNavigate('customer-coupons')}>
            <Sparkles size={16} color={theme.accentRose} />
            <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>Assign Coupon</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  welcomeText: { fontSize: 18, fontWeight: 'bold' },
  subText: { fontSize: 11, marginTop: 2 },
  seedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  seedText: { fontSize: 11, fontWeight: 'bold' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  iconWrapper: { padding: 10, borderRadius: 14 },
  countText: { fontSize: 26, fontWeight: 'bold' },
  cardTitle: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  shortcutsSection: { marginTop: 20, marginBottom: 40 },
  sectionHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  shortcutsRow: { flexDirection: 'row', gap: 10 },
  shortcutBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  shortcutText: { fontSize: 12, fontWeight: '600' },
});
