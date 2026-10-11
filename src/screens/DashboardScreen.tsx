import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  Scissors,
  CalendarCheck,
  Users,
  MessageSquareQuote,
  Tag,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  MapPin,
  ChevronRight,
  Gift,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [refreshing, setRefreshing] = useState(false);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currentDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const statCards = [
    {
      id: 'appointments',
      title: 'Appointments',
      subtitle: 'Bookings & Calls',
      count: stats.appointments,
      icon: CalendarCheck,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      borderAccent: 'rgba(245, 158, 11, 0.3)',
    },
    {
      id: 'services',
      title: 'Services Menu',
      subtitle: 'Active Treatments',
      count: stats.services,
      icon: Scissors,
      color: '#f43f5e',
      bgLight: 'rgba(244, 63, 94, 0.12)',
      borderAccent: 'rgba(244, 63, 94, 0.3)',
    },
    {
      id: 'employees',
      title: 'Master Stylists',
      subtitle: 'Salon Team Experts',
      count: stats.employees,
      icon: Users,
      color: '#a855f7',
      bgLight: 'rgba(168, 85, 247, 0.12)',
      borderAccent: 'rgba(168, 85, 247, 0.3)',
    },
    {
      id: 'testimonials',
      title: 'Client Reviews',
      subtitle: 'Ratings & Feedback',
      count: stats.testimonials,
      icon: MessageSquareQuote,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      borderAccent: 'rgba(168, 185, 129, 0.3)',
    },
    {
      id: 'coupons',
      title: 'Active Offers',
      subtitle: 'Discount Coupons',
      count: stats.coupons,
      icon: Tag,
      color: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.12)',
      borderAccent: 'rgba(59, 130, 246, 0.3)',
    },
    {
      id: 'gallery',
      title: 'Parlour Gallery',
      subtitle: 'Showcase Photos',
      count: stats.galleryImages,
      icon: ImageIcon,
      color: '#ec4899',
      bgLight: 'rgba(236, 72, 153, 0.12)',
      borderAccent: 'rgba(236, 72, 153, 0.3)',
    },
  ];

  const quickActions = [
    {
      id: 'appointments',
      title: 'Appointments',
      desc: 'Check bookings & schedule',
      icon: CalendarCheck,
      color: '#f59e0b',
    },
    {
      id: 'services',
      title: 'Service Catalog',
      desc: 'Manage rates & treatments',
      icon: Scissors,
      color: '#f43f5e',
    },
    {
      id: 'gallery',
      title: 'Add Photo',
      desc: 'Upload to bridal gallery',
      icon: ImageIcon,
      color: '#ec4899',
    },
    {
      id: 'customer-coupons',
      title: 'Assign Coupon',
      desc: 'Send special gift coupon',
      icon: Gift,
      color: '#8b5cf6',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 80 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handlePullRefresh}
          tintColor={theme.accentRose}
          colors={[theme.accentRose, theme.accentGold]}
        />
      }
    >
      {/* Premium Hero Welcome Banner */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.bgCard,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.statusPill}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusPillText}>SALON LIVE • ONLINE</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: theme.chipBg, borderColor: theme.border }]}
            onPress={handlePullRefresh}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={theme.accentGold} />
            ) : (
              <>
                <RefreshCw size={12} color={theme.accentGold} />
                <Text style={[styles.syncButtonText, { color: theme.accentGold }]}>Sync</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <Text style={[styles.greetingText, { color: theme.textSecondary }]}>
            {getGreeting()}, Admin ✨
          </Text>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>
            TheMakeUpLab Buxar
          </Text>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {currentDateStr} • Station Road Branch
          </Text>
        </View>

        {/* Pulse strip metrics */}
        <View style={[styles.pulseStrip, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
          <View style={styles.pulseItem}>
            <Text style={[styles.pulseNum, { color: theme.accentGold }]}>
              {stats.services}
            </Text>
            <Text style={[styles.pulseLabel, { color: theme.textMuted }]}>Services</Text>
          </View>
          <View style={[styles.pulseDivider, { backgroundColor: theme.border }]} />
          <View style={styles.pulseItem}>
            <Text style={[styles.pulseNum, { color: theme.accentRose }]}>
              {stats.employees}
            </Text>
            <Text style={[styles.pulseLabel, { color: theme.textMuted }]}>Stylists</Text>
          </View>
          <View style={[styles.pulseDivider, { backgroundColor: theme.border }]} />
          <View style={styles.pulseItem}>
            <Text style={[styles.pulseNum, { color: '#10b981' }]}>
              {stats.appointments}
            </Text>
            <Text style={[styles.pulseLabel, { color: theme.textMuted }]}>Bookings</Text>
          </View>
          <View style={[styles.pulseDivider, { backgroundColor: theme.border }]} />
          <View style={styles.pulseItem}>
            <Text style={[styles.pulseNum, { color: '#3b82f6' }]}>
              {stats.coupons}
            </Text>
            <Text style={[styles.pulseLabel, { color: theme.textMuted }]}>Coupons</Text>
          </View>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Overview Metrics</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Live salon performance</Text>
      </View>

      {/* 2-Column Luxury Stat Cards Grid */}
      <View style={styles.grid}>
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.75}
              onPress={() => onNavigate(card.id)}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: card.bgLight,
                      borderColor: card.borderAccent,
                    },
                  ]}
                >
                  <IconComp size={20} color={card.color} />
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: theme.chipBg }]}>
                  <ArrowRight size={13} color={card.color} />
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.countValue, { color: theme.textPrimary }]}>
                  {card.count}
                </Text>
                <Text style={[styles.cardTitleText, { color: theme.textPrimary }]} numberOfLines={1}>
                  {card.title}
                </Text>
                <Text style={[styles.cardSubtitleText, { color: theme.textMuted }]} numberOfLines={1}>
                  {card.subtitle}
                </Text>
              </View>

              {/* Bottom accent glow strip */}
              <View style={[styles.cardGlowBar, { backgroundColor: card.color }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Instant shortcuts</Text>
      </View>

      <View style={styles.actionGrid}>
        {quickActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.bgCard,
                  borderColor: theme.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onNavigate(action.id)}
            >
              <View style={[styles.actionIconPill, { backgroundColor: action.color + '18' }]}>
                <ActionIcon size={18} color={action.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionDesc, { color: theme.textMuted }]} numberOfLines={1}>
                  {action.desc}
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Salon Info & Timings Card */}
      <TouchableOpacity
        style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        activeOpacity={0.8}
        onPress={() => onNavigate('settings')}
      >
        <View style={styles.infoHeaderRow}>
          <View style={styles.infoBadge}>
            <Sparkles size={12} color={theme.accentGold} />
            <Text style={[styles.infoBadgeText, { color: theme.accentGold }]}>SALON OUTLET</Text>
          </View>
          <View style={styles.infoEditLink}>
            <Text style={[styles.infoEditText, { color: theme.accentRose }]}>Edit Info</Text>
            <ChevronRight size={14} color={theme.accentRose} />
          </View>
        </View>

        <View style={styles.infoDetailsRow}>
          <View style={styles.infoItem}>
            <MapPin size={14} color={theme.accentRose} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]} numberOfLines={1}>
              Station Road, Buxar, Bihar
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={14} color={theme.accentGold} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              10:00 AM – 08:00 PM (Daily Open)
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusPillText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  syncButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  heroContent: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  pulseStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  pulseItem: {
    alignItems: 'center',
    flex: 1,
  },
  pulseNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  pulseLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  pulseDivider: {
    width: 1,
    height: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },
  card: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    padding: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    marginTop: 2,
  },
  countValue: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  cardTitleText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  cardSubtitleText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  cardGlowBar: {
    position: 'absolute',
    bottom: 0,
    left: 14,
    right: 14,
    height: 2.5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionIconPill: {
    padding: 10,
    borderRadius: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoEditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  infoEditText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoDetailsRow: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

