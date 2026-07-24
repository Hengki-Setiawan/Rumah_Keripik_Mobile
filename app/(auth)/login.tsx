import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Nomor HP tidak valid (min 10 digit, awali 62)');
      return;
    }
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      Alert.alert('Error', 'PIN harus 4 digit angka');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      Alert.alert('Error', 'Nama wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const body = mode === 'register'
        ? JSON.stringify({ phone, pin, register: true, name: name.trim() })
        : JSON.stringify({ phone, pin });
      const res = await fetch('https://rumah-keripik.vercel.app/api/mobile/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();
      if (!data.ok) {
        Alert.alert('Error', data.error || 'Gagal');
        return;
      }
      const { setTokens } = await import('../../src/lib/api-client');
      await setTokens(data.accessToken, data.refreshToken);
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', 'Koneksi gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Rumah Keripik</Text>
        <Text style={styles.subtitle}>{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}</Text>

        {mode === 'register' && (
          <TextInput
            style={styles.input}
            placeholder="Nama lengkap"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="No. HP (62xxx)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="PIN 4 digit"
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{mode === 'login' ? 'Masuk' : 'Daftar'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6ef' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#c55a2b', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5dcc9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#c55a2b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchBtn: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#c55a2b', fontSize: 14 },
});
