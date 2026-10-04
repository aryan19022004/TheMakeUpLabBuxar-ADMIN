import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Lock, User, Sparkles, } from 'lucide-react-native';
import { api, } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { theme } = useTheme();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      setLoading(true);

      const res = await api.login({ username, password });
      if (res.success && res.data?.token) {
        onLoginSuccess(res.data.token);
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid admin credentials');
      }
    } catch (err: any) {
      Alert.alert('Connection Error', err.message || 'Could not connect to Next.js API server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <StatusBar barStyle={theme.statusBarStyle} />
      <View style={styles.content}>
        
        {/* Logo & Brand Header */}
        <View style={styles.header}>
          <Image source={require('../assets/logo.jpg')} style={[styles.logo, { borderColor: theme.accentGold }]} />
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>TheMakeUpLab</Text>
          <View style={styles.badgeRow}>
            <Sparkles size={12} color={theme.accentGold} />
            <Text style={[styles.brandSub, { color: theme.accentGold }]}>Admin Control App</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Admin Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <User size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={username}
                onChangeText={setUsername}
                placeholder="admin"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.bgInput, borderColor: theme.border }]}>
              <Lock size={16} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="admin123"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {/* Environment Status Badge */}
          

          <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.accentRose }]} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 24, maxWidth: 450, width: '100%', alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, marginBottom: 12 },
  brandTitle: { fontSize: 28, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  brandSub: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },

  card: { borderRadius: 24, padding: 24, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  cardHeading: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14 },

  envBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 8, justifyContent: 'center' },
  envBadgeText: { fontSize: 11, fontWeight: '500' },

  loginBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
