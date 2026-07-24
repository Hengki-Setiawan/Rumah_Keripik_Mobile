import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, Phone, MapPin, MapPinned, PackageCheck, ChevronRight, Save } from 'lucide-react-native';
import { apiFetch } from '../../src/lib/api-client';

export default function ProfileScreen() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<{ id: number; label: string; addressText: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await apiFetch<{ profile: { nama: string | null; phone: string | null; email: string | null } | null; addresses: { id: number; label: string | null; addressText: string }[] }>('/api/public/me');
      if (res.ok && res.data) {
        const p = res.data.profile;
        if (p) { setNama(p.nama || ''); setPhone(p.phone || ''); setEmail(p.email || ''); }
        setSavedAddresses((res.data.addresses || []).map((a: any) => ({ id: a.id, label: a.label || 'Alamat', addressText: a.addressText })));
      }
      setLoading(false);
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    const res = await apiFetch('/api/public/me', {
      method: 'PATCH',
      body: JSON.stringify({ nama, phone, email }),
    });
    setSaving(false);
    if (res.ok) Alert.alert('✅ Berhasil', 'Profil tersimpan!');
    else Alert.alert('Gagal', res.error || 'Coba lagi');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={32} color="#ffffff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{nama}</Text>
            <Text style={styles.userPhone}>{phone}</Text>
          </View>
        </View>

        {/* Edit Profile Form */}
        <Text style={styles.sectionTitle}>Pengaturan Akun 👤</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={nama}
            onChangeText={setNama}
            placeholder="Nama Anda"
          />

          <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Nomor WhatsApp"
          />

          <Text style={styles.inputLabel}>Email (Opsional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="email@contoh.com"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Save size={16} color="#ffffff" />}
            <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Profil'}</Text>
          </TouchableOpacity>
        </View>

        {loading ? null : (
          <>
        <Text style={styles.sectionTitle}>Alamat Pengiriman Tersimpan 📍</Text>
        <View style={styles.card}>
          {savedAddresses.length === 0 ? (
            <Text style={{ color: '#92400e', fontSize: 12, paddingVertical: 8 }}>Belum ada alamat tersimpan</Text>
          ) : (
            savedAddresses.map((item) => (
              <View key={item.id} style={styles.addressRow}>
                <MapPin size={20} color="#d97706" />
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  <Text style={styles.addressText}>{item.addressText}</Text>
                </View>
              </View>
            ))
          )}
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/saya/alamat')}>
            <View style={styles.menuLeft}>
              <MapPinned size={20} color="#d97706" />
              <Text style={styles.menuText}>Kelola Alamat</Text>
            </View>
            <ChevronRight size={18} color="#92400e" />
          </TouchableOpacity>
        </View>
          </>
        )}

        {/* Order History Links */}
        <Text style={styles.sectionTitle}>Riwayat & Pelacakan 📦</Text>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => router.push('/saya/riwayat')}
        >
          <View style={styles.menuLeft}>
            <PackageCheck size={20} color="#d97706" />
            <Text style={styles.menuText}>Lihat Semua Pesanan Saya</Text>
          </View>
          <ChevronRight size={18} color="#92400e" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#d97706',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#b45309',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  userPhone: {
    fontSize: 12,
    color: '#fef3c7',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350f',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
    marginTop: 6,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#78350f',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  saveBtn: {
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  addressInfo: {
    marginLeft: 10,
    flex: 1,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
  addressText: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  menuRow: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#78350f',
  },
});
