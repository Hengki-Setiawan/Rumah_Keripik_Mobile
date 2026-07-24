import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../src/theme';
import { getSavedAddresses, apiFetch } from '../../src/lib/api-client';

interface Address {
  id: number;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  addressText: string;
  landmark: string | null;
  latitude: string | null;
  longitude: string | null;
  isDefault: number;
}

export default function AlamatScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedAddresses();
      setAddresses(data as Address[]);
    } catch { setAddresses([]); }
    setLoading(false);
  }, []);

  async function handleDelete(id: number) {
    Alert.alert('Hapus Alamat?', 'Alamat akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        const res = await apiFetch('/api/public/me', { method: 'DELETE', body: JSON.stringify({ addressId: id }) });
        if (res.ok) load();
        else Alert.alert('Gagal', res.error || 'Coba lagi');
      }},
    ]);
  }

  async function handleSetDefault(item: Address) {
    const res = await apiFetch('/api/public/me', {
      method: 'POST',
      body: JSON.stringify({
        id: item.id,
        label: item.label || 'Alamat',
        recipientName: item.recipientName || '',
        phone: item.phone || '',
        addressText: item.addressText,
        isDefault: true,
      }),
    });
    if (res.ok) load();
    else Alert.alert('Gagal', res.error || 'Coba lagi');
  }

  async function handleAdd() {
    router.push('/(auth)/login');
  }

  const iconMap: Record<string, React.ReactNode> = {
    rumah: <Home size={18} color={colors.accent} />,
    kantor: <Briefcase size={18} color={colors.accent} />,
    lainnya: <MapPin size={18} color={colors.accent} />,
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Alamat Saya', headerShown: true, headerStyle: { backgroundColor: '#faf6ef' }, headerTintColor: '#333' }} />
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>Belum ada alamat tersimpan</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSetDefault(item)}>
              <View style={styles.cardHeader}>
                <View style={styles.labelRow}>
                  {iconMap[item.label?.toLowerCase() || 'lainnya'] || <MapPin size={18} color={colors.accent} />}
                  <Text style={styles.label}>{item.label || 'Alamat'}</Text>
                  {item.isDefault === 1 && (
                    <View style={styles.defaultBadge}>
                      <Check size={10} color="#fff" />
                      <Text style={styles.defaultText}>Utama</Text>
                    </View>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.name}>{item.recipientName || 'Penerima'}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.address}>{item.addressText}</Text>
              {item.landmark ? <Text style={styles.landmark}>Patokan: {item.landmark}</Text> : null}
            </TouchableOpacity>
          )}
        />
      )}
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Plus size={20} color="#fff" />
        <Text style={styles.addBtnText}>Tambah Alamat Baru</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6ef' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e5dcc9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#2e7d32', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 },
  name: { fontSize: 14, fontWeight: '500', color: '#333' },
  phone: { fontSize: 12, color: '#666', marginTop: 2 },
  address: { fontSize: 13, color: '#444', marginTop: 4, lineHeight: 18 },
  landmark: { fontSize: 12, color: '#c55a2b', marginTop: 4 },
  addBtn: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#c55a2b', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
