import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import {
  LayoutDashboard,
  Layers,
  Scissors,
  CalendarCheck,
  Users,
  MessageSquareQuote,
  Tag,
  UserCheck,
  Image as ImageIcon,
  Settings,
  LogOut,
  X,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export interface SectionItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  confidential?: boolean;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
  onLogout: () => void;
}

export const SECTIONS: SectionItem[] = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'service-types', label: 'Service Categories', icon: Layers },
  { id: 'services', label: 'Services & Pricing', icon: Scissors },
  { id: 'appointments', label: 'Appointments & Callbacks', icon: CalendarCheck },
  { id: 'employees', label: 'Master Stylists / Team', icon: Users },
  { id: 'testimonials', label: 'Client Reviews', icon: MessageSquareQuote },
  { id: 'coupons', label: 'Coupon Offers', icon: Tag },
  { id: 'customer-coupons', label: 'Customer Coupons', icon: UserCheck, confidential: true },
  { id: 'gallery', label: 'Parlour Gallery', icon: ImageIcon },
  { id: 'settings', label: 'Salon Contact Info', icon: Settings },
];

export default function Sidebar({
  visible,
  onClose,
  activeSection,
  onSelectSection,
  onLogout,
}: SidebarProps) {
  const { theme, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={[styles.drawerContainer, { backgroundColor: theme.sidebarBg, borderRightColor: theme.border }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.sidebarHeader,
                borderBottomColor: theme.border,
                paddingTop: Math.max(insets.top, 16) + 4,
              },
            ]}
          >
            <View style={styles.brandRow}>
              <Image source={require('../assets/logo.jpg')} style={[styles.logo, { borderColor: theme.accentGold }]} />
              <View style={styles.titleCol}>
                <Text style={[styles.brandName, { color: theme.textPrimary }]}>TheMakeUpLab</Text>
                <View style={styles.badgeRow}>
                  <Sparkles size={10} color={theme.accentGold} />
                  <Text style={[styles.appTitle, { color: theme.accentGold }]}>Admin App</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Section Items */}
          <ScrollView style={styles.menuList} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            {/* Theme Selector */}
            <Text style={[styles.menuHeading, { color: theme.textMuted }]}>APPEARANCE / THEME</Text>
            <View style={[styles.themeRow, { backgroundColor: theme.chipBg, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.themeOption, mode === 'system' && { backgroundColor: theme.accentRose }]}
                onPress={() => setMode('system')}
              >
                <Smartphone size={12} color={mode === 'system' ? '#fff' : theme.textMuted} />
                <Text style={[styles.themeOptionText, { color: mode === 'system' ? '#fff' : theme.textMuted }]}>Auto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, mode === 'light' && { backgroundColor: theme.accentRose }]}
                onPress={() => setMode('light')}
              >
                <Sun size={12} color={mode === 'light' ? '#fff' : theme.textMuted} />
                <Text style={[styles.themeOptionText, { color: mode === 'light' ? '#fff' : theme.textMuted }]}>Light</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.themeOption, mode === 'dark' && { backgroundColor: theme.accentRose }]}
                onPress={() => setMode('dark')}
              >
                <Moon size={12} color={mode === 'dark' ? '#fff' : theme.textMuted} />
                <Text style={[styles.themeOptionText, { color: mode === 'dark' ? '#fff' : theme.textMuted }]}>Dark</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.menuHeading, { color: theme.textMuted }]}>MANAGEMENT SECTIONS</Text>

            {SECTIONS.map((section) => {
              const IconComp = section.icon;
              const isActive = activeSection === section.id;
              return (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: theme.sidebarItemActive, borderColor: theme.accentRose, borderWidth: 1 }
                  ]}
                  onPress={() => {
                    onSelectSection(section.id);
                    onClose();
                  }}
                >
                  <IconComp size={18} color={isActive ? theme.accentRose : theme.textMuted} />
                  <Text style={[styles.menuText, { color: isActive ? theme.textPrimary : theme.textMuted }, isActive && styles.activeMenuText]}>
                    {section.label}
                  </Text>

                  {section.confidential && (
                    <Text style={styles.confidentialBadge}>ADMIN ONLY</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Logout */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.sidebarHeader,
                borderTopColor: theme.border,
                paddingBottom: Math.max(insets.bottom, 16) + 6,
              },
            ]}
          >
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut size={16} color="#fb7185" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.75)' },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  drawerContainer: {
    width: '80%',
    maxWidth: 320,
    borderRightWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5 },
  titleCol: { flexDirection: 'column' },
  brandName: { fontSize: 16, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  appTitle: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  closeBtn: { padding: 4 },

  menuList: { flex: 1, padding: 12 },
  menuHeading: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8, marginTop: 12, paddingLeft: 8 },
  
  themeRow: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 8, borderWidth: 1 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6, borderRadius: 8 },
  themeOptionText: { fontSize: 11, fontWeight: '600' },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  menuText: { fontSize: 13, fontWeight: '500', flex: 1 },
  activeMenuText: { fontWeight: 'bold' },
  confidentialBadge: { fontSize: 8, fontWeight: 'bold', color: '#fb7185', backgroundColor: '#4c0519', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },

  footer: { padding: 16, borderTopWidth: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4c0519', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#9f1239' },
  logoutText: { color: '#fb7185', fontSize: 13, fontWeight: 'bold' },
});
