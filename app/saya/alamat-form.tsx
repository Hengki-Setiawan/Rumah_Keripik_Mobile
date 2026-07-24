import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../src/lib/api-client';

const LABELS = ['Rumah', 'Kantor', 'Lainnya'];

export default function AlamatFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId ? parseInt(params.editId as string) : null;

  const [label, setLabel] = useState('Rumah');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressText, setAddressText] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) loadExisting();
  }, [editId]);

  async function loadExisting() {
    const res = await apiFetch<{ addresses: any[] }>('/api/public/me');
    if (res.ok && res.data) {
      const addr = res.data.addresses.find((a: any) => a.id === editId);
      if (addr) {
        setLabel(addr.label || 'Rumah');
        setRecipientName(addr.recipientName || '');
        setPhone(addr.phone || '');
        setAddressText(addr.addressText || '');
        setLandmark(addr.landmark || '');
        setIsDefault(addr.isDefault === 1);
      }
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!recipientName.trim()) { Alert.alert('Lengkapi', 'Nama penerima wajib diisi'); return; }
    if (!phone.trim() || phone.length < 8) { Alert.alert('Lengkapi', 'Nomor HP valid wajib diisi'); return; }
    if (!addressText.trim() || addressText.length < 8) { Alert.alert('Lengkapi', 'Alamat minimal 8 karakter'); return; }

    setSaving(true);
    const payload: Record<string, any> = {
      label,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      addressText: addressText.trim(),
      landmark: landmark.trim() || undefined,
      isDefault,
    };
    if (editId) payload.id = editId;

    const res = await apiFetch('/api/public/me', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      Alert.alert('Berhasil', editId ? 'Alamat diperbarui' : 'Alamat ditambahkan');
      router.back();
    } else {
      Alert.alert('Gagal', res.error || 'Coba lagi');
    }
  }

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#faf6ef', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#c55a2b" />
    </View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: editId ? 'Edit Alamat' : 'Tambah Alamat', headerShown: true, headerStyle: { backgroundColor: '#faf6ef' }, headerTintColor: '#333' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Label Alamat</Text>
        <View style={styles.labelRow}>
          {LABELS.map((l) => (
            <TouchableOpacity key={l} onPress={() => setLabel(l)}
              style={[styles.labelBtn, label === l && styles.labelBtnActive]}>
              <Text style={[styles.labelBtnText, label === l && styles.labelBtnTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nama Penerima</Text>
        <TextInput style={styles.input} value={recipientName} onChangeText={setRecipientName} placeholder="Nama penerima" />

        <Text style={styles.label}>Nomor HP</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08123456789" />

        <Text style={styles.label}>Alamat Lengkap</Text>
        <TextInput style={[styles.input, styles.textArea]} value={addressText} onChangeText={setAddressText} multiline numberOfLines={3} placeholder="Jl. nama jalan, RT/RW, kelurahan, kecamatan" />

        <Text style={styles.label}>Patokan (opsional)</Text>
        <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} placeholder="Dekat pasar / masjid" />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Jadikan alamat utama</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: '#c55a2b' }} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'Simpan Perubahan' : 'Tambah Alamat'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf6ef' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  labelRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  labelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0dfca' },
  labelBtnActive: { backgroundColor: '#c55a2b' },
  labelBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  labelBtnTextActive: { color: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#e5dcc9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e5dcc9' },
  switchLabel: { fontSize: 14, color: '#333' },
  saveBtn: { backgroundColor: '#c55a2b', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
