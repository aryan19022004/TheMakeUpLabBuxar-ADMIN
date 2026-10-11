import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu, Sun, Moon } from 'lucide-react-native';

import { api } from './src/services/api';
import Sidebar, { SECTIONS } from './src/components/Sidebar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServiceTypesScreen from './src/screens/ServiceTypesScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import EmployeesScreen from './src/screens/EmployeesScreen';
import TestimonialsScreen from './src/screens/TestimonialsScreen';
import CouponsScreen from './src/screens/CouponsScreen';
import CustomerCouponsScreen from './src/screens/CustomerCouponsScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import { getValidAuthToken, saveAuthToken, clearAuthToken } from './src/utils/token';
import { setOnUnauthorizedListener } from './src/services/api';

function MainApp() {
  const { theme, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const [stats, setStats] = useState({
    services: 0,
    appointments: 0,
    employees: 0,
    testimonials: 0,
    coupons: 0,
    galleryImages: 0,
  });

  useEffect(() => {
    checkToken();
    setOnUnauthorizedListener(() => {
      handleLogout();
    });
    return () => {
      setOnUnauthorizedListener(null);
    };
  }, []);

  const checkToken = async () => {
    try {
      const validToken = await getValidAuthToken();
      if (validToken) {
        setToken(validToken);
        loadDashboardStats();
      } else {
        setToken(null);
      }
    } catch (e) {
      console.error(e);
      setToken(null);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const [sRes, aRes, eRes, tRes, cRes, gRes] = await Promise.all([
        api.getServices(),
        api.getAppointments(),
        api.getEmployees(),
        api.getTestimonials(),
        api.getCoupons(),
        api.getParlourImages(),
      ]);

      setStats({
        services: sRes.data?.length || 0,
        appointments: aRes.data?.length || 0,
        employees: eRes.data?.length || 0,
        testimonials: tRes.data?.length || 0,
        coupons: cRes.data?.length || 0,
        galleryImages: gRes.data?.length || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = async (newToken: string, expiresAt?: number) => {
    await saveAuthToken(newToken, expiresAt);
    setToken(newToken);
    loadDashboardStats();
  };

  const handleLogout = async () => {
    await clearAuthToken();
    setToken(null);
    setSidebarOpen(false);
  };

  if (!token) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const currentSection = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <StatusBar barStyle={theme.statusBarStyle} />

      {/* Main App Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.topBarBg,
            borderBottomColor: theme.border,
            paddingTop: Math.max(insets.top, 12) + 4,
          },
        ]}
      >
        <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.chipBg, borderColor: theme.border, borderWidth: 1 }]} onPress={() => setSidebarOpen(true)}>
          <Menu size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <Image source={require('./src/assets/logo.jpg')} style={[styles.logo, { borderColor: theme.accentGold }]} />
          <View>
            <Text style={[styles.titleText, { color: theme.textPrimary }]}>TheMakeUpLab Admin app</Text>
            <Text style={[styles.sectionBadge, { color: theme.accentGold }]}>{currentSection.label}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.themeToggleBtn, { backgroundColor: theme.chipBg, borderColor: theme.border, borderWidth: 1 }]}
          onPress={() => setMode(theme.isDark ? 'light' : 'dark')}
        >
          {theme.isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#8b5cf6" />}
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSelectSection={(secId) => {
          setActiveSection(secId);
          if (secId === 'dashboard') loadDashboardStats();
        }}
        onLogout={handleLogout}
      />

      {/* Screen Renderer */}
      <View style={styles.screenArea}>
        {activeSection === 'dashboard' && (
          <DashboardScreen
            stats={stats}
            onNavigate={(secId) => setActiveSection(secId)}
            onRefresh={loadDashboardStats}
          />
        )}
        {activeSection === 'service-types' && <ServiceTypesScreen />}
        {activeSection === 'services' && <ServicesScreen />}
        {activeSection === 'appointments' && <AppointmentsScreen />}
        {activeSection === 'employees' && <EmployeesScreen />}
        {activeSection === 'testimonials' && <TestimonialsScreen />}
        {activeSection === 'coupons' && <CouponsScreen />}
        {activeSection === 'customer-coupons' && <CustomerCouponsScreen />}
        {activeSection === 'gallery' && <GalleryScreen />}
        {activeSection === 'settings' && <SettingsScreen />}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuBtn: { padding: 6, borderRadius: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 36, height: 36, borderRadius: 18, borderWidth: 1 },
  titleText: { fontSize: 15, fontWeight: 'bold' },
  sectionBadge: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  themeToggleBtn: { padding: 8, borderRadius: 10 },
  screenArea: { flex: 1 },
});
